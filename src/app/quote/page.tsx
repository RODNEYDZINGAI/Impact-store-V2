import type { Metadata } from "next";
import { Suspense } from "react";
import QuoteForm from "@/components/QuoteForm";

export const metadata: Metadata = {
  title: {
    absolute: "Request a Business Technology Quote | Impact Store South Africa",
  },
  description:
    "Request a quote for business laptops, IT hardware, networking equipment, CCTV, access control, phones, tablets and office technology in South Africa.",
};

export default function QuotePage() {
  return (
    <div className="min-h-screen bg-[#f5f7fb] pb-16">
      <Suspense
        fallback={
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1f4f8f] border-t-transparent" />
          </div>
        }
      >
        <QuoteForm />
      </Suspense>
    </div>
  );
}
