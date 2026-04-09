import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md space-y-6">
        <AuthForm mode="signup" />
        <p className="text-center text-sm text-slate-600">
          Already have an account? <Link href="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
