// Placeholder: Admin Gallery CRUD page
// This route will manage photo uploads to Supabase Storage.

import { requireAuth } from "@/lib/auth";

export const metadata = {
  title: "Manage Gallery — Think India Bihar Admin",
};

export default async function AdminGalleryPage() {
  await requireAuth();

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Manage Gallery</h1>
      <p style={{ color: "rgba(255,255,255,0.5)", marginTop: "1rem" }}>
        🚧 Gallery management with photo uploads — coming soon.
      </p>
    </main>
  );
}
