# SEIS — Architecture & Data Flow

> Swimming Eagles Invitational Series website.
> Last updated: April 27 2026.

---

## 1. Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, React Router v6 |
| **Styling** | Tailwind CSS, custom design tokens in `tailwind.config.js` |
| **Database** | Supabase (PostgreSQL + Row Level Security) |
| **Auth** | Supabase GoTrue (email/password, admin-only) |
| **Hosting** | Vercel (static SPA + `vercel.json` headers/rewrites) |
| **Images** | Google Drive thumbnails via `driveUrl()` helper |

---

## 2. Project Structure

```
Invitational/
├── public/                  # Static assets (og-image.png, favicon.svg, sitemap.xml)
├── scripts/
│   ├── build-sitemap.mjs    # Pre-build sitemap generator
│   └── gen-og-image.mjs     # OG image generator (SVG → PNG)
├── supabase/
│   └── migrations/          # SQL migrations (run manually in Supabase SQL Editor)
├── src/
│   ├── main.jsx             # App entry point, ?reset=1 escape hatch
│   ├── App.jsx              # Router, VisibleRoute guard, layout shell
│   ├── lib/
│   │   ├── supabase.js      # Supabase client init (env vars)
│   │   ├── SiteContext.jsx   # Global data provider (settings, seasons, pages, media)
│   │   ├── AuthContext.jsx   # Admin auth (isAdmin RPC, localStorage cache, signOut)
│   │   ├── hooks.js          # Data hooks (useContent, useEvents, useSessions, etc.)
│   │   ├── constants.js      # Shared domain constants (program types)
│   │   ├── sanitize.js       # HTML sanitizer for CMS HTML blocks
│   │   └── utils.js          # Misc utilities
│   ├── components/
│   │   ├── public/           # Navbar, Footer, PageHeader, Breadcrumb, SeasonToggle, etc.
│   │   └── admin/            # AdminLayout (auth guard), AdminNav (sidebar)
│   ├── pages/
│   │   ├── public/           # 13 public pages
│   │   └── admin/            # 12 admin pages (lazy-loaded)
│   └── styles/
│       └── index.css         # Tailwind imports + custom component classes
├── index.html               # HTML shell, OG/Twitter meta tags, CSP
├── vercel.json              # Headers (CSP, cache), SPA rewrites
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## 3. Database Tables

### Core Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `site_settings` | Singleton row (id=1). Global config. | `site_title`, `active_season`, integration URLs, contact emails, hero badges, fee info |
| `seasons` | Meet seasons (Fall 2026, Spring 2027…) | `slug` (PK-like), `label`, `dates_display`, `age_up_date`, `is_current`, `session_times_json`, `warmup_schedule_text` |
| `pages` | CMS page registry. Controls nav + visibility. | `slug` (unique), `title`, `is_visible`, `nav_label`, `nav_order` |
| `content_blocks` | CMS content per page. Key-value with types. | `page_slug` → `pages.slug`, `block_key` (unique per page), `block_type` (text/html/json/list/table), `content` |
| `events` | Meet events (64+ per season) | `event_number`, `gender`, `event_name`, `distance`, `stroke`, `age_group`, `format`, `day` (1\|2), `session` (morning\|evening), `sort_order`, `season_slug`, `is_break` |
| `meet_sessions` | Session schedule per day per season | `season_slug`, `day` (1\|2), `title`, `description`, `start_time`, `sort_order` |
| `scoring_table` | Points table (place → individual/relay pts) | `place`, `individual_points`, `relay_points` |
| `media` | Image registry (slug → Google Drive URL) | `slug`, `label`, `google_drive_url`, `alt_text` |
| `programs` | Downloadable documents per season | `season_slug`, `program_type` (entry_file/heat_sheet/psych_sheet/program_booklet), `google_drive_url`, `is_published` |
| `bank_details` | Bank transfer info for payments | `bank_name`, `account_number`, `swift_iban`, `is_published` |
| `schema_migrations` | Tracks which SQL migrations have been applied | `filename` (PK), `applied_at` |

### RLS Policy Pattern

Every table uses the same two-tier policy:
- **Public read** — `anon` role can SELECT (some tables filter by `is_visible` or `is_published`)
- **Admin full access** — `authenticated` role has ALL (insert/update/delete)

Admin identity verified server-side via `is_current_user_admin` RPC (checks `admin_users` table).

---

## 4. Data Flow — Who Reads What

### 4.1 Global Context (`SiteContext`)

Loaded **once on app mount**, cached in React state, provides `useSite()` hook.

```
SiteContext.fetchAll() → parallel Supabase queries:
  ├── site_settings (single row)
  ├── seasons (all, ordered by slug)
  ├── pages (all, ordered by nav_order)
  └── media (all, keyed by slug)
