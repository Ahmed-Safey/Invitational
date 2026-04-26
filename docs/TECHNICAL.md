# SEIS — Technical Reference

> Every implementation detail, config value, security measure, and pattern used in the codebase.
> Last updated: April 26, 2026.

---

## 1. Dependencies

### Production

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^18.3.1 | UI framework |
| `react-dom` | ^18.3.1 | React DOM renderer |
| `react-router-dom` | ^6.26.0 | Client-side routing (SPA) |
| `@supabase/supabase-js` | ^2.45.0 | Supabase client (DB queries, auth, RPC, realtime) |
| `dompurify` | ^3.4.1 | HTML sanitization for CMS `html`-type content blocks |
| `react-hot-toast` | ^2.4.1 | Toast notifications (admin CRUD feedback) |

### Dev

| Package | Version | Purpose |
|---------|---------|---------|
| `vite` | ^5.4.0 | Build tool + dev server |
| `@vitejs/plugin-react` | ^4.3.1 | JSX/React fast-refresh support |
| `tailwindcss` | ^3.4.10 | Utility-first CSS framework |
| `postcss` | ^8.4.41 | CSS processing pipeline |
| `autoprefixer` | ^10.4.20 | Vendor prefix injection |
| `supabase` | ^2.92.1 | Supabase CLI (migration management, local dev) |

---

## 2. Build Pipeline

```
npm run dev         → vite (HMR dev server, port 5173)
npm run build       → vite build → dist/   (then)→ node scripts/build-sitemap.mjs
npm run preview     → vite preview (serve dist/ locally)
```

### Vite Config (`vite.config.js`)

- Single plugin: `@vitejs/plugin-react`
- No custom aliases, proxies, or chunk splitting config
- Output: `dist/assets/index-[hash].js` + `dist/assets/index-[hash].css`
- Admin pages lazy-loaded via `React.lazy()` → separate `Events-[hash].js`, `Seasons-[hash].js`, etc.

### PostCSS Config (`postcss.config.js`)

- `tailwindcss` → `autoprefixer` pipeline
- Tailwind scans `index.html` + `src/**/*.{js,jsx}`

### Build-Time Sitemap (`scripts/build-sitemap.mjs`)

- Runs after `vite build` as postbuild
- Fetches visible pages from Supabase REST API (`pages?is_visible=eq.true`)
- Falls back to hardcoded routes if Supabase env vars are missing
- Outputs `dist/sitemap.xml` with per-page `<priority>` and `<changefreq>`

---

## 3. Environment Variables

| Variable | Required | Where Set | Purpose |
|----------|----------|-----------|---------|
| `VITE_SUPABASE_URL` | Yes | `.env` + Vercel | Supabase project URL (e.g. `https://xyz.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Yes | `.env` + Vercel | Supabase anon key (public, RLS-protected) |
| `SITE_URL` | No | Vercel only | Production URL for sitemap (defaults to `https://swimming-eagles-invitational.vercel.app`) |

**Missing env vars** → `configError` is set in `supabase.js` → app renders `<ErrorScreen>` instead of hanging.

---

## 4. Supabase Client (`src/lib/supabase.js`)

- Creates client with `createClient(url, anonKey)`
- If env vars are missing, uses placeholder URL/key so the app can still render an error screen
- Exports `configError` (string or null) checked by `App.jsx` on mount

---

## 5. Security

### 5.1 Content Security Policy (CSP)

Set via `vercel.json` response header on all routes:

```
default-src   'self'
script-src    'self' 'unsafe-inline' blob:
worker-src    'self' blob:
style-src     'self' 'unsafe-inline' https://fonts.googleapis.com
font-src      'self' https://fonts.gstatic.com
img-src       'self' data: https: blob:
connect-src   'self' https://*.supabase.co wss://*.supabase.co
frame-src     https://docs.google.com https://drive.google.com https://www.google.com
              https://www.youtube.com https://youtube.com
frame-ancestors 'none'
base-uri      'self'
form-action   'self'
```

### 5.2 Other Security Headers

| Header | Value | Purpose |
|--------|-------|---------|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Force HTTPS for 2 years |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME-type sniffing |
| `X-Frame-Options` | `DENY` | Prevent this site from being framed |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limit referrer leakage |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), interest-cohort=()` | Disable device APIs + FLoC |

### 5.3 Row Level Security (RLS)

Every table has RLS enabled. Two-tier policy:

| Policy | Rule | Effect |
|--------|------|--------|
| `anon_read_*` | `FOR SELECT USING (true)` (or `is_visible`/`is_published` filter) | Public visitors can read |
| `auth_all_*` | `FOR ALL USING (auth.role() = 'authenticated')` | Logged-in users have full CRUD |

Admin identity enforced via `is_current_user_admin` RPC which checks `admin_users` table.

### 5.4 HTML Sanitization (`src/lib/sanitize.js`)

- Uses DOMPurify for CMS `html`-type blocks
- **Allowed tags**: `p`, `br`, `strong`, `b`, `em`, `i`, `u`, `s`, `h1`–`h6`, `ul`, `ol`, `li`, `a`, `span`, `div`, `table`, `thead`, `tbody`, `tr`, `td`, `th`, `blockquote`, `code`, `pre`, `hr`
- **Allowed attrs**: `href`, `target`, `rel`, `title`, `class`, `colspan`, `rowspan`
- **Blocked**: `<script>`, `<iframe>`, `<object>`, `<embed>`, event handlers (`onclick`, etc.)
- Defense-in-depth: RLS + `is_admin()` locks writes, sanitizer blocks XSS if credentials leak

### 5.5 Google Maps Embed Security

- Iframes use `referrerPolicy="no-referrer-when-downgrade"` and `loading="lazy"`
- Embed URL stored in CMS (`venue_maps_embed_url` content block), not hardcoded
- `frame-src` in CSP explicitly allows `https://www.google.com`

