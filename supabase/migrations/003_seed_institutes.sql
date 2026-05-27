-- =============================================================
-- Think India Bihar — Seed Institutes
-- =============================================================
-- Run this in the Supabase SQL Editor to populate the 6 institutes.
-- =============================================================

INSERT INTO public.institutes (name, slug, about_text) VALUES
  ('NIT Patna', 'nit-patna',
   'Think India chapter at National Institute of Technology Patna, fostering legal awareness and civic engagement among engineering students.'),
  ('IIT Patna', 'iit-patna',
   'Think India chapter at Indian Institute of Technology Patna, driving policy research and constitutional governance initiatives.'),
  ('IIM Bodhgaya', 'iim-bodhgaya',
   'Think India chapter at Indian Institute of Management Bodhgaya, blending management perspectives with nation-building ideals.'),
  ('CNLU Patna', 'cnlu-patna',
   'Think India chapter at Chanakya National Law University Patna, empowering law students through legal research and reform advocacy.'),
  ('IIIT Bhagalpur', 'iiit-bhagalpur',
   'Think India chapter at Indian Institute of Information Technology Bhagalpur, bridging technology and public policy.'),
  ('NIFT Patna', 'nift-patna',
   'Think India chapter at National Institute of Fashion Technology Patna, integrating creative industries with civic responsibility.')
ON CONFLICT (slug) DO NOTHING;
