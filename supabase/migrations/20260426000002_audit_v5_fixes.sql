-- Audit v5 fixes
-- =============================================================================
-- 1. Hide placeholder pages until real content is added.
--    Admins can re-enable them in Pages admin when content lands.
-- =============================================================================
UPDATE pages SET is_visible = false, nav_label = NULL, nav_order = 0
WHERE slug IN ('entries', 'programs', 'results', 'stream', 'warmup')
  AND is_visible = true;

-- =============================================================================
-- 2. Fix Contact page title inconsistency.
--    H1 now says "Contact & Interest" but the DB title (used for browser tab
--    and meta) still said "Contact & Registration".
-- =============================================================================
UPDATE pages SET title = 'Contact & Interest'
WHERE slug = 'contact';

-- =============================================================================
-- 3. New CMS-editable blocks for entry deadline (shown on MeetInfo + Entries).
-- =============================================================================
INSERT INTO content_blocks (page_slug, block_key, block_type, label, content, sort_order) VALUES
  ('meet-info', 'entry_deadline_text', 'text', 'Entry Deadline Callout', 'All entries must be submitted via Hy-Tek Team Manager at least 72 hours before the meet. Deck entries are not accepted.', 19),
  ('entries', 'entry_deadline_banner', 'text', 'Entry Deadline Banner', 'All entries must be submitted at least 72 hours before the meet. Deck entries are not accepted.', 0)
ON CONFLICT (page_slug, block_key) DO NOTHING;