---

## 6. Authentication System (`src/lib/AuthContext.jsx`)

### Flow

1. **`getSession()`** — Supabase resolves stored session (may take up to 6s if lock recovery needed)
2. **Admin cache check** — Read `seis_admin_cache` from localStorage. If valid (same UID, <1 hour old), trust it
3. **RPC verification** — `supabase.rpc('is_current_user_admin')` with 15s timeout via `Promise.race()`
4. **Cache write** — Store `{ uid, ts }` in localStorage on success
5. **`onAuthStateChange`** — Only re-verifies if UID actually changed (skips TOKEN_REFRESHED events)

### Constants

| Constant | Value | Purpose |
|----------|-------|---------|
| `ADMIN_RPC_TIMEOUT_MS` | `15000` (15s) | Max wait for is_admin RPC (slow venue Wi-Fi) |
| `ADMIN_CACHE_KEY` | `seis_admin_cache` | localStorage key for admin status cache |
| `ADMIN_CACHE_TTL_MS` | `3600000` (1 hour) | How long to trust the cached admin result |

### Race Condition Prevention

- `verifyInFlightRef` — prevents two concurrent RPC calls (GoTrue lock contention)
- `lastVerifiedUserIdRef` — skips re-verification for same UID
- `isAdmin` starts as `null` (not `false`) — prevents premature redirect during RPC resolution

### AdminLayout Guard

```
if (loading) → <Loading />
if (!user) → redirect to /admin/login
if (isAdmin === null) → <Loading /> (RPC still resolving)
if (isAdmin === false) → debounced signOut (600ms) then redirect
if (isAdmin === true) → render admin page
```

Debounce prevents transient `false` during token refresh from triggering logout.

---

## 7. Global Data Layer (`src/lib/SiteContext.jsx`)

### What It Fetches (on mount, parallel)

| Query | Stored As | Accessed Via |
|-------|-----------|-------------|
| `site_settings` (single row) | `settings` | `useSite().settings` |
| `seasons` (ordered by slug) | `seasons[]` | `useSite().seasons` |
| `pages` (ordered by nav_order) | `pages[]` | `useSite().pages` |
| `media` (all) | `media{}` (slug-keyed map) | `useSite().getMediaUrl(slug)` |

### Season Switching

- `activeSeason` stored in `localStorage('seis_season')`
- Validated against loaded seasons on mount — falls back to `settings.active_season` if invalid
- `currentSeason` = season matching `activeSeason` slug, or first season
- `switchSeason(slug)` updates both state and localStorage
- `<SeasonToggle>` component renders a dropdown on public pages

### Exposed Values

