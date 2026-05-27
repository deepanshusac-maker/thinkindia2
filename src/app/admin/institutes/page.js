// Placeholder: Admin Institutes CRUD page
// This route will list all institutes with create/edit/delete functionality.

import { requireAuth } from "@/lib/auth";

export const metadata = {
  title: "Manage Institutes — Think India Bihar Admin",
};

export default async function AdminInstitutesPage() {
  await requireAuth();

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Manage Institutes</h1>
      <p style={{ color: "rgba(255,255,255,0.5)", marginTop: "1rem" }}>
        🚧 Institute CRUD panel — coming soon.
      </p>
    </main>
  );
}