```

**Exposed to all components:**
`settings`, `seasons`, `currentSeason`, `pages`, `media`, `switchSeason()`, `getMediaUrl()`, `refetch()`

### 4.2 Page-Level Hooks

| Hook | Table | Used By |
|------|-------|---------|
| `useContent(pageSlug)` | `content_blocks` WHERE `page_slug = ?` | Every page that renders CMS text. Returns `{ blocks, loading }` where `blocks` is a `{ block_key: content }` map. JSON/list/table types are auto-parsed. |
| `useEvents(day, session, seasonSlug)` | `events` (filtered) | Schedule, Home (preview), Events admin |
| `useSessions(seasonSlug)` | `meet_sessions` (filtered) | Sessions page, Schedule page, Events admin |
| `useScoring()` | `scoring_table` | MeetInfo |
| `usePrograms(seasonSlug)` | `programs` (filtered) | Programs page, ProgramsAdmin |
| `useBankDetails()` | `bank_details` WHERE `is_published` | Fees page |
| `useAdminTable(table)` | Any table | Admin pages (generic CRUD helper) |

### 4.3 Public Page → Data Source Map

| Public Page | Route | Data Sources |
|-------------|-------|-------------|
| **Home** | `/` | `useSite()` (settings, seasons, currentSeason, media), `useContent('home')`, `useContent('contact')`, `useContent('schedule')`, `useEvents()` |
| **Meet Info** | `/meet-info` | `useSite()`, `useContent('meet-info')`, `useContent('contact')`, `useScoring()` |
| **Schedule** | `/schedule` | `useSite()`, `useContent('schedule')`, `useEvents()`, `useSessions()` |
| **Sessions** | `/sessions` | `useSite()`, `useContent('sessions')`, `useContent('schedule')`, `useSessions()` |
| **Warmup** | `/warmup` | `useSite()`, `useContent('warmup')` |
| **Entries** | `/entries` | `useSite()`, `useContent('entries')` |
| **Programs** | `/programs` | `useSite()`, `useContent('programs')`, `usePrograms()` |
| **Fees** | `/fees` | `useSite()`, `useContent('fees')`, `useBankDetails()` |
| **Results** | `/results` | `useSite()`, `useContent('results')` |
| **Stream** | `/stream` | `useSite()`, `useContent('stream')` |
| **Contact** | `/contact` | `useSite()`, `useContent('contact')` |
| **FAQ** | `/faq` | `useSite()`, `useContent('faq')` |

### 4.4 Admin Page → Table Map

| Admin Page | Route | Tables (CRUD) |
|------------|-------|--------------|
| **Dashboard** | `/admin` | Reads: `events`, `content_blocks`, `media` (counts). Export: all tables. |
| **Settings** | `/admin/settings` | `site_settings` |
| **Seasons** | `/admin/seasons` | `seasons`, `programs` (auto-creates slots) |
| **Pages** | `/admin/pages` | `pages` |
| **Content** | `/admin/content` | `content_blocks` |
| **Events** | `/admin/events` | `events`, `meet_sessions` (Sessions CRUD section) |
| **Scoring** | `/admin/scoring` | `scoring_table` |
| **Media** | `/admin/media` | `media` |
| **Programs** | `/admin/programs` | `programs` |
| **Fees** | `/admin/fees` | `bank_details` |
| **Integrations** | `/admin/integrations` | `site_settings` (URL fields only) |

### 4.5 Site Context Cache

On mount, `SiteContext` checks `sessionStorage('seis_site_cache')` for a cached payload younger than **5 minutes**. If valid, it skips the 4 Supabase queries entirely. `refetch()` (used by admin saves) always bypasses the cache.

### 4.6 Google Drive Image Fallbacks

All `<img>` tags rendering Drive URLs include `onError={onImgError}`. If the Drive thumbnail fails (rate limit, permission, network), the handler swaps `src` to a local static fallback in `public/fallbacks/`. The `FALLBACK_MAP` in `hooks.js` maps media slugs to fallback paths.

---

## 5. Auth Flow

```
Login.jsx
  └── supabase.auth.signInWithPassword()
        └── triggers AuthContext.onAuthStateChange
              └── verifyAdmin(session)
                    ├── Fast path: read seis_admin_cache from localStorage (1hr TTL)
                    └── Slow path: supabase.rpc('is_current_user_admin') with 15s timeout
                          └── writeAdminCache(uid, isAdmin)

AdminLayout.jsx
  ├── if (!user) → redirect to /admin/login
  ├── if (isAdmin === null) → show loading
  ├── if (user && isAdmin === false) → debounced signOut (600ms)
  └── if (user && isAdmin === true) → render admin page

signOut()
  └── supabase.auth.signOut()
  └── clear seis_admin_cache
  └── clear user/isAdmin state
