# CHANGELOG

All database migrations and significant code changes, in reverse chronological order.

---

## 2026-04-27 — `20260427000000_audit_v6.sql`

- **Re-documented `set_active_season` RPC** — confirmed already transactional (plpgsql), added inline comment
- **Added composite index** `idx_events_season_day_session` on `events(season_slug, day, session)` for query performance
- **Added composite index** `idx_meet_sessions_season_day` on `meet_sessions(season_slug, day, sort_order)`
- **Documented `start_time` semantics** — column comment clarifying it's competition start, not warm-up
- **Created `schema_migrations` table** — tracks which migrations have been applied, backfilled all 14 existing migrations

## 2026-04-26 — `20260426000003_sessions_table.sql`

- **Created `meet_sessions` table** — `season_slug`, `day`, `title`, `description`, `start_time`, `sort_order`
- **Added RLS policies** — public read, authenticated full access
- **Seeded** with 5 sessions for `fall_2026` and 5 for `spring_2027` from existing content block data

## 2026-04-26 — `20260426000002_audit_v5_fixes.sql`

- **Set pages hidden** — entries, programs, results, stream, warmup set to `is_visible = false`
- **Fixed Contact page title** inconsistency
- **Added `entry_deadline_text`** content block for Entries and MeetInfo pages
- **Added `venue_maps_embed_url`** content block for Google Maps iframe embedding on Home, Contact, MeetInfo

## 2026-04-26 — `20260426000001_cms_copy_and_event50.sql`

- **Added CMS blocks** — `hero_cta_text` and `interest_heading_text` for editable hero/interest section copy
- **Fixed Event #50 gap** — inserted missing event with correct `season_slug`

## 2026-04-26 — `20260426000000_rename_eagle_media.sql`

- **Renamed** `eagle-watermark` → `screaming-eagle` media slug for clarity
- **Updated** `cac-logo` usage hint
- **Added** `cac-swimming` media slot for CAC Swimming logo

## 2026-04-24 — `20260424000000_audit_v3.sql`

- Meet director contact blocks (name, phone, role)
- Venue address + maps URL blocks
- Google Form embed URL content block
- FAQ page content blocks
- Various content block fixes and additions

## 2026-04-21 — `20260421003000_programs_copy.sql`

- Programs page content blocks (intro text, download instructions)

## 2026-04-21 — `20260421000000_audit_round4.sql`

- Additional content block fixes from audit round 4

## 2026-04-20 — `20260420223000_schedule_titles.sql`

- **Schedule day/session labels** as CMS-editable content blocks (`day1_tab_label`, `day2_tab_label`, session titles)
- Allows admin to rename "Friday — Day 1" etc. without a code deploy

## 2026-04-20 — `20260420220000_content_audit_2.sql`

- Second pass content block fixes
- `entry_policy_text` changed from `text` to `list` type for bullet rendering

## 2026-04-20 — `20260420214500_content_audit.sql`

- Comprehensive content block audit
- Added missing blocks for all public pages
- Fixed block types (text → json, text → list, text → table) where structured data was needed

## 2026-04-20 — `20260420210000_audit_fixes.sql`

- **Added `events.season_slug`** column — links events to seasons (critical for multi-season support)
- **Fixed RLS recursion** — is_admin function was recursing through policies
- **Created `set_active_season` RPC** — atomic season switch with admin check, updates both `seasons.is_current` and `site_settings.active_season`

## 2026-04-20 — `20260420000000_admin_rls.sql`

- **Created `admin_users` table** — allow-list of admin UIDs
- **Created `is_admin()` and `is_current_user_admin()` functions** — used by RLS and UI for admin verification
- **Applied admin-only write policies** to all tables

## 2026-01-01 — `20260101000000_initial_schema.sql`

- **All tables**: `site_settings`, `seasons`, `pages`, `content_blocks`, `events`, `scoring_table`, `media`, `programs`, `bank_details`
- **RLS** enabled on all tables with public read + authenticated write policies
- **Seed data**: two seasons (Fall 2026, Spring 2027), all pages, 66 events, scoring table, content blocks, media slots
- **Triggers**: `update_updated_at` on `site_settings` and `media`
