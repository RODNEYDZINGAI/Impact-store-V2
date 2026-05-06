"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (!email) {
      router.push("/register");
    }
  }, [email, router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/users/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Verification failed");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError("");

    try {
      const res = await fetch("/api/users/verify", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setCountdown(30);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to resend code");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setResendLoading(false);
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
            Email Verified!
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Your email has been verified. You will be redirected to the login
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
        <h1 className="text-2xl font-bold text-gray-900">Verify Your Email</h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter the 6-digit code sent to
        </p>
        <p className="mt-1 font-medium text-gray-900">{email}</p>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Verification Code
          </label>
          <input
            type="text"
            required
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className={inputClass}
            placeholder="123456"
            inputMode="numeric"
          />
        </div>
        <Button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full bg-gradient-to-r from-royal to-steel text-white hover:from-steel hover:to-royal shadow-lg shadow-royal/25"
        >
          {loading ? "Verifying..." : "Verify Email"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">Didn&apos;t receive the code?</p>
        <button
          onClick={handleResend}
          disabled={resendLoading || countdown > 0}
          className="mt-1 text-sm font-semibold text-steel transition hover:text-violet-bright disabled:text-gray-400"
        >
          {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        Wrong email?{" "}
        <Link
          href="/register"
          className="font-semibold text-steel transition hover:text-violet-bright"
        >
          Go Back
        </Link>
      </p>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 py-12">
      <div className="splash splash-violet -right-24 -top-10 h-80 w-80" />
      <div className="splash splash-blue -left-20 bottom-10 h-64 w-64" />
      <div className="splash splash-pink left-1/4 top-1/4 h-48 w-48" />
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
          <VerifyForm />
        </Suspense>
      </div>
    </div>
  );
}
