-- ============================================================================
-- SEIS Website — Complete Database Migration v2
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================================

-- ═══ TABLES ═══

CREATE TABLE site_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  site_title text NOT NULL DEFAULT 'Swimming Eagles Invitational Series',
  site_subtitle text NOT NULL DEFAULT 'Cairo American College · Hassan and Webb Aquatics Center',
  active_season text NOT NULL DEFAULT 'fall_2026',
  -- Integration URLs
  results_url text DEFAULT '',
  stream_url text DEFAULT '',
  google_form_url text DEFAULT '',
  google_form_embed_url text DEFAULT '',
  meet_info_pdf_url text DEFAULT '',
  entry_form_url text DEFAULT '',
  -- Contact
  contact_email_athletics text DEFAULT 'athletics@cacegypt.org',
  contact_email_aquatics text DEFAULT 'aquatics@cacegypt.org',
  -- Hero
  hero_badge_1 text DEFAULT 'Fall 2026 · Nov 13–14',
  hero_badge_2 text DEFAULT 'Spring 2027 · May 28–29',
  hero_badge_3 text DEFAULT '25m · Short Course Meters',
  hero_badge_4 text DEFAULT '8 Lanes · Electronic Timing',
  -- Fee
  entry_fee_amount text DEFAULT '1,500 EGP',
  entry_fee_label text DEFAULT 'Entry Fee / Swimmer',
  -- Hospitality
  hospitality_text text DEFAULT 'A fully catered hospitality room is available throughout the duration of the meet for all coaches, officials, and visiting Athletic Directors.',
  -- Coaches meeting
  coaches_meeting_text text DEFAULT 'Morning of Day 1 (Friday), after warm-up. Mandatory for all participating schools (head coach minimum).',
  -- Timestamps
  updated_at timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER site_settings_updated BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  label text NOT NULL,
  dates_display text NOT NULL,
  age_up_date text,
  is_current boolean DEFAULT false,
  warmup_schedule_text text,
  session_times_json jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  subtitle text,
  meta_description text,
  is_visible boolean DEFAULT true,
  nav_label text,
  nav_order int DEFAULT 0
);

CREATE TABLE content_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug text NOT NULL REFERENCES pages(slug) ON DELETE CASCADE,
  block_key text NOT NULL,
  block_type text NOT NULL DEFAULT 'text' CHECK (block_type IN ('text', 'html', 'table', 'list', 'json')),
  content text NOT NULL DEFAULT '',
  label text DEFAULT '',
  sort_order int DEFAULT 0,
  is_visible boolean DEFAULT true,
  UNIQUE(page_slug, block_key)
);

CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_number int NOT NULL,
  gender text NOT NULL CHECK (gender IN ('girls', 'boys', 'mixed')),
  event_name text NOT NULL,
  distance int,
  stroke text,
  age_group text NOT NULL CHECK (age_group IN ('8u', '9-10', '11+')),
  format text NOT NULL CHECK (format IN ('timed_final', 'prelims', 'finals')),
  day int NOT NULL CHECK (day IN (1, 2)),
  session text NOT NULL CHECK (session IN ('morning', 'evening')),
  sort_order int DEFAULT 0,
  is_break boolean DEFAULT false,
  break_label text
);

CREATE TABLE scoring_table (
  id serial PRIMARY KEY,
  place int NOT NULL UNIQUE,
  individual_points int NOT NULL,
  relay_points int NOT NULL
);

CREATE TABLE media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  label text NOT NULL,
  google_drive_url text DEFAULT '',
  usage_hint text,
  alt_text text DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER media_updated BEFORE UPDATE ON media FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_slug text NOT NULL REFERENCES seasons(slug) ON DELETE CASCADE,
  program_type text NOT NULL CHECK (program_type IN ('psych_sheet', 'heat_sheet', 'program_booklet', 'entry_file')),
  label text NOT NULL,
  google_drive_url text,
  is_published boolean DEFAULT false,
  UNIQUE(season_slug, program_type)
);

CREATE TABLE bank_details (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  bank_name text DEFAULT 'TBC',
  account_name text DEFAULT 'TBC',
  account_number text DEFAULT 'TBC',
  swift_iban text DEFAULT 'TBC',
  reference_format text DEFAULT 'School Name + SEIS Fall 2026',
  is_published boolean DEFAULT false
);

