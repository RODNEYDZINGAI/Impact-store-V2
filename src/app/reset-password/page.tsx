"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
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

  if (success) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <svg
              className="h-8 w-8 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Password Reset Successful
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Your password has been reset. You will be redirected to the login
            page shortly.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-block text-sm font-semibold text-steel hover:text-violet-bright"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Create New Password</h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter your new password below
        </p>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600">
            New Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="••••••••"
            minLength={6}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Confirm Password
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
            placeholder="••••••••"
            minLength={6}
          />
        </div>
        <Button
          type="submit"
          disabled={loading || !token}
          className="w-full bg-gradient-to-r from-royal to-steel text-white hover:from-steel hover:to-royal shadow-lg shadow-royal/25"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 py-12">
      <div className="splash splash-blue -right-24 -top-10 h-80 w-80" />
      <div className="splash splash-violet -left-20 bottom-10 h-64 w-64" />
      <div className="splash splash-teal bottom-1/4 right-1/4 h-48 w-48" />
      <div className="relative z-10 w-full max-w-md">
        <Suspense
          fallback={
            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
              <div className="flex justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-steel border-t-transparent" />
              </div>
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
