"use client";

import { useEffect, useState } from "react";

interface Order {
  _id: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: string;
  shippingAddress: { fullName: string; city: string; province: string };
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber/20 text-amber border-amber/30",
  confirmed: "bg-steel/20 text-steel border-steel/30",
  shipped: "bg-violet/20 text-violet-bright border-violet/30",
  delivered: "bg-emerald/20 text-emerald border-emerald/30",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders").then((r) => r.json()).then(setOrders).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-steel border-t-transparent" /></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Orders</h1>
      {orders.length === 0 ? (
        <p className="mt-6 text-gray-500">No orders yet.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="rounded-2xl border border-white/[0.06] bg-navy-light p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-200">Order #{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("en-ZA")} &middot; {order.shippingAddress.fullName}
                  </p>
                  <p className="text-sm text-gray-600">{order.shippingAddress.city}, {order.shippingAddress.province}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">R{order.total.toLocaleString()}</p>
                  <span className={`mt-1 inline-block rounded-full border px-3 py-0.5 text-xs font-semibold capitalize ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="mt-3 space-y-1 text-sm">
                {order.items.map((item, i) => (
                  <p key={i} className="text-gray-400">{item.name} x{item.quantity} — R{(item.price * item.quantity).toLocaleString()}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
