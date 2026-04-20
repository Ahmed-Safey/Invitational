-- Audit fixes: events.season_slug, RLS recursion fix, atomic set_active_season RPC

-- =============================================================================
-- 1. CRITICAL: add events.season_slug so each season can have its own events
-- =============================================================================
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS season_slug text REFERENCES seasons(slug) ON UPDATE CASCADE ON DELETE CASCADE;

-- Backfill existing events to the currently active season
UPDATE events
SET season_slug = (SELECT active_season FROM site_settings WHERE id = 1 LIMIT 1)
WHERE season_slug IS NULL;

-- Now require it on future inserts
ALTER TABLE events
  ALTER COLUMN season_slug SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_events_season_slug ON events(season_slug);

-- =============================================================================
-- 2. HIGH: fix RLS self-reference recursion on admins table
--    Use is_admin() (SECURITY DEFINER) to bypass the recursive subquery.
-- =============================================================================
DROP POLICY IF EXISTS admins_self_read ON admins;
CREATE POLICY admins_self_read ON admins FOR SELECT TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS admins_self_write ON admins;
CREATE POLICY admins_self_write ON admins FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- =============================================================================
-- 3. HIGH: atomic RPC for switching the active season
--    Guarantees exactly one season has is_current=true and site_settings is in sync.
-- =============================================================================
CREATE OR REPLACE FUNCTION set_active_season(new_slug text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'permission denied: admin only';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM seasons WHERE slug = new_slug) THEN
    RAISE EXCEPTION 'season not found: %', new_slug;
  END IF;

  -- Single transaction: flip active flag + site_settings atomically
  UPDATE seasons SET is_current = (slug = new_slug);
  UPDATE site_settings SET active_season = new_slug WHERE id = 1;
END;
$$;

GRANT EXECUTE ON FUNCTION set_active_season(text) TO authenticated;
