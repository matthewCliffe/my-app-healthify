import Link from "next/link";

export default async function AdminPage() {

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">Admin</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-950">Role-protected admin dashboard</h1>
          <p className="mt-2 text-slate-600">Demonstrates role protected control.</p>
        </div>
        <Link href="/dashboard" className="btn-outline">Back to dashboard</Link>
      </div>
    </main>
  );
}
