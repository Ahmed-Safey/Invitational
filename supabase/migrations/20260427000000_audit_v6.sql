-- =============================================================================
-- Audit v6 — Changes & Action Items (engineering + aquatics analysis)
-- =============================================================================

-- #1 set_active_season: ALREADY TRANSACTIONAL (plpgsql runs in a transaction).
--    Re-creating here with explicit comment for documentation.
--    No functional change — just adds a comment and keeps the function idempotent.
CREATE OR REPLACE FUNCTION set_active_season(new_slug text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
-- Both UPDATEs execute inside a single plpgsql transaction. If either fails,
-- both roll back. This prevents two seasons being is_current = true.
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'permission denied: admin only';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM seasons WHERE slug = new_slug) THEN
    RAISE EXCEPTION 'season not found: %', new_slug;
  END IF;

  UPDATE seasons SET is_current = (slug = new_slug);
  UPDATE site_settings SET active_season = new_slug WHERE id = 1;
END;
$$;

-- =============================================================================
-- #2 Composite index on events for the three-column filter used by useEvents()
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_events_season_day_session
  ON events (season_slug, day, session);

-- Also index meet_sessions for useSessions() queries
CREATE INDEX IF NOT EXISTS idx_meet_sessions_season_day
  ON meet_sessions (season_slug, day, sort_order);

-- =============================================================================
-- #4 Clarify start_time semantics: rename column to competition_start_time
--    and add a comment. The warm-up time lives on seasons.warmup_schedule_text.
-- =============================================================================
COMMENT ON COLUMN meet_sessions.start_time IS
  'Competition start time (NOT warm-up start). Warm-up times are in seasons.warmup_schedule_text. Display "TBC" if null/empty.';

-- =============================================================================
-- #5 Migration state tracking table
-- =============================================================================
CREATE TABLE IF NOT EXISTS schema_migrations (
  filename   TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ DEFAULT now()
);

-- Backfill all existing migrations
INSERT INTO schema_migrations (filename) VALUES
  ('20260101000000_initial_schema.sql'),
  ('20260420000000_admin_rls.sql'),
  ('20260420210000_audit_fixes.sql'),
  ('20260420214500_content_audit.sql'),
  ('20260420220000_content_audit_2.sql'),
  ('20260420223000_schedule_titles.sql'),
  ('20260421000000_audit_round4.sql'),
  ('20260421003000_programs_copy.sql'),
  ('20260424000000_audit_v3.sql'),
  ('20260426000000_rename_eagle_media.sql'),
  ('20260426000001_cms_copy_and_event50.sql'),
  ('20260426000002_audit_v5_fixes.sql'),
  ('20260426000003_sessions_table.sql'),
  ('20260427000000_audit_v6.sql')
ON CONFLICT DO NOTHING;
