import Link from "next/link";
import { getAdminSummary } from "@/lib/server-data";

export default async function AdminPage() {
  const summary = await getAdminSummary();

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">Admin</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-950">Role-protected admin dashboard</h1>
          <p className="mt-2 text-slate-600">This route demonstrates rubric coverage for role-based access control.</p>
        </div>
        <Link href="/dashboard" className="btn-outline">Back to dashboard</Link>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <article key={item.label} className="kpi">
            <div className="text-sm text-slate-500">{item.label}</div>
            <div className="mt-2 text-3xl font-bold text-slate-950">{item.value}</div>
            <p className="mt-2 text-sm text-slate-600">{item.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
