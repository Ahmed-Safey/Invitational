-- Move the static copy on the public Programs page into content_blocks so
-- admins can tweak the description text without a code deploy. Previously
-- hardcoded in src/pages/public/Programs.jsx as defaultDescs + defaultLabels.

INSERT INTO content_blocks (page_slug, block_key, block_type, label, content, sort_order, is_visible) VALUES
  ('programs','psych_sheet_label','text','Psych sheet card label','Psych Sheets',1,true),
  ('programs','psych_sheet_desc','text','Psych sheet description','Pre-seeded entry lists ranked by submitted times. Published after the entry deadline.',2,true),
  ('programs','heat_sheet_label','text','Heat sheet card label','Heat Sheets',3,true),
  ('programs','heat_sheet_desc','text','Heat sheet description','Final lane and heat assignments for all events. Published 24 hours before each session.',4,true),
  ('programs','program_booklet_label','text','Program booklet card label','Meet Program Booklet',5,true),
  ('programs','program_booklet_desc','text','Program booklet description','Comprehensive meet program including schedule, event order, team rosters, and pool records.',6,true)
ON CONFLICT (page_slug, block_key) DO NOTHING;
