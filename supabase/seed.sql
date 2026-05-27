-- =============================================================
-- Think India Bihar — Seed Data
-- =============================================================
-- Optional: Run this to populate the database with sample data.
-- =============================================================

-- Insert a sample institute
INSERT INTO public.institutes (name, slug, about_text)
VALUES (
  'Think India Bihar',
  'think-india-bihar',
  'Think India Bihar is a platform for law students and young professionals committed to nation-building through policy research, legal awareness, and civic engagement across Bihar.'
);

-- Insert sample content (team members)
INSERT INTO public.content (institute_id, type, title, description, image_url, sort_order)
SELECT
  id,
  'team',
  'Deepanshu Kumar',
  'State Coordinator — Think India Bihar',
  NULL,
  1
FROM public.institutes
WHERE slug = 'think-india-bihar';

-- Insert a sample event
INSERT INTO public.content (institute_id, type, title, description, metadata, sort_order)
SELECT
  id,
  'event',
  'National Law Conference 2026',
  'A two-day conference on constitutional governance and legal reforms, hosted in Patna.',
  '{"date": "2026-07-15", "location": "Patna, Bihar"}'::jsonb,
  1
FROM public.institutes
WHERE slug = 'think-india-bihar';

-- Insert a sample gallery item
INSERT INTO public.content (institute_id, type, title, description, sort_order)
SELECT
  id,
  'gallery',
  'Inaugural Ceremony',
  'Photos from the Think India Bihar chapter launch event.',
  1
FROM public.institutes
WHERE slug = 'think-india-bihar';