-- ═══ RLS ═══

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_details ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "anon_read_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "anon_read_seasons" ON seasons FOR SELECT USING (true);
CREATE POLICY "anon_read_pages" ON pages FOR SELECT USING (is_visible = true);
CREATE POLICY "anon_read_content" ON content_blocks FOR SELECT USING (is_visible = true);
CREATE POLICY "anon_read_events" ON events FOR SELECT USING (true);
CREATE POLICY "anon_read_scoring" ON scoring_table FOR SELECT USING (true);
CREATE POLICY "anon_read_media" ON media FOR SELECT USING (true);
CREATE POLICY "anon_read_programs" ON programs FOR SELECT USING (is_published = true);
CREATE POLICY "anon_read_bank" ON bank_details FOR SELECT USING (is_published = true);

-- Admin full access
CREATE POLICY "auth_all_settings" ON site_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_all_seasons" ON seasons FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_all_pages" ON pages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_all_content" ON content_blocks FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_all_events" ON events FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_all_scoring" ON scoring_table FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_all_media" ON media FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_all_programs" ON programs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_all_bank" ON bank_details FOR ALL USING (auth.role() = 'authenticated');

-- ═══ SEED DATA ═══

INSERT INTO site_settings (id) VALUES (1);

INSERT INTO seasons (slug, label, dates_display, age_up_date, is_current) VALUES
  ('fall_2026', 'Fall Invitational', 'November 13–14, 2026', 'August 1, 2026', true),
  ('spring_2027', 'Spring Invitational', 'May 28–29, 2027', 'March 1, 2027', false);

INSERT INTO pages (slug, title, subtitle, meta_description, is_visible, nav_label, nav_order) VALUES
  ('home', 'Swimming Eagles Invitational Series', 'Cairo American College · Hassan and Webb Aquatics Center', 'SEIS — a premier age group swimming invitational by CAC.', true, 'Home', 1),
  ('meet-info', 'Meet Information', 'Everything You Need to Know', 'Venue, rules, age groups, and competition format for SEIS.', true, 'Meet Info', 2),
  ('schedule', 'Schedule of Events', 'Full event order for both competition days', 'Complete 64-event order across Friday and Saturday.', true, 'Schedule', 3),
  ('sessions', 'Session Schedule', 'Session breakdown for Friday and Saturday', 'Morning prelims and evening finals session structure.', true, 'Sessions', 4),
  ('entries', 'Meet Entries', 'Download entry file and submit your team entries', 'Download Hy-Tek entry file and submit entries for SEIS.', true, 'Entries', 5),
  ('programs', 'Meet Programs', 'Psych sheets, heat sheets, and meet programs', 'Download meet program documents.', true, 'Programs', 6),
  ('fees', 'Fees & Payment', 'Entry fees and payment information', 'Entry fee and payment details for SEIS.', true, 'Fees', 7),
  ('results', 'Live Results', 'Powered by Meet Mobile', 'Live results and post-session PDFs.', true, 'Results', 8),
  ('stream', 'Live Stream', 'Watch Live', 'Watch SEIS live from Hassan and Webb Aquatics Center.', true, 'Stream', 9),
  ('warmup', 'Warm-up Schedule', 'Lane assignments and warm-up procedures', 'Warm-up schedule and pool rules.', true, NULL, 0),
  ('contact', 'Contact & Registration', 'Get in touch', 'Contact CAC Aquatics and register your interest.', true, NULL, 0);

INSERT INTO scoring_table (place, individual_points, relay_points) VALUES
  (1,9,18),(2,7,14),(3,6,12),(4,5,10),(5,4,8),(6,3,6),(7,2,4),(8,1,2);

INSERT INTO media (slug, label, google_drive_url, usage_hint, alt_text) VALUES
  ('seis-logo', 'SEIS Meet Logo', '', 'Nav bar, hero section, favicon', 'SEIS logo'),
  ('cac-logo', 'CAC Institutional Logo', '', 'Footer', 'CAC logo'),
  ('eagle-watermark', 'Eagle Watermark', '', 'Body background watermark', 'Eagle watermark'),
  ('hero-photo', 'Hero Pool Photo', '', 'Homepage hero background', 'HWAC pool'),
  ('page-header-bg', 'Page Header Background', '', 'Sub-page headers', 'Pool');

