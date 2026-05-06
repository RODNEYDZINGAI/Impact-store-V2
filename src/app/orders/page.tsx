"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Order {
  _id: string;
  items: { name: string; quantity: number; price: number; image: string }[];
  total: number;
  status: string;
  shippingAddress: { fullName: string; city: string; province: string };
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-violet-50 text-violet-700 border-violet-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function OrdersPage() {
  const { status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/orders").then((r) => r.json()).then(setOrders).finally(() => setLoading(false));
    }
  }, [status]);

  if (status === "unauthenticated") {
    return (
      <div className="relative min-h-screen bg-white flex items-center justify-center text-center px-4 overflow-hidden">
        <div className="splash splash-blue h-64 w-64 -right-16 top-32" />
        <div className="splash splash-violet h-48 w-48 -left-12 bottom-32" />
        <div className="relative">
          <h1 className="text-2xl font-bold text-gray-900">Sign in to view orders</h1>
          <Button asChild className="mt-4 bg-gradient-to-r from-royal to-steel text-white"><Link href="/login">Sign In</Link></Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-steel border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      <div className="splash splash-blue h-72 w-72 -right-20 top-20" />
      <div className="splash splash-violet h-56 w-56 -left-16 bottom-40" />
      <div className="splash splash-teal h-48 w-48 right-1/4 bottom-20" />
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 z-10">
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>

        {orders.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-gray-500">You haven&apos;t placed any orders yet.</p>
            <Button asChild className="mt-4 bg-gradient-to-r from-royal to-steel text-white">
              <Link href="/products">Shop Now</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Order #{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusColors[order.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                      {order.status}
                    </span>
                    <span className="text-lg font-bold text-gray-900">R{order.total.toLocaleString()}</span>
                  </div>
                </div>
                <div className="mt-4 space-y-1.5">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.name} x{item.quantity}</span>
                      <span className="text-gray-900">R{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-gray-400">
                  Ship to: {order.shippingAddress.fullName}, {order.shippingAddress.city}, {order.shippingAddress.province}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
