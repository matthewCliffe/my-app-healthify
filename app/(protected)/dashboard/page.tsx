import { DashboardClient } from "@/components/DashboardClient";
import { getDashboardData } from "@/lib/server-data";
import { hasFirebaseConfig } from "@/lib/firebase";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return <DashboardClient {...data} firebaseEnabled={hasFirebaseConfig()} />;
}