INSERT INTO programs (season_slug, program_type, label, is_published) VALUES
  ('fall_2026','psych_sheet','Fall 2026 Psych Sheets',false),
  ('fall_2026','heat_sheet','Fall 2026 Heat Sheets',false),
  ('fall_2026','program_booklet','Fall 2026 Meet Program',false),
  ('fall_2026','entry_file','Fall 2026 Entry File',false),
  ('spring_2027','psych_sheet','Spring 2027 Psych Sheets',false),
  ('spring_2027','heat_sheet','Spring 2027 Heat Sheets',false),
  ('spring_2027','program_booklet','Spring 2027 Meet Program',false),
  ('spring_2027','entry_file','Spring 2027 Entry File',false);

INSERT INTO bank_details (id) VALUES (1);

-- ═══ CONTENT BLOCKS ═══
-- Every visible text on the site is here. label field is for admin display.

-- HOME PAGE
INSERT INTO content_blocks (page_slug, block_key, block_type, label, content, sort_order) VALUES
  ('home','section_label_dates','text','Dates Section Label','Mark Your Calendar',1),
  ('home','section_label_about','text','About Section Label','Welcome',2),
  ('home','section_label_format','text','Format Section Label','Competition Structure',3),
  ('home','section_label_fees','text','Fees Section Label','Event Details',4),
  ('home','section_label_contact','text','Contact Section Label','Get In Touch',5),
  ('home','about_title','text','About Title','About the Invitational',6),
  ('home','about_p1','text','About Paragraph 1','Cairo American College is proud to host the Swimming Eagles Invitational Series — a premier two-day invitational held on our campus in Maadi, Cairo. The meet brings together local school teams in a competitive environment at the Hassan and Webb Aquatics Center.',7),
  ('home','about_p2','text','About Paragraph 2','Both invitationals take place at the Hassan and Webb Aquatics Center — an outdoor 8-lane, 25-meter competition pool with electronic touchpad timing backed by plunger and manual systems. All entries are processed via Hy-Tek Meet Manager under World Aquatics rules.',8),
  ('home','about_p3','text','About Paragraph 3','Each meet spans two days with morning prelims and evening finals. Five age groups compete across Timed Finals and Prelims/Finals formats. Mixed relays use 2 boys + 2 girls. Swimmers may age up but cannot compete in more than one age group. Swim caps are compulsory at the CAC pool.',9),
  ('home','stat_days','text','Stat: Days','2',10),
  ('home','stat_days_label','text','Stat: Days Label','Days Per Meet',11),
  ('home','stat_lanes','text','Stat: Lanes','8',12),
  ('home','stat_lanes_label','text','Stat: Lanes Label','Lanes',13),
  ('home','stat_course','text','Stat: Course','25m',14),
  ('home','stat_course_label','text','Stat: Course Label','Short Course',15),
  ('home','stat_age_groups','text','Stat: Age Groups','5',16),
  ('home','stat_age_groups_label','text','Stat: Age Groups Label','Age Groups',17),
  ('home','stat_age_list','text','Stat: Age Group List','8&U · 9-10 · 11-12 · 13-14 · 15+',18),
  ('home','format_title','text','Format Section Title','Meet Format',19),
  ('home','format_card_1_title','text','Format Card 1 Title','Age Groups & Structure',20),
  ('home','format_card_1_content','json','Format Card 1 Data','[{"label":"8 & Under","value":"Timed Finals"},{"label":"9–10","value":"Timed Finals"},{"label":"11–12","value":"Prelims / Finals"},{"label":"13–14","value":"Prelims / Finals"},{"label":"15 & Over","value":"Prelims / Finals"},{"label":"Finals Advancement","value":"Top 8 per age/gender"},{"label":"200m Free / 200m IM (11+)","value":"Timed Final (no prelims)"}]',21),
  ('home','format_card_2_title','text','Format Card 2 Title','Entry Limits',22),
  ('home','format_card_2_content','json','Format Card 2 Data','[{"label":"Per event (individual)","value":"6 swimmers / school"},{"label":"50m Freestyle (all ages)","value":"Unlimited entries"},{"label":"Per relay event","value":"2 teams / school"},{"label":"Events per swimmer","value":"Max 6 (any ind/relay split)"},{"label":"200m Free (11+)","value":"Max 3 / school"},{"label":"Exhibition (EX)","value":"Non-scoring, no finals"},{"label":"Swim caps","value":"Compulsory at CAC pool"}]',23),
  ('home','format_card_3_title','text','Format Card 3 Title','Scoring & Awards',24),
  ('home','format_card_3_content','json','Format Card 3 Data','[{"label":"Individual (Top 8)","value":"9-7-6-5-4-3-2-1"},{"label":"Relay (Top 8)","value":"18-14-12-10-8-6-4-2"},{"label":"Mixed Relay Points","value":"Split equally Boys & Girls"},{"label":"Medals","value":"1st – 3rd Place"},{"label":"Ribbons","value":"4th – Last Place"},{"label":"Age Group Awards","value":"Top Team per age group"},{"label":"Overall Trophy","value":"Team Champion (combined)"}]',25),
  ('home','fees_title','text','Fees Section Title','Fees & Info',26),
  ('home','contact_title','text','Contact Title','Express Your Interest',27),
  ('home','contact_intro','text','Contact Intro','Complete the interest form or reach out to our team directly. Full meet information packets, entry deadlines, and psych sheets will be distributed to all registered schools well ahead of each meet date.',28),
  ('home','interest_form_intro','text','Interest Form Intro','Let us know your school is interested in participating. Completing this form secures your place in the communication loop — you will receive official meet documentation, entry instructions, and important updates as each meet approaches.',29),
  ('home','interest_form_note','text','Interest Form Note','No commitment required at this stage. The interest form is the first step only.',30),
  ('home','registration_steps','json','Registration Steps','[{"num":"1","text":"Submit this interest form"},{"num":"2","text":"Receive official Letter of Invitation"},{"num":"3","text":"Get notified when psych sheets, entry deadlines & full meet info are released"},{"num":"4","text":"Submit all entries using Hy-Tek Team Manager 72 hours before the meet"}]',31);

