-- =============================================================================
-- New meet_sessions table — replaces hardcoded content_blocks for sessions.
-- Allows admins to create/edit/delete sessions per season via the admin panel.
-- =============================================================================

CREATE TABLE meet_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_slug text NOT NULL REFERENCES seasons(slug) ON DELETE CASCADE,
  day integer NOT NULL CHECK (day IN (1, 2)),
  title text NOT NULL,
  description text,
  start_time text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE meet_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_sessions_data" ON meet_sessions FOR SELECT USING (true);
CREATE POLICY "auth_all_sessions_data" ON meet_sessions FOR ALL USING (auth.role() = 'authenticated');

-- =============================================================================
-- Seed with existing session data from content blocks
-- =============================================================================
INSERT INTO meet_sessions (season_slug, day, title, description, sort_order) VALUES
  ('fall_2026', 1, '8 & Under — Timed Finals', 'All 8&U individual and relay events. Swimmers may not compete in both 25m and 50m Freestyle.', 1),
  ('fall_2026', 1, 'Session 1 — 11+ Prelims', '200 Free (TF), 50 Breast, 100 Back, 50 Fly, 100 Free, 100 IM, 4×50 Mixed Medley Relay (TF).', 2),
  ('fall_2026', 1, 'Session 2 — 11+ Finals', '50 Breast, 100 Back, 50 Fly, 100 Free, 100 IM Finals. Awards after each final.', 3),
  ('fall_2026', 2, 'Session 1 — 9–10 Timed Finals', '200 Free, 25/50 Breast, 50/100 Back, 25/50 Fly, 100 Free, 50 Free, 100 IM, 4×50 FR Relay, 4×25 Mixed Medley Relay.', 1),
  ('fall_2026', 2, 'Session 2 — 11+ Prelims', '200 IM (TF), 100 Breast, 50 Back, 100 Fly, 50 Free.', 2),
  ('fall_2026', 2, 'Session 3 — 11+ Finals + Closing Relays', '100 Breast, 50 Back, 100 Fly, 50 Free Finals. 4×50 Medley Relay, 4×50 Free Relay. Team trophies after last relay.', 3),
  ('spring_2027', 1, '8 & Under — Timed Finals', 'All 8&U individual and relay events. Swimmers may not compete in both 25m and 50m Freestyle.', 1),
  ('spring_2027', 1, 'Session 1 — 11+ Prelims', '200 Free (TF), 50 Breast, 100 Back, 50 Fly, 100 Free, 100 IM, 4×50 Mixed Medley Relay (TF).', 2),
  ('spring_2027', 1, 'Session 2 — 11+ Finals', '50 Breast, 100 Back, 50 Fly, 100 Free, 100 IM Finals. Awards after each final.', 3),
  ('spring_2027', 2, 'Session 1 — 9–10 Timed Finals', '200 Free, 25/50 Breast, 50/100 Back, 25/50 Fly, 100 Free, 50 Free, 100 IM, 4×50 FR Relay, 4×25 Mixed Medley Relay.', 1),
  ('spring_2027', 2, 'Session 2 — 11+ Prelims', '200 IM (TF), 100 Breast, 50 Back, 100 Fly, 50 Free.', 2),
  ('spring_2027', 2, 'Session 3 — 11+ Finals + Closing Relays', '100 Breast, 50 Back, 100 Fly, 50 Free Finals. 4×50 Medley Relay, 4×50 Free Relay. Team trophies after last relay.', 3);
