import { createClient } from "@/lib/supabase/server";

/**
 * Fetch all institutes, ordered by name.
 */
export async function getInstitutes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("institutes")
    .select("*")
    .order("name");

  if (error) throw error;
  return data;
}

/**
 * Fetch a single institute by its URL slug.
 */
export async function getInstituteBySlug(slug) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("institutes")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch content items for an institute, filtered by type.
 * @param {string} instituteId - UUID of the institute
 * @param {'team' | 'event' | 'gallery'} type - Content category
 */
export async function getContentByType(instituteId, type) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content")
    .select("*")
    .eq("institute_id", instituteId)
    .eq("type", type)
    .order("sort_order");

  if (error) throw error;
  return data;
}

/**
 * Fetch all content for an institute regardless of type.
 */
export async function getAllContent(instituteId) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content")
    .select("*")
    .eq("institute_id", instituteId)
    .order("type")
    .order("sort_order");

  if (error) throw error;
  return data;
}

/**
 * Fetch content items globally by type (e.g. 'event' or 'gallery')
 * and include their linked institute details using Supabase join relations.
 */
export async function getGlobalContent(type) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content")
    .select(`
      *,
      institutes (
        name,
        slug
      )
    `)
    .eq("type", type)
    .order("sort_order")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

