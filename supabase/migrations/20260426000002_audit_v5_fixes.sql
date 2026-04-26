-- Audit v5 fixes
-- =============================================================================
-- 1. Hide placeholder pages until real content is added.
--    Admins can re-enable them in Pages admin when content lands.
-- =============================================================================
UPDATE pages SET is_visible = false, nav_label = NULL, nav_order = 0
WHERE slug IN ('entries', 'programs', 'results', 'stream', 'warmup')
  AND is_visible = true;
