import { AdminPanelClient } from "@/components/AdminPanelClient";
import { getAdminSummary } from "@/lib/server-data";

export default async function AdminPage() {
  const data = await getAdminSummary();
  return <AdminPanelClient users={data.users} />;
}