```js
{ settings, seasons, pages, media, currentSeason, activeSeason,
  switchSeason, getMediaUrl, loading, error, refetch }
```

---

## 8. Data Hooks (`src/lib/hooks.js`)

### `useContent(pageSlug)`

- Fetches `content_blocks` WHERE `page_slug = ?`, ordered by `sort_order`
- Returns `{ blocks: { [block_key]: parsedContent }, loading }`
- Auto-parses `json`/`list`/`table` block types via `JSON.parse()`
- Falls back to raw string with console warning on parse failure

### `useEvents(day, session, seasonSlug)`

- Fetches `events` with optional filters, ordered by `day` → `sort_order`
- Returns `{ events[], loading }`

### `useSessions(seasonSlug)`

- Fetches `meet_sessions` WHERE `season_slug = ?`, ordered by `day` → `sort_order`
- Returns `{ sessions[], loading }`

### `useScoring()`

- Fetches `scoring_table` ordered by `place`
- Returns `{ scoring[], loading }`

### `usePrograms(seasonSlug)`

- Fetches `programs` WHERE `season_slug = ?`
- Returns `programs[]`

### `useBankDetails()`

- Fetches `bank_details` WHERE `is_published = true` (single row)
- Returns `bank` (object or null)

### `driveUrl(url, width)`

- Converts Google Drive share URL to thumbnail URL
- Extracts file ID from `/d/{id}/` pattern
- Returns `https://drive.google.com/thumbnail?id={id}&sz=w{width}`

### `useAdminTable(table, orderBy)`

- Generic admin helper: fetches all rows from any table
- Returns `{ data[], loading, reload }`

---

## 9. Routing

### Public Routes

All public routes (except Home) wrapped in `<VisibleRoute>`:

```jsx
<VisibleRoute slug="meet-info" element={<MeetInfo />} />
```

`VisibleRoute` checks `pages.find(p => p.slug === slug)`:
- If page not found or `is_visible === false` → renders `<NotFound />`
- Otherwise → renders the element

### Admin Routes

- Lazy-loaded via `React.lazy()` → code-split into separate chunks
- Wrapped in `<AdminLayout>` which enforces auth
- Not visible to public visitors in any way

### SPA Rewrites (`vercel.json`)

```json
{ "source": "/((?!.*\\.)(.))", "destination": "/index.html" }
```

All non-file requests → `index.html` (React Router handles client-side).

---

## 10. Styling

### Design Tokens (`tailwind.config.js`)

| Token | Value | Usage |
|-------|-------|-------|
| `crimson` | `#8e191c` | Primary brand color, buttons, accents |
| `crimson-dark` | `#6a1215` | Hover states |
| `gold` | `#c6ba8e` | Secondary brand color, labels, nav highlights |
| `gold-dark` | `#a89d74` | Relay border accents |
| `cream` | `#f9f8f4` | Page background |
| `cream-mid` | `#ece7d0` | Card borders, table alternates |
| `charcoal` | `#222222` | Dark text, table headers |

### Fonts

| Font | Weight(s) | Usage |
|------|----------|-------|
| `Oswald` | 300–700 | Headings, labels, buttons, nav (uppercase tracking) |
| `Crimson Pro` | 300, 400, 600 (+ italic) | Body text, paragraphs |

Loaded via Google Fonts with `preconnect` hints in `index.html`.

### Component Classes (`src/styles/index.css`)

**Public:**
- `.btn-primary` — Crimson background, white text, Oswald font
- `.btn-outline` — Transparent, gold border, gold text
- `.section-label` — Tiny uppercase crimson label
- `.section-title` — Large bold uppercase heading
- `.divider` — 48px crimson bar
- `.info-card` — White card with crimson top border, hover → gold

**Admin:**
- `.admin-sidebar` — Fixed dark sidebar (w-64)
- `.admin-content` — Main area with left margin on desktop
- `.admin-card` — White rounded card with shadow
- `.admin-input` — Standard form input with focus ring
- `.admin-btn` / `.admin-btn-outline` — Admin action buttons
- `.admin-table` / `th` / `td` — Data table styling
- `.status-active` / `.status-inactive` — Badge pills

### Animations

