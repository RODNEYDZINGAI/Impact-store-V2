"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background splashes */}
      <div className="splash splash-gold -right-20 top-20 h-72 w-72" />
      <div className="splash splash-teal -left-16 bottom-40 h-64 w-64" />
      <div className="splash splash-violet right-1/3 top-1/3 h-48 w-48 opacity-20" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
        {/* 404 Badge */}
        <div className="mb-6 inline-flex items-center rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-gold-bright">
            Error 404
          </span>
        </div>

        {/* Main 404 Display */}
        <div className="relative">
          <h1 className="text-[8rem] font-bold leading-none tracking-tighter text-obsidian sm:text-[10rem]">
            <span className="premium-text-gradient">4</span>
            <span className="text-obsidian/20">0</span>
            <span className="premium-text-gradient">4</span>
          </h1>
        </div>

        {/* Message */}
        <h2 className="mt-4 text-2xl font-semibold text-obsidian sm:text-3xl">
          Page Not Found
        </h2>
        <p className="mt-4 max-w-md text-ink-soft">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. 
          Check the URL or browse our collection.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-teal to-obsidian text-white hover:brightness-110"
          >
            <Link href="/">Back to Home</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-gold/40 bg-transparent text-obsidian hover:bg-gold/10"
          >
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>

        {/* Help Text */}
        <p className="mt-10 text-sm text-ink-soft/70">
          Need help?{" "}
          <Link href="/contact" className="text-teal hover:text-obsidian underline underline-offset-4">
            Contact our support team
          </Link>
        </p>
      </div>
    </div>
  );
}