```

**Escape hatches:**
- `?reset=1` on any URL → wipes all localStorage/sessionStorage/caches/SW
- "Reset local session" button in AdminNav sidebar
- "Clear stored login" link on Login page

---

## 6. Content Block System

Content blocks are the CMS backbone. Each page has multiple blocks identified by `page_slug` + `block_key`.

### Block Types

| Type | Storage | Parsing |
|------|---------|---------|
| `text` | Plain string | Rendered as-is |
| `html` | HTML string | Sanitized via `sanitizeHtml()` then `dangerouslySetInnerHTML` |
| `json` | JSON string | Auto-parsed into object/array by `useContent()` |
| `list` | JSON array string | Auto-parsed into array |
| `table` | JSON array string | Auto-parsed, rendered with `DataTable` component |

### Content Block Examples

```
Page: home
  ├── about_p1 (text) → "The Swimming Eagles Invitational..."
  ├── registration_steps (json) → [{"num":"1","text":"Submit this form"},...]
  └── format_card_1_content (json) → [{"label":"Individual","value":"9-7-6-5-4-3-2-1"},...]

Page: contact
  ├── meet_director_name (text) → "TBC"
  ├── venue_address_line (text) → "Cairo American College, Road 253, Maadi, Cairo, Egypt"
  └── venue_maps_embed_url (text) → "https://www.google.com/maps/embed?pb=..."

Page: meet-info
  ├── entry_limits_table (table) → [{"category":"Individual Events","limit":"5 per swimmer"},...]
  └── entry_policy_text (list) → ["Deadline: 72 hours before the meet","Format: Hy-Tek..."]
```

---

## 7. Routing & Page Visibility

```
App.jsx
  ├── Public routes use <VisibleRoute slug="..." element={...} />
  │     └── Checks pages table: if is_visible === false → shows <NotFound />
  ├── Admin routes: no visibility guard, but wrapped in <AdminLayout> (auth guard)
  └── Navbar reads pages from SiteContext, only shows where is_visible && nav_label
```

Hidden pages (currently: entries, programs, results, stream, warmup):
- Not shown in navigation
- Direct URL returns 404
- Can be re-enabled by admin in Pages admin → toggle `is_visible`

---

## 8. Season System

- Each season has a `slug` (e.g. `fall_2026`) used as FK in `events`, `meet_sessions`, `programs`
- One season is `is_current = true` (set via `set_active_season` RPC)
- Public visitors can switch seasons via `<SeasonToggle>` (stored in localStorage)
- `SiteContext.currentSeason` = visitor's chosen season or the active one

---

## 9. Images

All images go through Google Drive:
1. Admin uploads to Drive, pastes URL in Admin → Media
2. `media` table stores `slug` → `google_drive_url`
3. `SiteContext.getMediaUrl(slug)` returns the raw URL
4. `driveUrl(url, width)` in `hooks.js` converts to thumbnail URL: `https://drive.google.com/thumbnail?id=...&sz=w{width}`

Media slugs: `hero-photo`, `seis-logo`, `cac-swimming`, `screaming-eagle`

---

## 10. Build & Deploy

```bash
npm run build          # Vite build → dist/  (then)→ build-sitemap.mjs
npm run db:push        # Push migrations to production via Supabase CLI

# Deployed via Vercel:
# - Push to master → auto-deploy
# - vercel.json: SPA rewrites, security headers, CSP, cache rules
```

### Key Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `VITE_SUPABASE_URL` | `.env` + Vercel | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `.env` + Vercel | Supabase anon key (public, RLS-protected) |
| `SUPABASE_DB_URL` | Local only | Direct DB connection string for `npm run db:push` |

---

## 11. Migrations

Migrations are in `supabase/migrations/` and can be applied via `npm run db:push` (Supabase CLI) or manually in the SQL Editor. They are numbered by timestamp:

| Migration | Purpose |
|-----------|---------|
| `20260101000000_initial_schema.sql` | All tables, RLS, seed data, scoring, events, content blocks |
| `20260420000000_admin_rls.sql` | Admin user table + `is_current_user_admin` RPC |
| `20260420210000_audit_fixes.sql` | Season slug on events, `set_active_season` RPC |
| `20260420214500_content_audit.sql` | Content block updates, entry_policy_text → list |
| `20260420220000_content_audit_2.sql` | More content fixes |
| `20260420223000_schedule_titles.sql` | Schedule day/session labels as content blocks |
| `20260421000000_audit_round4.sql` | Additional audit fixes |
| `20260421003000_programs_copy.sql` | Programs page content blocks |
| `20260424000000_audit_v3.sql` | Meet director, venue, Google Form embed fixes |
| `20260426000000_rename_eagle_media.sql` | Media slug rename |
| `20260426000001_cms_copy_and_event50.sql` | CMS copy blocks, event #50 gap fix |
| `20260426000002_audit_v5_fixes.sql` | Hide pages, contact title, deadline blocks, maps embed |
| `20260426000003_sessions_table.sql` | `meet_sessions` table + seed data |
| `20260427000000_audit_v6.sql` | Indexes, `start_time` semantics, `schema_migrations` table |
