"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-steel focus:outline-none focus:ring-1 focus:ring-steel/30";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 py-12">
      <div className="splash splash-blue -right-24 -top-10 h-80 w-80" />
      <div className="splash splash-violet -left-20 bottom-10 h-64 w-64" />
      <div className="splash splash-teal bottom-1/4 right-1/4 h-48 w-48" />
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
            <p className="mt-1 text-sm text-gray-500">
              Enter your email to receive a reset link
            </p>
          </div>

          {sent ? (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
              <p className="text-sm text-emerald-700">
                If an account exists with this email, you will receive a password
                reset link shortly.
              </p>
              <Link
                href="/login"
                className="mt-4 inline-block text-sm font-semibold text-steel hover:text-violet-bright"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="you@example.com"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-royal to-steel text-white hover:from-steel hover:to-royal shadow-lg shadow-royal/25"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-500">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-steel transition hover:text-violet-bright"
                >
                  Sign In
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
