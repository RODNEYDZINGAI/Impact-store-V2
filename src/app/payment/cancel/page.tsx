"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { XCircle } from "lucide-react";

function CancelContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");

  return (
    <div className="relative max-w-md">
      <XCircle className="mx-auto h-16 w-16 text-red-500" />
      <h1 className="mt-4 text-3xl font-bold text-gray-900">
        Payment Cancelled
      </h1>
      <p className="mt-2 text-gray-500">
        Your payment was cancelled. Your cart items are still saved — you can
        try again when you&apos;re ready.
      </p>
      {orderId && (
        <p className="mt-2 text-sm text-gray-400">
          Order ID: {orderId.slice(-6).toUpperCase()}
        </p>
      )}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button
          asChild
          className="bg-gradient-to-r from-violet to-violet-bright text-white"
        >
          <Link href="/checkout">Try Again</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <div className="relative min-h-screen bg-white flex items-center justify-center text-center px-4 overflow-hidden">
      <div className="splash splash-blue h-64 w-64 -right-16 top-32" />
      <div className="splash splash-violet h-48 w-48 -left-12 bottom-32" />
      <Suspense>
        <CancelContent />
      </Suspense>
    </div>
  );
}