- `.animate-fade-up` — 0.8s ease translateY(20→0) + fade
- `.animate-fade-up-delay-1` through `-delay-4` — staggered entrance (0.1s–0.55s delay)
- `@media (prefers-reduced-motion: reduce)` — kills all animations/transitions for accessibility

---

## 11. Error Handling

### Layer 1: ErrorBoundary (`src/components/ErrorBoundary.jsx`)

- React class component wrapping the entire app
- Catches render errors → shows branded error screen with "Reload Page" button
- In DEV mode: shows full stack trace
- Inline styles (no Tailwind dependency) so it works even if CSS fails to load

### Layer 2: Chunk Load Recovery (`src/main.jsx`)

- Detects `Loading chunk failed` / `Failed to fetch dynamically imported module` errors
- Auto-reloads page once (guarded by `sessionStorage('seis_chunk_reload_attempt')`)
- Clears flag on successful `window.load` event
- Handles stale tabs after Vercel deploys with new chunk hashes

### Layer 3: Reset Escape Hatch (`?reset=1`)

- Adding `?reset=1` to any URL wipes:
  - `localStorage` (all keys)
  - `sessionStorage` (all keys)
  - All CacheStorage caches
  - All registered Service Workers
- Redirects to same URL without the query param via `location.replace()`

### Layer 4: ErrorScreen Component

- Shown when Supabase env vars are missing or initial data fetch fails
- Branded full-screen error with message display

---

## 12. Caching Strategy

### Browser Caching (`vercel.json`)

| Route Pattern | Cache-Control | Purpose |
|---------------|--------------|---------|
| `/assets/*` | `public, max-age=31536000, immutable` | Hashed JS/CSS bundles — cache forever |
| Everything else | `no-store, max-age=0` | HTML shell + API calls — always fresh |

### In-App Caching

| Cache | Storage | TTL | Purpose |
|-------|---------|-----|---------|
| Admin status | `localStorage('seis_admin_cache')` | 1 hour | Skip `is_admin` RPC on refresh |
| Season preference | `localStorage('seis_season')` | Permanent | Remember visitor's season choice |
| Chunk reload flag | `sessionStorage('seis_chunk_reload_attempt')` | Session | Prevent reload loops |

### `index.html` Meta Tag

```html
<meta http-equiv="Cache-Control" content="no-store, max-age=0" />
```

Belt-and-suspenders for proxies that ignore HTTP response headers.

---

## 13. SEO & Social Sharing

### Meta Tags (`index.html`)

- `<title>` — "Swimming Eagles Invitational Series"
- `<meta name="description">` — updated per-page via `PageTitle` component
- **Open Graph**: `og:type`, `og:url`, `og:site_name`, `og:title`, `og:description`, `og:image` (1200×630 PNG)
- **Twitter**: `twitter:card` (summary_large_image), `twitter:title`, `twitter:description`, `twitter:image`
- All image URLs are **absolute** (`https://swimming-eagles-invitational.vercel.app/og-image.png`)

### Per-Page SEO (`PageTitle` component)

- Sets `document.title` to `"{page title} | SEIS"` on mount
- Updates `<meta name="description">` from page's `meta_description` (from `pages` table)
- Resets to default description on pages that don't provide one

### Sitemap (`dist/sitemap.xml`)

- Generated at build time from visible pages
- Includes `<priority>` and `<changefreq>` per route
- Hidden pages excluded automatically

---

## 14. Navigation

### Public Navbar (`src/components/public/Navbar.jsx`)

- Fixed to top, 68px height, black with crimson bottom border
- Reads visible pages from `SiteContext.pages`
- Filters: must have `nav_label`, `is_visible = true`, not `home` or `contact`
- Contact rendered as crimson pill CTA (separate from nav list)
- Mobile: hamburger → animated lines → slide-down menu
- Logo from `media('seis-logo')` → Drive thumbnail

### Admin Sidebar (`src/components/admin/AdminNav.jsx`)

- Fixed dark sidebar (w-64, hidden on mobile → hamburger toggle)
- Hardcoded link list: Dashboard, Settings, Seasons, Pages, Content, Events, Scoring, Media, Programs, Fees, Integrations
- "Reset local session" and Sign Out buttons at bottom
- Active link highlighted

---

## 15. Image Pipeline

