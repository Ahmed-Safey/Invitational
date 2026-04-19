-- Admin allow-list + tightened RLS
-- Only users whose email (or id) is in the `admins` table can write.
-- Anonymous + authenticated non-admins can still read published content.

CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Seed the initial admin (update the email if you rename the owner account)
INSERT INTO admins (email) VALUES ('asafey@cacegypt.org')
ON CONFLICT (email) DO NOTHING;

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Only admins can read or modify the admins table itself
DROP POLICY IF EXISTS admins_self_read ON admins;
CREATE POLICY admins_self_read ON admins FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'email' IN (SELECT email FROM admins));

DROP POLICY IF EXISTS admins_self_write ON admins;
CREATE POLICY admins_self_write ON admins FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' IN (SELECT email FROM admins))
  WITH CHECK (auth.jwt() ->> 'email' IN (SELECT email FROM admins));

-- Helper: is_admin() returns true if the calling user's email is in the admins table
CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt() ->> 'email');
$$;

-- Replace the permissive authenticated-role policies with admin-only policies
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'site_settings','pages','content_blocks','events','seasons',
    'scoring_table','media','programs','bank_details'
  ];
  policy_name text;
BEGIN
  FOREACH t IN ARRAY tables LOOP
    policy_name := 'auth_all_' || CASE t
      WHEN 'site_settings' THEN 'settings'
      WHEN 'bank_details' THEN 'bank'
      WHEN 'content_blocks' THEN 'content'
      WHEN 'scoring_table' THEN 'scoring'
      ELSE t
    END;

    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_name, t);
    EXECUTE format(
      'CREATE POLICY admin_all_%I ON %I FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin())',
      t, t
    );
  END LOOP;
END $$;
