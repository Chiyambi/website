-- Apply to projects that already ran schema.sql before admin-only policies were added.
-- This migration is safe to rerun.

BEGIN;

DROP POLICY IF EXISTS "Authenticated full access" ON hero_slides;
DROP POLICY IF EXISTS "Authenticated full access" ON projects;
DROP POLICY IF EXISTS "Authenticated full access" ON services;
DROP POLICY IF EXISTS "Authenticated full access" ON stats;
DROP POLICY IF EXISTS "Authenticated full access" ON site_settings;
DROP POLICY IF EXISTS "Authenticated full access" ON contact_info;
DROP POLICY IF EXISTS "Authenticated full access" ON about_section;

DROP POLICY IF EXISTS "Admin full access" ON hero_slides;
DROP POLICY IF EXISTS "Admin full access" ON projects;
DROP POLICY IF EXISTS "Admin full access" ON services;
DROP POLICY IF EXISTS "Admin full access" ON stats;
DROP POLICY IF EXISTS "Admin full access" ON site_settings;
DROP POLICY IF EXISTS "Admin full access" ON contact_info;
DROP POLICY IF EXISTS "Admin full access" ON about_section;

CREATE POLICY "Admin full access" ON hero_slides FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin full access" ON projects FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin full access" ON services FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin full access" ON stats FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin full access" ON site_settings FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin full access" ON contact_info FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin full access" ON about_section FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Authenticated upload access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete access" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload access" ON storage.objects;
DROP POLICY IF EXISTS "Admin update access" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete access" ON storage.objects;

CREATE POLICY "Admin upload access" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id IN ('project-images', 'project-videos', 'hero-images', 'general') AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin update access" ON storage.objects FOR UPDATE
  USING (bucket_id IN ('project-images', 'project-videos', 'hero-images', 'general') AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK (bucket_id IN ('project-images', 'project-videos', 'hero-images', 'general') AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin delete access" ON storage.objects FOR DELETE
  USING (bucket_id IN ('project-images', 'project-videos', 'hero-images', 'general') AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

COMMIT;