"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
      <div className="card w-full max-w-xl p-10">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-rose-700">Something went wrong</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">Healthify hit an unexpected error</h1>
        <p className="mt-3 text-slate-600">{error.message || "Please try again."}</p>
        <button onClick={reset} className="btn-primary mt-6">Try again</button>
      </div>
    </main>
  );
}
