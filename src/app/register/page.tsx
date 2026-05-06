"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }
      setRegisteredEmail(data.email);
      setEmailSent(true);
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  const inputClass =
    "mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-steel focus:outline-none focus:ring-1 focus:ring-steel/30";

  if (emailSent) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 py-12">
        <div className="splash splash-violet -right-24 -top-10 h-80 w-80" />
        <div className="splash splash-blue -left-20 bottom-10 h-64 w-64" />
        <div className="splash splash-pink left-1/4 top-1/4 h-48 w-48" />
        <div className="relative z-10 w-full max-w-md">
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <svg
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h1 className="mt-4 text-2xl font-bold text-gray-900">
                Check Your Email
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                We&apos;ve sent a 6-digit verification code to
              </p>
              <p className="mt-1 font-medium text-gray-900">
                {registeredEmail}
              </p>
              <Button
                asChild
                className="mt-6 w-full bg-gradient-to-r from-royal to-steel text-white hover:from-steel hover:to-royal shadow-lg shadow-royal/25"
              >
                <Link href={`/verify?email=${encodeURIComponent(registeredEmail)}`}>
                  Enter Verification Code
                </Link>
              </Button>
              <p className="mt-4 text-sm text-gray-500">
                Didn&apos;t receive it?{" "}
                <Link
                  href={`/verify?email=${encodeURIComponent(registeredEmail)}`}
                  className="font-semibold text-steel hover:text-violet-bright transition"
                >
                  Resend Code
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 py-12">
      <div className="splash splash-violet -right-24 -top-10 h-80 w-80" />
      <div className="splash splash-blue -left-20 bottom-10 h-64 w-64" />
      <div className="splash splash-pink left-1/4 top-1/4 h-48 w-48" />
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Create Account
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Join Impact Store for business technology deals
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
                Full Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                className={inputClass}
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                className={inputClass}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                className={inputClass}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                className={inputClass}
                placeholder="••••••••"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-royal to-steel text-white hover:from-steel hover:to-royal shadow-lg shadow-royal/25"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-steel transition hover:text-violet-bright"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
