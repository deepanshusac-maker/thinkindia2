import { createClient } from "@/lib/supabase/server";

const BUCKET = "institute-assets";

/**
 * Upload a file to the institute-assets bucket.
 * @param {File} file - The file to upload
 * @param {string} path - The storage path (e.g., "institute-slug/team/photo.jpg")
 * @returns {string} The public URL of the uploaded file
 */
export async function uploadAsset(file, path) {
  const supabase = await createClient();

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Delete a file from the institute-assets bucket.
 * @param {string} path - The storage path to delete
 */
export async function deleteAsset(path) {
  const supabase = await createClient();
  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([path]);

  if (error) throw error;
}

/**
 * Get the public URL for an asset.
 * @param {string} path - The storage path
 * @returns {string} The public URL
 */
export function getAssetUrl(path) {
  if (!path) return null;
  // If it's already a full URL, return as-is
  if (path.startsWith("http")) return path;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${path}`;
}
