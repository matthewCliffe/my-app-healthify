"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");

    const payload = Object.fromEntries(formData.entries());
    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Authentication failed.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="card mx-auto w-full max-w-md space-y-5 p-8" aria-label={mode === "login" ? "Login form" : "Signup form"}>
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">Healthify</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="mt-2 text-sm text-slate-600">
          {mode === "login"
            ? "Sign in to access your protected dashboard."
            : "Create a profile to track workouts, meals, streaks, and progress."}
        </p>
      </div>

      {mode === "signup" && (
        <div>
          <label htmlFor="name" className="label">Full name</label>
          <input id="name" name="name" placeholder="John Doe" required />
        </div>
      )}

      <div>
        <label htmlFor="email" className="label">Email address</label>
        <input id="email" name="email" type="email" placeholder="you@webdevclass.com" required />
      </div>

      <div>
        <label htmlFor="password" className="label">Password</label>
        <input id="password" name="password" type="password" placeholder="Must be at least 6 characters" minLength={6} required />
      </div>

      {mode === "signup" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="currentWeight" className="label">Current weight</label>
              <input id="currentWeight" name="currentWeight" type="number" min={0} defaultValue={0} required />
            </div>
            <div>
              <label htmlFor="goalCalories" className="label">Daily calorie goal</label>
              <input id="goalCalories" name="goalCalories" type="number" min={0} defaultValue={0} required />
            </div>
          </div>
          <p className="text-xs text-slate-500">Login with matthewcliffec22@gmail.com password 123456 for admin mode</p>
        </>
      )}

      {mode === "login" && (
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200">
          Admin login: <span className="font-medium">matthewcliffec22@gmail.com</span> with password <span className="font-medium">123456</span>
        </div>
      )}

      {error && <p className="alert-error">{error}</p>}

      <button disabled={loading} className="btn-primary w-full" aria-busy={loading}>
        {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
      </button>

      <div className="text-center text-sm text-slate-600">
        <Link href="/" className="font-medium text-emerald-700 hover:text-emerald-800">Back to home</Link>
      </div>
    </form>
  );
}