-- MEET INFO PAGE
INSERT INTO content_blocks (page_slug, block_key, block_type, label, content, sort_order) VALUES
  ('meet-info','venue_title','text','Venue Section Title','Venue & Equipment',1),
  ('meet-info','venue_name','text','Venue Name','Hassan and Webb Aquatics Center',2),
  ('meet-info','venue_address','text','Venue Address','Cairo American College, Maadi, Cairo',3),
  ('meet-info','venue_pool','text','Pool Description','Outdoor 8-lane, 25-meter competition pool',4),
  ('meet-info','timing_text','text','Timing System','Electronic touchpad timing backed by plunger and manual backup systems. All results processed via Hy-Tek Meet Manager.',5),
  ('meet-info','rules_text','text','Technical Rules','Competition conducted under World Aquatics rules. No video review. Swim caps are compulsory at the CAC pool.',6),
  ('meet-info','dryland_text','text','Dryland Area','Dedicated dryland warm-up/recovery zone with yoga mats, stretch cords, and foam rollers.',7),
  ('meet-info','age_groups_text','text','Age Groups Description','Five age groups: 8 & Under, 9–10, 11–12, 13–14, and 15 & Over. Swimmers may age up but cannot compete in more than one age group.',8),
  ('meet-info','age_groups_table','json','Age Group Table','[{"group":"8 & Under","format":"Timed Finals","day":"Friday","session":"Morning only"},{"group":"9–10","format":"Timed Finals","day":"Saturday","session":"Morning only"},{"group":"11–12","format":"Prelims / Finals","day":"Both days","session":"AM Prelims, PM Finals"},{"group":"13–14","format":"Prelims / Finals","day":"Both days","session":"AM Prelims, PM Finals"},{"group":"15 & Over","format":"Prelims / Finals","day":"Both days","session":"AM Prelims, PM Finals"}]',9),
  ('meet-info','entry_limits_table','json','Entry Limits Table','[{"category":"Per event (individual)","limit":"6 swimmers / school"},{"category":"50m Freestyle (all ages)","limit":"Unlimited entries"},{"category":"Per relay event","limit":"2 teams / school"},{"category":"Events per swimmer","limit":"Max 6 (any ind/relay split)"},{"category":"200m Free (11+)","limit":"Max 3 swimmers / school"},{"category":"Exhibition (EX)","limit":"Non-scoring, no finals"}]',10),
  ('meet-info','scoring_rules','json','Scoring Rules','["Only finals results score — prelims do not earn points","Timed Finals score based on final results","Exhibition swims do not score","Mixed relay points split equally between Boys and Girls totals","Each age group scored separately — all combine for team championship"]',11),
  ('meet-info','awards_table','json','Awards','[{"category":"Medals","award":"1st – 3rd Place"},{"category":"Ribbons","award":"4th – Last Place"},{"category":"Age Group Awards","award":"Top Team per age group"},{"category":"Boys Team Champion","award":"Trophy"},{"category":"Girls Team Champion","award":"Trophy"},{"category":"Overall Team Champion","award":"Trophy (combined Boys + Girls)"}]',12),
  ('meet-info','mixed_relay_text','text','Mixed Relay Rules','Mixed relays: 2 boys + 2 girls. Points split equally between Boys and Girls team totals.',13),
  ('meet-info','session_structure_text','text','Session Structure','Morning Prelims / Evening Finals for 11+ age groups. 8&U Timed Finals on Friday morning. 9–10 Timed Finals on Saturday morning. Awards presented periodically throughout each session after each final. Team trophies after the last relay on Saturday evening.',14),
  ('meet-info','seeding_text','text','Seeding Method','Circle seeding (fastest swimmers in center lanes). NT entries seeded last. Separate heats per age group for all 11+ events.',15),
  ('meet-info','protest_text','text','Protest Procedure','Written protest to the Meet Referee within 30 minutes of results posting. No protest fee. Meet Referee decision is final.',16),
  ('meet-info','officials_text','text','Officials','CAC staff + hired officials from the Egyptian Swimming Federation. Certified Meet Referee from the Egyptian Federation. Lifeguards on duty throughout all sessions. First aid station on deck.',17),
  ('meet-info','entry_policy_text','text','Entry Policies','Deadline: 72 hours before the meet. Format: Hy-Tek Team Manager files only (.hy3 / .cl2). No Time (NT): Accepted — seeded last. Deck entries: Not accepted. Entry fee: 1,500 EGP per swimmer.',18);

