"use client";

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
      <div className="card p-8">
        <h1 className="text-3xl font-bold text-slate-950">Dashboard unavailable</h1>
        <p className="mt-3 text-slate-600">{error.message || "There was a problem loading the dashboard."}</p>
        <button onClick={reset} className="btn-primary mt-6">Reload dashboard</button>
      </div>
    </main>
  );
}
