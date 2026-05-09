"use client";

import { useEffect, useState, useCallback } from "react";

interface Order {
  _id: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: string;
  notes?: string;
  shippingAddress: { fullName: string; city: string; province: string };
  createdAt: string;
}

type StatusFilter = "all" | "pending" | "confirmed" | "shipped" | "delivered";

const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered"] as const;

const statusColors: Record<string, string> = {
  pending: "bg-amber/20 text-amber border-amber/30",
  confirmed: "bg-steel/20 text-steel border-steel/30",
  shipped: "bg-violet/20 text-violet-bright border-violet/30",
  delivered: "bg-emerald/20 text-emerald border-emerald/30",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusFilter>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notesDrafts, setNotesDrafts] = useState<Record<string, string>>({});

  const fetchOrders = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json() as Order[];
      setOrders(data);
      setNotesDrafts(
        Object.fromEntries(data.map((order) => [order._id, order.notes ?? ""]))
      );
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } finally {
      setUpdatingId(null);
    }
  };


  const handleNotesSave = async (orderId: string) => {
    setUpdatingId(orderId);
    try {
      const notes = notesDrafts[orderId] ?? "";
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((order) => (order._id === orderId ? { ...order, notes } : order))
        );
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders =
    activeTab === "all" ? orders : orders.filter((o) => o.status === activeTab);

  const countFor = (status: StatusFilter) =>
    status === "all" ? orders.length : orders.filter((o) => o.status === status).length;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-steel border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Orders</h1>

      {/* Status Filter Tabs */}
      <div className="mt-6 flex flex-wrap gap-1 border-b border-white/[0.06]">
        {(["all", ...ORDER_STATUSES] as StatusFilter[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition ${
              activeTab === tab
                ? "border-b-2 border-steel text-steel"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)} ({countFor(tab)})
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <p className="mt-8 text-gray-500">
          No orders{activeTab !== "all" ? ` with status "${activeTab}"` : ""} yet.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {filteredOrders.map((order) => (
            <div key={order._id} className="rounded-2xl border border-white/[0.06] bg-navy-light p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-200">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("en-ZA")} &middot;{" "}
                    {order.shippingAddress.fullName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.shippingAddress.city}, {order.shippingAddress.province}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="text-lg font-bold text-white">
                    R{order.total.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block rounded-full border px-3 py-0.5 text-xs font-semibold capitalize ${
                        statusColors[order.status] ?? "bg-gray-500/20 text-gray-400 border-gray-500/30"
                      }`}
                    >
                      {order.status}
                    </span>
                    <select
                      value={order.status}
                      disabled={updatingId === order._id}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="rounded-lg border border-white/[0.06] bg-navy px-2 py-1 text-xs text-gray-300 focus:border-steel focus:outline-none disabled:opacity-50"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                    {updatingId === order._id && (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-steel border-t-transparent" />
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1 text-sm">
                {order.items.map((item, i) => (
                  <p key={i} className="text-gray-400">
                    {item.name} x{item.quantity} — R{(item.price * item.quantity).toLocaleString()}
                  </p>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-white/[0.06] bg-navy p-3">
                <label className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  Internal notes
                </label>
                <textarea
                  value={notesDrafts[order._id] ?? ""}
                  onChange={(e) =>
                    setNotesDrafts((prev) => ({ ...prev, [order._id]: e.target.value }))
                  }
                  rows={2}
                  placeholder="Add courier, fulfillment, or customer follow-up notes"
                  className="mt-2 w-full rounded-lg border border-white/[0.06] bg-navy-light px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-steel focus:outline-none"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    disabled={updatingId === order._id}
                    onClick={() => handleNotesSave(order._id)}
                    className="rounded-lg border border-steel/30 px-3 py-1.5 text-xs font-medium text-steel hover:bg-steel/10 disabled:opacity-50"
                  >
                    Save notes
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
