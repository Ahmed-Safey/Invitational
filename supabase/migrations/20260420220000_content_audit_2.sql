-- Content audit round 2 — copy refinements based on content review
-- Safe to run multiple times (guarded by content match or ON CONFLICT DO NOTHING)

-- 1. Home: split overloaded about_p3 paragraph into two
--    about_p3 (kept) → relay + age-up rules only
--    about_p4 (new)  → swim caps + age-up restriction
UPDATE content_blocks
SET content = 'Each meet spans two days with morning prelims and evening finals. Five age groups compete across Timed Finals and Prelims/Finals formats. Mixed relays use 2 boys + 2 girls.'
WHERE page_slug = 'home' AND block_key = 'about_p3'
  AND content LIKE '%Swimmers may age up but cannot compete%';

INSERT INTO content_blocks (page_slug, block_key, block_type, label, content, sort_order, is_visible) VALUES
  ('home','about_p4','text','About Paragraph 4','Swimmers may age up (one group only) but cannot compete in more than one age group across a meet. Swim caps are compulsory at the CAC pool for all training and competition.',10,true)
ON CONFLICT (page_slug, block_key) DO NOTHING;

-- 2. Home: fix redundant "Days Per Meet" stat label → "Competition Days"
UPDATE content_blocks
SET content = 'Competition Days'
WHERE page_slug = 'home' AND block_key = 'stat_days_label' AND content = 'Days Per Meet';

-- 3. Fees: remove outdated "previous balance" policy (first-year meet)
UPDATE content_blocks
SET is_visible = false
WHERE page_slug = 'fees' AND block_key = 'policy_3'
  AND content LIKE '%outstanding balances from previous meets%';

-- 4. Programs: entry-file placeholder with timeline context
UPDATE programs
SET label = replace(label, 'Entry File', 'Entry File (.cl2) — available ~6 weeks before meet')
WHERE program_type = 'entry_file' AND label NOT LIKE '%6 weeks before%';

-- 5. Results: add response-timeline context to intro paragraph
UPDATE content_blocks
SET content = 'Live results are available during the meet via the Meet Mobile app. Download Meet Mobile from the App Store (iOS) or Google Play (Android) and search for the exact meet name (published here once the meet is set up in Hy-Tek). Session PDFs are typically posted below within 20 minutes of each session ending.'
WHERE page_slug = 'results' AND block_key = 'results_intro'
  AND content LIKE '%search for "Swimming Eagles Invitational"%';
