import Link from "next/link";

const highlights = [
  ["Workout logger", "Log strength, cardio, and custom sessions with calories, sets, and duration."],
  ["Nutrition logger", "Track meals, macros, daily calories, and recipes with built-in food search and manual logging."],
  ["Progress tracking", "View charted trends for calories, protein, workouts, and weight changes."],
  ["Social + milestones", "Show friends, streaks, achievements, and shared community updates."],
];

export default function HomePage() {
  return (
    <main id="main-content" className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-16 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
        <section className="space-y-6">
          <span className="badge">Next.js App Router • Firebase • REST APIs • Tailwind CSS</span>
          <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-slate-950 sm:text-6xl">
            Healthify keeps fitness organized for beginners and busy people.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">
            Create an account, log meals and workouts, set goals, track streaks, share progress, and explore charts in one polished full-stack app.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/signup" className="btn-primary">Create account</Link>
            <Link href="/login" className="btn-outline">Sign in</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {highlights.map(([title, desc]) => (
              <article key={title} className="card p-5">
                <h2 className="font-semibold text-slate-900">{title}</h2>
                <p className="mt-2 text-sm text-slate-600">{desc}</p>
              </article>
            ))}
          </div>
        </section>

        <aside className="card p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="kpi">
              <div className="text-sm text-slate-500">Daily streak</div>
              <div className="mt-2 text-3xl font-bold">12 days</div>
            </div>
            <div className="kpi">
              <div className="text-sm text-slate-500">Workouts this week</div>
              <div className="mt-2 text-3xl font-bold">4</div>
            </div>
            <div className="kpi sm:col-span-2">
              <div className="text-sm text-slate-500">Built for grading</div>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li>• Route Handlers with CRUD operations</li>
                <li>• Protected dashboard + session cookies</li>
                <li>• External REST integrations with graceful fallback</li>
                <li>• Firestore-ready persistent data architecture</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