-- SESSIONS PAGE
INSERT INTO content_blocks (page_slug, block_key, block_type, label, content, sort_order) VALUES
  ('sessions','fri_session_8u_title','text','Friday: 8&U Title','8 & Under — Timed Finals',1),
  ('sessions','fri_session_8u_desc','text','Friday: 8&U Description','All 8&U individual and relay events. Swimmers may not compete in both 25m and 50m Freestyle.',2),
  ('sessions','fri_session_1_title','text','Friday: Session 1 Title','Session 1 — 11+ Prelims',3),
  ('sessions','fri_session_1_desc','text','Friday: Session 1 Description','200 Free (TF), 50 Breast, 100 Back, 50 Fly, 100 Free, 100 IM, 4×50 Mixed Medley Relay (TF).',4),
  ('sessions','fri_session_2_title','text','Friday: Session 2 Title','Session 2 — 11+ Finals',5),
  ('sessions','fri_session_2_desc','text','Friday: Session 2 Description','50 Breast, 100 Back, 50 Fly, 100 Free, 100 IM Finals. Awards after each final.',6),
  ('sessions','sat_session_1_title','text','Saturday: Session 1 Title','Session 1 — 9–10 Timed Finals',7),
  ('sessions','sat_session_1_desc','text','Saturday: Session 1 Description','200 Free, 25/50 Breast, 50/100 Back, 25/50 Fly, 100 Free, 50 Free, 100 IM, 4×50 FR Relay, 4×25 Mixed Medley Relay.',8),
  ('sessions','sat_session_2_title','text','Saturday: Session 2 Title','Session 2 — 11+ Prelims',9),
  ('sessions','sat_session_2_desc','text','Saturday: Session 2 Description','200 IM (TF), 100 Breast, 50 Back, 100 Fly, 50 Free.',10),
  ('sessions','sat_session_3_title','text','Saturday: Session 3 Title','Session 3 — 11+ Finals + Closing Relays',11),
  ('sessions','sat_session_3_desc','text','Saturday: Session 3 Description','100 Breast, 50 Back, 100 Fly, 50 Free Finals. 4×50 Medley Relay, 4×50 Free Relay. Team trophies after last relay.',12);

-- WARMUP PAGE
INSERT INTO content_blocks (page_slug, block_key, block_type, label, content, sort_order) VALUES
  ('warmup','pool_rules','text','Pool Rules','Swim caps are compulsory at the CAC pool. No diving from the side during warm-up except in designated sprint lanes. One-way swimming in all lanes.',1),
  ('warmup','lane_assignments','text','Lane Assignments','Lane assignments will be posted poolside and distributed to coaches at check-in. Sprint lanes will be clearly marked.',2),
  ('warmup','timing_note','text','Timing','Teams should arrive at least 15 minutes before their designated warm-up time. Late arrivals may forfeit warm-up time.',3),
  ('warmup','safety_note','text','Safety','A lifeguard will be on duty during all warm-up sessions. Coaches are responsible for supervising their swimmers at all times.',4);

