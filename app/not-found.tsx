import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6 py-16">
      <div className="card max-w-xl p-10 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-emerald-700">404</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">Page not found</h1>
        <p className="mt-3 text-slate-600">The page you requested does not exist in this Healthify app.</p>
        <Link href="/" className="btn-primary mt-6 inline-flex">Back home</Link>
      </div>
    </main>
  );
}
