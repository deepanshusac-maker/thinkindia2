import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for use in Client Components (browser-side).
 * Uses the public anon key — safe to expose in the browser.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Get the public URL for an asset. Safe for use in both Client and Server Components.
 * @param {string} path - The storage path
 * @returns {string} The public URL
 */
export function getAssetUrl(path) {
  if (!path) return null;
  // If it's already a full URL, return as-is
  if (path.startsWith("http")) return path;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const BUCKET = "institute-assets";
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${path}`;
}