-- FEES PAGE
INSERT INTO content_blocks (page_slug, block_key, block_type, label, content, sort_order) VALUES
  ('fees','fees_intro','text','Fees Intro','Entry fees are due per swimmer, regardless of the number of events entered. Payment must be received before the entry deadline to confirm participation.',1),
  ('fees','invoices_placeholder','text','Invoices Placeholder','Individual school invoices will be posted here once entry registrations are confirmed.',2),
  ('fees','policy_1','text','Policy 1','Fees are non-refundable after the entry deadline.',3),
  ('fees','policy_2','text','Policy 2','All entries must be submitted via Hy-Tek Team Manager at least 72 hours before the meet.',4),
  ('fees','policy_3','text','Policy 3','Schools with outstanding balances from previous meets must settle before new entries are accepted.',5),
  ('fees','policy_4','text','Policy 4','For payment queries, contact the Aquatics Department.',6);

-- RESULTS PAGE
INSERT INTO content_blocks (page_slug, block_key, block_type, label, content, sort_order) VALUES
  ('results','results_intro','text','Results Intro','Live results are available during the meet via the Meet Mobile app. Download Meet Mobile from the App Store (iOS) or Google Play (Android) and search for "Swimming Eagles Invitational" to follow along in real time.',1),
  ('results','results_placeholder','text','Results Placeholder','Post-session results PDFs will be posted here after each session is complete.',2);

-- STREAM PAGE
INSERT INTO content_blocks (page_slug, block_key, block_type, label, content, sort_order) VALUES
  ('stream','stream_intro','text','Stream Intro','Watch the Swimming Eagles Invitational Series live from the Hassan and Webb Aquatics Center. The stream will go live during meet sessions.',1),
  ('stream','stream_placeholder','text','Stream Placeholder','Live stream will be available here on meet day.',2);

-- ENTRIES PAGE
INSERT INTO content_blocks (page_slug, block_key, block_type, label, content, sort_order) VALUES
  ('entries','entry_steps','text','Entry Steps','1. Download the Hy-Tek Team Manager entry file (.cl2) below\n2. Import the file into Hy-Tek Team Manager on your computer\n3. Enter your swimmers and their events in Team Manager\n4. Export the completed entry file (.hy3)\n5. Submit your entry file via the Google Form below at least 72 hours before the meet',1);

-- CONTACT PAGE
INSERT INTO content_blocks (page_slug, block_key, block_type, label, content, sort_order) VALUES
  ('contact','contact_intro','text','Contact Intro','Complete the interest form or reach out to our team directly. Full meet information packets, entry deadlines, and psych sheets will be distributed to all registered schools well ahead of each meet date.',1);

-- ═══ EVENTS ═══

-- Day 1 Morning: 8&U
INSERT INTO events (event_number,gender,event_name,distance,stroke,age_group,format,day,session,sort_order,is_break,break_label) VALUES
(1,'girls','25 Freestyle',25,'freestyle','8u','timed_final',1,'morning',1,false,NULL),
(2,'boys','25 Freestyle',25,'freestyle','8u','timed_final',1,'morning',2,false,NULL),
(3,'girls','50 Freestyle',50,'freestyle','8u','timed_final',1,'morning',3,false,NULL),
(4,'boys','50 Freestyle',50,'freestyle','8u','timed_final',1,'morning',4,false,NULL),
(5,'girls','25 Backstroke',25,'backstroke','8u','timed_final',1,'morning',5,false,NULL),
(6,'boys','25 Backstroke',25,'backstroke','8u','timed_final',1,'morning',6,false,NULL),
(7,'girls','25 Breaststroke',25,'breaststroke','8u','timed_final',1,'morning',7,false,NULL),
(8,'boys','25 Breaststroke',25,'breaststroke','8u','timed_final',1,'morning',8,false,NULL),
(9,'girls','25 Butterfly',25,'butterfly','8u','timed_final',1,'morning',9,false,NULL),
(10,'boys','25 Butterfly',25,'butterfly','8u','timed_final',1,'morning',10,false,NULL),
(11,'girls','4×25 Freestyle Relay',NULL,'relay','8u','timed_final',1,'morning',11,false,NULL),
(12,'boys','4×25 Freestyle Relay',NULL,'relay','8u','timed_final',1,'morning',12,false,NULL),
(0,'mixed','Break',NULL,NULL,'8u','timed_final',1,'morning',13,true,'Break');

