-- =============================================================
-- Think India Bihar — Database Schema
-- =============================================================
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- or via the Supabase CLI: supabase db push
-- =============================================================

-- -----------------------------------------------
-- 1. INSTITUTES TABLE
-- -----------------------------------------------
-- Stores information about each institute/chapter.

CREATE TABLE IF NOT EXISTS public.institutes (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  about_text  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_institutes_slug ON public.institutes (slug);

-- Auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_institutes_updated_at
  BEFORE UPDATE ON public.institutes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------
-- 2. CONTENT TABLE
-- -----------------------------------------------
-- Stores content items (team members, events, gallery photos)
-- linked to an institute.

CREATE TYPE public.content_type AS ENUM ('team', 'event', 'gallery');

CREATE TABLE IF NOT EXISTS public.content (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institute_id  UUID NOT NULL REFERENCES public.institutes(id) ON DELETE CASCADE,
  type          public.content_type NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  image_url     TEXT,
  metadata      JSONB DEFAULT '{}'::jsonb,
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index for querying content by institute and type
CREATE INDEX IF NOT EXISTS idx_content_institute_type
  ON public.content (institute_id, type);

-- Auto-update the updated_at timestamp
CREATE TRIGGER set_content_updated_at
  BEFORE UPDATE ON public.content
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS)
-- -----------------------------------------------
-- Public read access, admin-only write access.

ALTER TABLE public.institutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- Public can read all institutes
CREATE POLICY "Public can view institutes"
  ON public.institutes FOR SELECT
  USING (true);

-- Only authenticated users (admins) can insert/update/delete institutes
CREATE POLICY "Admins can insert institutes"
  ON public.institutes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update institutes"
  ON public.institutes FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete institutes"
  ON public.institutes FOR DELETE
  USING (auth.role() = 'authenticated');

-- Public can read all content
CREATE POLICY "Public can view content"
  ON public.content FOR SELECT
  USING (true);

-- Only authenticated users (admins) can insert/update/delete content
CREATE POLICY "Admins can insert content"
  ON public.content FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update content"
  ON public.content FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete content"
  ON public.content FOR DELETE
  USING (auth.role() = 'authenticated');
