import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md space-y-6">
        <AuthForm mode="login" />
        <p className="text-center text-sm text-slate-600">
          Need an account? <Link href="/signup" className="font-semibold text-emerald-700 hover:text-emerald-800">Create one</Link>
        </p>
      </div>
    </main>
  );
}
