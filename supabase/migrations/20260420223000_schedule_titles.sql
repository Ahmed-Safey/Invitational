-- Seed admin-editable session titles for the Schedule page.
-- Previously hardcoded in Schedule.jsx; now DB-driven so future seasons with a
-- different session structure (e.g. Saturday-start weekends) can be updated
-- without a code deploy.
INSERT INTO content_blocks (page_slug, block_key, block_type, label, content, sort_order, is_visible) VALUES
  ('schedule','day1_tab_label','text','Day 1 tab label','Friday — Day 1',1,true),
  ('schedule','day2_tab_label','text','Day 2 tab label','Saturday — Day 2',2,true),
  ('schedule','day1_morning_title','text','Day 1 morning session title','8 & Under Timed Finals + 11+ Prelims',3,true),
  ('schedule','day1_evening_title','text','Day 1 evening session title','11+ Finals',4,true),
  ('schedule','day2_morning_title','text','Day 2 morning session title','9–10 Timed Finals + 11+ Prelims',5,true),
  ('schedule','day2_evening_title','text','Day 2 evening session title','11+ Finals + Closing Relays',6,true)
ON CONFLICT (page_slug, block_key) DO NOTHING;