```
Admin uploads image to Google Drive
  → Pastes share URL in Admin → Media
  → media table stores: { slug: "hero-photo", google_drive_url: "https://drive.google.com/file/d/ABC/view" }
  → SiteContext.getMediaUrl("hero-photo") returns raw URL
  → driveUrl(rawUrl, 1920) extracts file ID, returns:
      "https://drive.google.com/thumbnail?id=ABC&sz=w1920"
  → <img src={thumbnailUrl} /> renders in browser
```

Width parameter controls thumbnail resolution:
- Hero backgrounds: `1920`
- Page headers: `1200`
- Logos: `400`–`600`
- Cards: `400`

---

## 16. Google Integrations

All configured via `site_settings` (admin → Integrations):

| Setting | Purpose | Used By |
|---------|---------|---------|
| `google_form_url` | Interest form (opens in new tab) | Contact, Home |
| `google_form_embed_url` | Interest form (embedded iframe) | Contact |
| `results_url` | Meet Mobile results link | Results page |
| `stream_url` | YouTube live stream embed | Stream page |
| `meet_info_pdf_url` | Meet info PDF download | Home, MeetInfo |
| `entry_form_url` | Hy-Tek entry file download | Entries page |

Google Maps embed URL stored as a **content block** (`contact.venue_maps_embed_url`), not a site setting, since it's venue-specific content.

---

## 17. Admin Panel

### Page Title Convention

`AdminLayout` sets `document.title` based on route:

```js
'/admin'             → 'Dashboard · Admin | SEIS'
'/admin/settings'    → 'Settings · Admin | SEIS'
'/admin/events'      → 'Events · Admin | SEIS'
// etc.
```

### Toast Notifications

All CRUD operations use `react-hot-toast`:
- **Success**: green, top-right, auto-dismiss
- **Error**: red, shows `error.message` from Supabase

### Export/Backup

Dashboard has an "Export Backup" button that downloads a JSON file containing:
`site_settings`, `content_blocks`, `seasons`, `media`, `events`, `meet_sessions`

Filename: `seis-backup-YYYY-MM-DD.json`

---

## 18. Component Provider Hierarchy

```jsx
<React.StrictMode>
  <ErrorBoundary>                     // Catches render crashes
    <BrowserRouter>                   // Client-side routing
      <AuthProvider>                  // Auth state (user, isAdmin, signIn, signOut)
        <SiteProvider>                // Global data (settings, seasons, pages, media)
          <App />                     // Router + layout shell
          <Toaster position="top-right" />
        </SiteProvider>
      </AuthProvider>
    </BrowserRouter>
  </ErrorBoundary>
</React.StrictMode>
```

**Order matters**: `AuthProvider` is outside `SiteProvider` because auth state needs to resolve before site data is meaningful for admin pages.

---

## 19. Key Technical Patterns

### Immutable Row Update

```js
// src/lib/utils.js
export const updateRow = (list, id, changes) =>
  list.map(x => x.id === id ? { ...x, ...changes } : x)
```

Used in admin pages to update a single row in state without mutating the array.

### Stable Form Components

Event and Session edit forms (`EventForm`, `SessionForm`) are defined **outside** the parent component to keep React identity stable. Otherwise, parent re-renders unmount the form and lose in-progress edits.

### Cancel Pattern for Async Hooks

All data hooks use a `cancelled` flag:

```js
useEffect(() => {
  let cancelled = false
  fetchData().then(data => { if (!cancelled) setState(data) })
  return () => { cancelled = true }
}, [deps])
```

Prevents state updates on unmounted components.

### Season-Scoped Data

Events, sessions, and programs are all scoped to a season via `season_slug` FK. When the user switches seasons (via `<SeasonToggle>`), all hooks re-fetch with the new slug.

### Lazy Loading

Admin pages use `React.lazy()` + `<Suspense>`:
- Public visitors never download admin JS bundles
- Stale chunk errors caught and auto-reloaded (see Error Handling § Layer 2)

---

## 20. Migration Naming Convention

```
YYYYMMDD{HHMMSS}_descriptive_name.sql
```

- `20260101000000` — initial schema (ran once to bootstrap)
- `20260420210000` — patch migrations (incremental)
- All use `ON CONFLICT DO NOTHING` or `DO UPDATE` for idempotent re-runs
- Must be run **manually** in Supabase SQL Editor (no CLI runner in production)
