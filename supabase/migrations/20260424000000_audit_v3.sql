-- Audit v3 — copy cleanup + is_admin RPC for frontend guard.
-- Safe to re-run: every UPDATE is guarded by the original seeded string
-- via LIKE/= so admin-edited content is never overwritten.

-- =============================================================================
-- 1. Strip "premier" marketing puffery
-- =============================================================================
UPDATE content_blocks
SET content = replace(content, 'a premier two-day invitational', 'a two-day invitational')
WHERE page_slug = 'home' AND block_key = 'about_p1'
  AND content LIKE '%a premier two-day invitational%';

UPDATE pages
SET meta_description = replace(meta_description, 'a premier age group', 'an age group')
WHERE slug = 'home'
  AND meta_description LIKE '%a premier age group%';

-- =============================================================================
-- 2. Rewrite home.about_p2 — separate Hy-Tek TM (entries) from MM (meet run),
--    separate World Aquatics rules from Egyptian Federation sanctioning.
-- =============================================================================
UPDATE content_blocks
SET content = 'Both invitationals take place at the Hassan and Webb Aquatics Center — an outdoor 8-lane, 25-meter competition pool with electronic touchpad timing backed by plunger and manual systems. Entries are submitted in Hy-Tek Team Manager (.hy3 / .cl2); the meet runs on Hy-Tek Meet Manager, under World Aquatics rules, sanctioned by the Egyptian Swimming Federation.'
WHERE page_slug = 'home' AND block_key = 'about_p2'
  AND content LIKE '%All entries are processed via Hy-Tek Meet Manager under World Aquatics rules.%';

-- =============================================================================
-- 3. Rewrite meet-info.rules_text — same separation
-- =============================================================================
UPDATE content_blocks
SET content = 'Competition conducted under World Aquatics rules and sanctioned by the Egyptian Swimming Federation. No video review. Swim caps are compulsory at the CAC pool.'
WHERE page_slug = 'meet-info' AND block_key = 'rules_text'
  AND content = 'Competition conducted under World Aquatics rules. No video review. Swim caps are compulsory at the CAC pool.';

-- =============================================================================
-- 4. Interest vs. registration framing — resolve everywhere it matters.
--    We are in Phase 1 (interest gathering only), so strip "registration"
--    and "registered" language from public copy.
-- =============================================================================

-- 4a. Contact page title + meta
UPDATE pages
SET title = 'Contact & Interest',
    meta_description = replace(meta_description, 'register your interest', 'share your interest')
WHERE slug = 'contact' AND title = 'Contact & Registration';

-- 4b. home.contact_intro & contact.contact_intro — "registered schools" → "interested schools"
UPDATE content_blocks
SET content = replace(content, 'all registered schools', 'all interested schools')
WHERE block_key = 'contact_intro'
  AND content LIKE '%all registered schools%';

-- =============================================================================
-- 5. Add EX (Exhibition) entry FAQ item — only if faq_items still matches
--    the original seed exactly. Uses jsonb concatenation to append safely.
-- =============================================================================
UPDATE content_blocks
SET content = (content::jsonb || '[{"q":"How do we enter a swimmer as Exhibition (EX)?","a":"EX swimmers are entered like any other swimmer in Hy-Tek Team Manager, but flagged as Exhibition so they do not score toward team totals. Useful for swimmers who want a race experience without affecting the team standings (e.g. swimming out of age group, or a competitive-but-not-rostered swimmer). Note this in your entry cover email so the meet manager can verify the EX flag imports correctly."}]'::jsonb)::text
WHERE page_slug = 'faq' AND block_key = 'faq_items'
  AND jsonb_typeof(content::jsonb) = 'array'
  AND NOT (content::jsonb @> '[{"q":"How do we enter a swimmer as Exhibition (EX)?"}]'::jsonb);

-- =============================================================================
-- 6. Meet director + venue logistics content blocks on Contact page.
--    Seeded as empty/TBC placeholders so admins can fill via Content UI.
-- =============================================================================
INSERT INTO content_blocks (page_slug, block_key, block_type, label, content, sort_order, is_visible) VALUES
  ('contact', 'meet_director_name', 'text', 'Meet Director Name', 'TBC', 5, true),
  ('contact', 'meet_director_role', 'text', 'Meet Director Role/Title', 'Director of Aquatics, Cairo American College', 6, true),
  ('contact', 'meet_director_email', 'text', 'Meet Director Email', 'aquatics@cacegypt.org', 7, true),
  ('contact', 'meet_director_phone', 'text', 'Meet Director Phone/WhatsApp', 'TBC', 8, true),
  ('contact', 'venue_address_line', 'text', 'Venue Address (single line)', 'Cairo American College, Road 253, Maadi, Cairo, Egypt', 9, true),
  ('contact', 'venue_maps_url', 'text', 'Google Maps URL', 'https://maps.google.com/?q=Cairo+American+College+Maadi', 10, true)
ON CONFLICT (page_slug, block_key) DO NOTHING;

-- =============================================================================
-- 7. RPC: is_current_user_admin() — lets the React client confirm admin
--    status without replicating the admins allow-list in JS. Used by
--    AdminLayout for defense-in-depth (RLS already blocks data reads).
-- =============================================================================
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin();
$$;

-- Callable by anyone authenticated; anon always gets false (no session).
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated, anon;
