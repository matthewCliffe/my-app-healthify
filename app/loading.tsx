export default function Loading() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
      <div className="card w-full max-w-lg p-10 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-emerald-700">Loading</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">Preparing Healthify</h1>
        <p className="mt-3 text-slate-600">Fetching your dashboard, goals, meals, and workouts.</p>
      </div>
    </main>
  );
}