-- Day 1 Morning: 11+ Prelims
INSERT INTO events (event_number,gender,event_name,distance,stroke,age_group,format,day,session,sort_order,is_break,break_label) VALUES
(13,'girls','200 Freestyle',200,'freestyle','11+','timed_final',1,'morning',14,false,NULL),
(14,'boys','200 Freestyle',200,'freestyle','11+','timed_final',1,'morning',15,false,NULL),
(15,'girls','50 Breaststroke',50,'breaststroke','11+','prelims',1,'morning',16,false,NULL),
(16,'boys','50 Breaststroke',50,'breaststroke','11+','prelims',1,'morning',17,false,NULL),
(17,'girls','100 Backstroke',100,'backstroke','11+','prelims',1,'morning',18,false,NULL),
(18,'boys','100 Backstroke',100,'backstroke','11+','prelims',1,'morning',19,false,NULL),
(19,'girls','50 Butterfly',50,'butterfly','11+','prelims',1,'morning',20,false,NULL),
(20,'boys','50 Butterfly',50,'butterfly','11+','prelims',1,'morning',21,false,NULL),
(21,'girls','100 Freestyle',100,'freestyle','11+','prelims',1,'morning',22,false,NULL),
(22,'boys','100 Freestyle',100,'freestyle','11+','prelims',1,'morning',23,false,NULL),
(23,'girls','100 IM',100,'im','11+','prelims',1,'morning',24,false,NULL),
(24,'boys','100 IM',100,'im','11+','prelims',1,'morning',25,false,NULL),
(25,'mixed','4×50 Mixed Medley Relay',NULL,'relay','11+','timed_final',1,'morning',26,false,NULL);

-- Day 1 Evening: 11+ Finals
INSERT INTO events (event_number,gender,event_name,distance,stroke,age_group,format,day,session,sort_order,is_break,break_label) VALUES
(15,'girls','50 Breaststroke',50,'breaststroke','11+','finals',1,'evening',1,false,NULL),
(16,'boys','50 Breaststroke',50,'breaststroke','11+','finals',1,'evening',2,false,NULL),
(17,'girls','100 Backstroke',100,'backstroke','11+','finals',1,'evening',3,false,NULL),
(18,'boys','100 Backstroke',100,'backstroke','11+','finals',1,'evening',4,false,NULL),
(19,'girls','50 Butterfly',50,'butterfly','11+','finals',1,'evening',5,false,NULL),
(20,'boys','50 Butterfly',50,'butterfly','11+','finals',1,'evening',6,false,NULL),
(21,'girls','100 Freestyle',100,'freestyle','11+','finals',1,'evening',7,false,NULL),
(22,'boys','100 Freestyle',100,'freestyle','11+','finals',1,'evening',8,false,NULL),
(23,'girls','100 IM',100,'im','11+','finals',1,'evening',9,false,NULL),
(24,'boys','100 IM',100,'im','11+','finals',1,'evening',10,false,NULL);

-- Day 2 Morning: 9-10
INSERT INTO events (event_number,gender,event_name,distance,stroke,age_group,format,day,session,sort_order,is_break,break_label) VALUES
(27,'girls','200 Freestyle',200,'freestyle','9-10','timed_final',2,'morning',1,false,NULL),
(28,'boys','200 Freestyle',200,'freestyle','9-10','timed_final',2,'morning',2,false,NULL),
(29,'girls','25 Breaststroke',25,'breaststroke','9-10','timed_final',2,'morning',3,false,NULL),
(30,'boys','25 Breaststroke',25,'breaststroke','9-10','timed_final',2,'morning',4,false,NULL),
(31,'girls','100 Backstroke',100,'backstroke','9-10','timed_final',2,'morning',5,false,NULL),
(32,'boys','100 Backstroke',100,'backstroke','9-10','timed_final',2,'morning',6,false,NULL),
(33,'girls','25 Butterfly',25,'butterfly','9-10','timed_final',2,'morning',7,false,NULL),
(34,'boys','25 Butterfly',25,'butterfly','9-10','timed_final',2,'morning',8,false,NULL),
(35,'girls','50 Freestyle',50,'freestyle','9-10','timed_final',2,'morning',9,false,NULL),
(36,'boys','50 Freestyle',50,'freestyle','9-10','timed_final',2,'morning',10,false,NULL),
(37,'girls','50 Breaststroke',50,'breaststroke','9-10','timed_final',2,'morning',11,false,NULL),
(38,'boys','50 Breaststroke',50,'breaststroke','9-10','timed_final',2,'morning',12,false,NULL),
(39,'girls','100 Freestyle',100,'freestyle','9-10','timed_final',2,'morning',13,false,NULL),
(40,'boys','100 Freestyle',100,'freestyle','9-10','timed_final',2,'morning',14,false,NULL),
(41,'girls','50 Backstroke',50,'backstroke','9-10','timed_final',2,'morning',15,false,NULL),
(42,'boys','50 Backstroke',50,'backstroke','9-10','timed_final',2,'morning',16,false,NULL),
(43,'girls','50 Butterfly',50,'butterfly','9-10','timed_final',2,'morning',17,false,NULL),
(44,'boys','50 Butterfly',50,'butterfly','9-10','timed_final',2,'morning',18,false,NULL),
(45,'girls','100 IM',100,'im','9-10','timed_final',2,'morning',19,false,NULL),
(46,'boys','100 IM',100,'im','9-10','timed_final',2,'morning',20,false,NULL),
(47,'girls','4×50 Freestyle Relay',NULL,'relay','9-10','timed_final',2,'morning',21,false,NULL),
(48,'boys','4×50 Freestyle Relay',NULL,'relay','9-10','timed_final',2,'morning',22,false,NULL),
(49,'mixed','4×25 Mixed Medley Relay',NULL,'relay','9-10','timed_final',2,'morning',23,false,NULL),
(0,'mixed','Break',NULL,NULL,'9-10','timed_final',2,'morning',24,true,'Break');

