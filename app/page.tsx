import Link from "next/link";

export default function HomePage() {
  return (
    <main id="main-content" className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
      <div className="grid gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
        <section className="space-y-6">
          <span className="badge">Using React, Next.js App Router, Firebase, and Tailwind CSS</span>
          <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-slate-950 sm:text-6xl">
            Healthify
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">
            Create an account, log meals and workouts, set goals, track streaks, share progress, and explore charts in one polished full-stack app.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/signup" className="btn-primary">Create account</Link>
            <Link href="/login" className="btn-outline">Sign in</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"></div>
        </section>
      </div>
    </main>
  );
}
