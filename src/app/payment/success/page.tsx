"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useEffect, useRef } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const cleared = useRef(false);
  const { clearCart } = useCart();

  useEffect(() => {
    if (!cleared.current) {
      cleared.current = true;
      clearCart();
    }
  }, [clearCart]);

  return (
    <div className="relative max-w-md">
      <CheckCircle className="mx-auto h-16 w-16 text-emerald-500" />
      <h1 className="mt-4 text-3xl font-bold text-gray-900">
        Payment Successful
      </h1>
      <p className="mt-2 text-gray-500">
        Thank you for your order! Your payment has been received and your order
        is being processed.
      </p>
      {orderId && (
        <p className="mt-2 text-sm text-gray-400">
          Order ID: {orderId.slice(-6).toUpperCase()}
        </p>
      )}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button
          asChild
          className="bg-gradient-to-r from-royal to-steel text-white"
        >
          <Link href="/orders">View Orders</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="relative min-h-screen bg-white flex items-center justify-center text-center px-4 overflow-hidden">
      <div className="splash splash-blue h-64 w-64 -right-16 top-32" />
      <div className="splash splash-violet h-48 w-48 -left-12 bottom-32" />
      <Suspense>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
