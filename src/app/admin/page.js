import { requireAuth } from "@/lib/auth";
import AdminDashboard from "./AdminDashboard";

export const metadata = {
  title: "Admin Dashboard — Think India Bihar",
  description: "Manage institutes, team members, events, and gallery photos.",
};

export default async function AdminPage() {
  const user = await requireAuth();

  return <AdminDashboard userEmail={user.email} />;
}
