-- =============================================================
-- Think India Bihar — Storage Bucket Setup
-- =============================================================
-- Run this in the Supabase SQL Editor AFTER the schema migration.
-- =============================================================

-- -----------------------------------------------
-- 1. CREATE STORAGE BUCKET
-- -----------------------------------------------
-- The 'institute-assets' bucket stores photos for team members,
-- events, and gallery images.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'institute-assets',
  'institute-assets',
  true,                          -- publicly readable
  5242880,                       -- 5 MB max file size
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------
-- 2. STORAGE POLICIES
-- -----------------------------------------------

-- Anyone can view/download files (public bucket)
CREATE POLICY "Public can view assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'institute-assets');

-- Only authenticated users (admins) can upload
CREATE POLICY "Admins can upload assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'institute-assets'
    AND auth.role() = 'authenticated'
  );

-- Only authenticated users (admins) can update
CREATE POLICY "Admins can update assets"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'institute-assets'
    AND auth.role() = 'authenticated'
  );

-- Only authenticated users (admins) can delete
CREATE POLICY "Admins can delete assets"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'institute-assets'
    AND auth.role() = 'authenticated'
  );