-- Day 2 Morning: 11+ Prelims
INSERT INTO events (event_number,gender,event_name,distance,stroke,age_group,format,day,session,sort_order,is_break,break_label) VALUES
(51,'girls','200 IM',200,'im','11+','timed_final',2,'morning',25,false,NULL),
(52,'boys','200 IM',200,'im','11+','timed_final',2,'morning',26,false,NULL),
(53,'girls','100 Breaststroke',100,'breaststroke','11+','prelims',2,'morning',27,false,NULL),
(54,'boys','100 Breaststroke',100,'breaststroke','11+','prelims',2,'morning',28,false,NULL),
(55,'girls','50 Backstroke',50,'backstroke','11+','prelims',2,'morning',29,false,NULL),
(56,'boys','50 Backstroke',50,'backstroke','11+','prelims',2,'morning',30,false,NULL),
(57,'girls','100 Butterfly',100,'butterfly','11+','prelims',2,'morning',31,false,NULL),
(58,'boys','100 Butterfly',100,'butterfly','11+','prelims',2,'morning',32,false,NULL),
(59,'girls','50 Freestyle',50,'freestyle','11+','prelims',2,'morning',33,false,NULL),
(60,'boys','50 Freestyle',50,'freestyle','11+','prelims',2,'morning',34,false,NULL);

-- Day 2 Evening: 11+ Finals + Closing Relays
INSERT INTO events (event_number,gender,event_name,distance,stroke,age_group,format,day,session,sort_order,is_break,break_label) VALUES
(53,'girls','100 Breaststroke',100,'breaststroke','11+','finals',2,'evening',1,false,NULL),
(54,'boys','100 Breaststroke',100,'breaststroke','11+','finals',2,'evening',2,false,NULL),
(55,'girls','50 Backstroke',50,'backstroke','11+','finals',2,'evening',3,false,NULL),
(56,'boys','50 Backstroke',50,'backstroke','11+','finals',2,'evening',4,false,NULL),
(57,'girls','100 Butterfly',100,'butterfly','11+','finals',2,'evening',5,false,NULL),
(58,'boys','100 Butterfly',100,'butterfly','11+','finals',2,'evening',6,false,NULL),
(59,'girls','50 Freestyle',50,'freestyle','11+','finals',2,'evening',7,false,NULL),
(60,'boys','50 Freestyle',50,'freestyle','11+','finals',2,'evening',8,false,NULL),
(61,'girls','4×50 Medley Relay',NULL,'relay','11+','timed_final',2,'evening',9,false,NULL),
(62,'boys','4×50 Medley Relay',NULL,'relay','11+','timed_final',2,'evening',10,false,NULL),
(63,'girls','4×50 Freestyle Relay',NULL,'relay','11+','timed_final',2,'evening',11,false,NULL),
(64,'boys','4×50 Freestyle Relay',NULL,'relay','11+','timed_final',2,'evening',12,false,NULL);

-- ═══ VERIFICATION ═══
-- SELECT count(*) FROM events;          -- 77 rows
-- SELECT count(*) FROM content_blocks;  -- ~60 rows
-- SELECT count(*) FROM pages;           -- 11 rows
-- SELECT * FROM site_settings;          -- 1 row with all fields
