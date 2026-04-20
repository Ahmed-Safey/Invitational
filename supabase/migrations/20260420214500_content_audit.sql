-- Content audit fixes from the UX review
-- Safe to re-run: all UPSERTs and conditional INSERTs.

-- =============================================================================
-- 1. Reformat entry_policy_text as a list (JSON array) for Meet Info
-- =============================================================================
UPDATE content_blocks
SET block_type = 'list',
    content = '["Deadline: at least 72 hours before the meet.","Format: Hy-Tek Team Manager files only (.hy3 / .cl2).","No Time (NT): accepted, seeded last.","Scratches & changes: allowed until the coaches meeting; after that, late scratches may forfeit the lane.","Proof of age: passport / school ID required for any registration dispute.","Entry limits are strict, see the table above."]'
WHERE page_slug = 'meet-info'
  AND block_key = 'entry_policy_text'
  AND block_type = 'text';  -- don't overwrite if admin has already converted it

-- =============================================================================
-- 2. Home: "at least 72 hours" wording fix in registration_steps
--    Keep the existing numbered structure; just replace the known literal.
-- =============================================================================
UPDATE content_blocks
SET content = replace(content, '72 hours before', 'at least 72 hours before')
WHERE page_slug = 'home'
  AND block_key = 'registration_steps'
  AND content LIKE '%72 hours before%'
  AND content NOT LIKE '%at least 72 hours before%';

-- =============================================================================
-- 3. Add FAQ page + content blocks (only if the page doesn't exist yet)
-- =============================================================================
INSERT INTO pages (slug, title, subtitle, nav_label, nav_order, is_visible, meta_description)
VALUES (
  'faq',
  'Frequently Asked Questions',
  'Answers to common questions from coaches and athletic directors',
  'FAQ',
  100,
  true,
  'Answers to common questions about the Swimming Eagles Invitational Series: entries, age-ups, NT entries, file formats, payments, and meet-week logistics.'
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content_blocks (page_slug, block_key, block_type, label, content, sort_order, is_visible)
VALUES
  ('faq', 'faq_intro', 'text', 'FAQ intro',
   'Quick answers to the questions we hear most often. Still stuck? Email us directly and we will get back to you within one working day.',
   1, true),
  ('faq', 'faq_items', 'json', 'FAQ items (array of {q, a})',
   '[{"q":"Can my swimmer compete up an age group?","a":"Yes, a swimmer can always swim up one age group for any individual event, but not down. The swimmer must be entered in that older age group for every round of that event."},{"q":"Are No Time (NT) entries accepted?","a":"Yes. NT swimmers are seeded last in their heat. We recommend submitting any available time, even an unofficial practice time, so heats can be seeded fairly."},{"q":"What file formats do you accept for entries?","a":"Hy-Tek Team Manager files only, either .hy3 (preferred) or .cl2. Spreadsheet or PDF entries cannot be processed. If your club uses Meet Manager or another platform, export to one of these formats before sending."},{"q":"What happens if our entry file has errors?","a":"You will be contacted at the email address on the interest form. Most issues (missing birthdates, wrong event codes, swimmer not in a valid age group) can be fixed before the coaches meeting. Errors found after the meeting cannot be corrected and the swimmer will not be entered."},{"q":"How is payment handled?","a":"An invoice is issued per school after entries are confirmed. Payment is by bank transfer. Full bank details appear on the Fees page once they are published."},{"q":"Can we scratch or change entries on meet day?","a":"Late changes are allowed up until the coaches meeting. After the meet starts, late scratches may forfeit the lane and still count against the school entry limit."},{"q":"Are spectators welcome?","a":"Yes. Spectator seating is available in the upper viewing gallery. Spectators are not permitted on deck during warm-up or competition."},{"q":"Is there parking on-site?","a":"Yes, CAC provides on-campus parking for visiting schools. Your coach will be sent entry and parking instructions the week of the meet."},{"q":"Do you offer trophies or medals?","a":"Yes. Awards are presented to the top swimmers in each age group as well as top scoring schools. See the Meet Info page for the full awards structure."},{"q":"When will the heat sheet be published?","a":"Heat sheets are published the evening before Day 1 on the Programs page. Psych sheets go up earlier, once entries close."}]',
   2, true),
  ('faq', 'faq_footer', 'text', 'FAQ footer note',
   'Have a question not answered above? Email aquatics@cacegypt.org and we will add it to this page.',
   3, true)
ON CONFLICT (page_slug, block_key) DO NOTHING;

-- =============================================================================
-- 4. Ensure the page has a safe nav_order (not clobbered by another page)
-- =============================================================================
-- (no-op if already unique; kept for safety)
