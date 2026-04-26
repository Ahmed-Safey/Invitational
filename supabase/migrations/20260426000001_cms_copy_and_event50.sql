-- 1. Add CMS-editable content blocks for previously hardcoded hero copy.
INSERT INTO content_blocks (page_slug, block_key, block_type, label, content, sort_order) VALUES
  ('home', 'hero_cta_primary',  'text', 'Hero CTA – Primary Button',  'Secure Your School''s Spot', 32),
  ('home', 'hero_cta_secondary','text', 'Hero CTA – Secondary Button', 'View Schedule', 33),
  ('home', 'interest_heading',  'text', 'Interest Form Heading (HTML)', 'Register<br/>Your <span class="text-crimson">Interest</span>', 34)
ON CONFLICT (page_slug, block_key) DO NOTHING;

-- 2. Fix Event #50 gap: the 9-10 block ends at #49 and the 11+ Day 2
--    prelims start at #51, skipping #50. Insert the missing event.
--    Based on the meet structure, Event #50 should be the mixed 4×25
--    Mixed Free Relay for 9-10 (the last relay in the 9-10 session was
--    the mixed medley at #49). If this is wrong, update in the admin
--    Events editor. Wrapped in a guard so it only inserts if #50 is
--    truly absent.
INSERT INTO events (event_number, gender, event_name, distance, stroke, age_group, format, day, session, sort_order, is_break, break_label)
SELECT 50, 'mixed', '4×25 Mixed Freestyle Relay', NULL, 'relay', '9-10', 'timed_final', 2, 'morning', 24, false, NULL
WHERE NOT EXISTS (SELECT 1 FROM events WHERE event_number = 50 AND day = 2 AND session = 'morning');
