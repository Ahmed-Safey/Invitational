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

-- =============================================================================
-- 4. Google Maps embed URL for inline map iframes (Home, Contact, MeetInfo).
-- =============================================================================
INSERT INTO content_blocks (page_slug, block_key, block_type, label, content, sort_order) VALUES
  ('contact', 'venue_maps_embed_url', 'text', 'Google Maps Embed URL', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3456.7179633374285!2d31.2748515!3d29.958790099999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14583812970bbd17%3A0x7f10782ad907abac!2sCairo%20American%20College!5e0!3m2!1sar!2seg!4v1777206496628!5m2!1sar!2seg', 11)
ON CONFLICT (page_slug, block_key) DO NOTHING;
