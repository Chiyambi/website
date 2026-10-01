-- ============================================
-- EPH-B.com Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: hero_slides
-- ============================================
CREATE TABLE IF NOT EXISTS hero_slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  headline TEXT NOT NULL,
  sub_headline TEXT NOT NULL,
  cta_text TEXT DEFAULT 'Get Started',
  cta_link TEXT DEFAULT '#contact',
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLE: projects
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  media_url TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'image' CHECK (type IN ('image', 'video')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLE: services
-- ============================================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT DEFAULT 'fas fa-hard-hat',
  features JSONB DEFAULT '[]'::jsonb,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLE: stats
-- ============================================
CREATE TABLE IF NOT EXISTS stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  icon TEXT DEFAULT 'fas fa-chart-line',
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLE: site_settings
-- ============================================
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLE: contact_info
-- ============================================
CREATE TABLE IF NOT EXISTS contact_info (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  phone_primary TEXT DEFAULT '',
  phone_secondary TEXT DEFAULT '',
  email TEXT DEFAULT '',
  whatsapp TEXT DEFAULT '',
  location TEXT DEFAULT '',
  facebook TEXT DEFAULT '',
  twitter TEXT DEFAULT '',
  instagram TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLE: about_section
-- ============================================
CREATE TABLE IF NOT EXISTS about_section (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  heading TEXT NOT NULL,
  paragraph TEXT NOT NULL,
  image_url TEXT DEFAULT '',
  features JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_hero_slides_active ON hero_slides(active);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(active);
CREATE INDEX IF NOT EXISTS idx_stats_active ON stats(active);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_section ENABLE ROW LEVEL SECURITY;

-- Public read access (everyone can view)
CREATE POLICY "Public read access" ON hero_slides FOR SELECT USING (true);
CREATE POLICY "Public read access" ON projects FOR SELECT USING (true);
CREATE POLICY "Public read access" ON services FOR SELECT USING (true);
CREATE POLICY "Public read access" ON stats FOR SELECT USING (true);
CREATE POLICY "Public read access" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public read access" ON contact_info FOR SELECT USING (true);
CREATE POLICY "Public read access" ON about_section FOR SELECT USING (true);

-- Only accounts with trusted app_metadata.role = 'admin' may write content.
DROP POLICY IF EXISTS "Authenticated full access" ON hero_slides;
DROP POLICY IF EXISTS "Authenticated full access" ON projects;
DROP POLICY IF EXISTS "Authenticated full access" ON services;
DROP POLICY IF EXISTS "Authenticated full access" ON stats;
DROP POLICY IF EXISTS "Authenticated full access" ON site_settings;
DROP POLICY IF EXISTS "Authenticated full access" ON contact_info;
DROP POLICY IF EXISTS "Authenticated full access" ON about_section;
CREATE POLICY "Admin full access" ON hero_slides FOR ALL USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin full access" ON projects FOR ALL USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin full access" ON services FOR ALL USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin full access" ON stats FOR ALL USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin full access" ON site_settings FOR ALL USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin full access" ON contact_info FOR ALL USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin full access" ON about_section FOR ALL USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ============================================
-- STORAGE BUCKETS
-- Run these in: Supabase Dashboard → Storage → New Bucket
-- Or use the SQL below:
-- ============================================

-- Create storage buckets (run in SQL editor)
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('project-videos', 'project-videos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-images', 'hero-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('general', 'general', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: public read
CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (bucket_id IN ('project-images', 'project-videos', 'hero-images', 'general'));

-- Storage writes require the same trusted admin claim as content writes.
CREATE POLICY "Admin upload access" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('project-images', 'project-videos', 'hero-images', 'general') AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin update access" ON storage.objects FOR UPDATE USING (bucket_id IN ('project-images', 'project-videos', 'hero-images', 'general') AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') WITH CHECK (bucket_id IN ('project-images', 'project-videos', 'hero-images', 'general') AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin delete access" ON storage.objects FOR DELETE USING (bucket_id IN ('project-images', 'project-videos', 'hero-images', 'general') AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ============================================
-- SEED DATA (optional - matches current site)
-- ============================================

-- Hero slides
INSERT INTO hero_slides (image_url, headline, sub_headline, cta_text, cta_link, sort_order) VALUES
('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1920', 'Building Dreams Into Reality', 'Premium construction services in Malawi — from architectural design to full project delivery.', 'Get Started', '#contact', 1),
('https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1920', 'Expert Construction Services', 'Schools, homes, resorts, and commercial buildings — built with quality and precision.', 'View Projects', '#portfolio', 2),
('https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1920', 'Trusted Since 2020', '50+ successful projects across Malawi with 94% client satisfaction.', 'Contact Us', '#contact', 3);

-- Services
INSERT INTO services (title, description, icon, features, sort_order) VALUES
('Architectural Design', 'Custom house plans, 3D visualization, and space optimization tailored to your needs.', 'fas fa-drafting-compass', '["Custom House Plans", "3D Visualization", "Space Optimization"]', 1),
('Full Construction', 'End-to-end construction with project monitoring, quality control, and timeline management.', 'fas fa-hard-hat', '["Project Monitoring", "Quality Control", "Timeline Management"]', 2),
('Commercial Projects', 'Office buildings, retail spaces, and industrial facilities built to the highest standards.', 'fas fa-building', '["Office Buildings", "Retail Spaces", "Industrial Facilities"]', 3),
('Surveying Services', 'Professional land surveying, title deed processing, and beacon creation services.', 'fas fa-map-marked-alt', '["Land Measurements", "Title Deed Processing", "Beacon Creation"]', 4);

-- Stats
INSERT INTO stats (value, label, icon, sort_order) VALUES
('50+', 'Projects Completed', 'fas fa-building', 1),
('4+', 'Years Experience', 'fas fa-calendar-alt', 2),
('94%', 'Client Satisfaction', 'fas fa-smile', 3),
('24/7', 'Support Available', 'fas fa-headset', 4);

-- Contact info
INSERT INTO contact_info (phone_primary, phone_secondary, email, whatsapp, location, facebook, twitter, instagram) VALUES
('+265 882 96 87 02', '+265 994 80 03 29', 'contact@ephb-construction.com', '+265882968702', 'Malawi, Africa', 'https://facebook.com/ephb-construction', 'https://twitter.com/ephb_construction', 'https://instagram.com/ephb_construction');

-- About section
INSERT INTO about_section (heading, paragraph, image_url, features) VALUES
('About EPH-B Design and Construction', 'We are a Malawian construction company dedicated to building dreams into reality. With over 50 completed projects, we specialize in modern schools, luxury homes, cost-effective housing, beach resorts, and commercial buildings. Our team combines innovative design with quality craftsmanship to deliver projects on time and within budget.', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800', '["50+ Projects Completed", "Expert Team", "Quality Materials", "On-Time Delivery"]');

-- Site settings
INSERT INTO site_settings (key, value, description) VALUES
('site_name', 'EPH-B Design and Construction', 'Company name'),
('site_tagline', 'Building Dreams Into Reality', 'Company tagline'),
('footer_credit', 'This website was designed and developed by Chiyambi Chimamba, Contact 0980323560', 'Footer credit text');
