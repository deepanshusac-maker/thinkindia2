// Placeholder: Admin Content CRUD page
// This route will manage team members, events, and gallery items.

import { requireAuth } from "@/lib/auth";

export const metadata = {
  title: "Manage Content — Think India Bihar Admin",
};

export default async function AdminContentPage() {
  await requireAuth();

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Manage Content</h1>
      <p style={{ color: "rgba(255,255,255,0.5)", marginTop: "1rem" }}>
        🚧 Content management panel (team, events, gallery) — coming soon.
      </p>
    </main>
  );
}
