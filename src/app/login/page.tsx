"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      // Show specific error message if it's about verification
      if (result.error.includes("verify your email")) {
        setError(result.error);
      } else {
        setError("Invalid email or password");
      }
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  const inputClass = "mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-steel focus:outline-none focus:ring-1 focus:ring-steel/30";

  return (
    <div className="relative min-h-screen bg-white flex items-center justify-center px-4 py-12 overflow-hidden">
      <div className="splash splash-blue h-80 w-80 -right-24 -top-10" />
      <div className="splash splash-violet h-64 w-64 -left-20 bottom-10" />
      <div className="splash splash-teal h-48 w-48 right-1/4 bottom-1/4" />
      <div className="relative w-full max-w-md z-10">
        <div className="rounded-2xl border border-gray-100 bg-white shadow-lg p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="mt-1 text-sm text-gray-500">Sign in to your Impact Store account</p>
          </div>

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-center text-sm text-red-600">
              {error}
              {error.includes("verify your email") && (
                <div className="mt-2">
                  <Link href={`/verify?email=${encodeURIComponent(email)}`} className="font-semibold text-steel hover:text-violet-bright">
                    Click here to verify your email
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="you@example.com" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-600">Password</label>
                <Link href="/forgot-password" className="text-xs text-steel hover:text-violet-bright transition">Forgot password?</Link>
              </div>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="••••••••" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-royal to-steel text-white hover:from-steel hover:to-royal shadow-lg shadow-royal/25">
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-steel hover:text-violet-bright transition">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
