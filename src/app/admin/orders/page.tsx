"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface OrderNote {
  text: string;
  createdAt: string;
}

interface Order {
  _id: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: string;
  notes?: string;
  noteEntries: OrderNote[];
  shippingAddress: { fullName: string; city: string; province: string };
  createdAt: string;
}

type StatusFilter = "all" | "pending" | "confirmed" | "shipped" | "delivered";

const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered"] as const;

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-violet-50 text-violet-700 border-violet-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function formatNoteDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusFilter>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [newNoteDrafts, setNewNoteDrafts] = useState<Record<string, string>>({});
  const [refundingId, setRefundingId] = useState<string | null>(null);
  const [refundReasons, setRefundReasons] = useState<Record<string, string>>({});
  const [refundInitiated, setRefundInitiated] = useState<Record<string, string>>({});

  const fetchOrders = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = (await res.json()) as Order[];
      setOrders(data);
      setNewNoteDrafts(Object.fromEntries(data.map((o) => [o._id, ""])));
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

  const handleAddNote = async (orderId: string) => {
    const text = newNoteDrafts[orderId]?.trim();
    if (!text) return;
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteEntry: text }),
      });
      if (res.ok) {
        const updated = (await res.json()) as Order;
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, noteEntries: updated.noteEntries } : o))
        );
        setNewNoteDrafts((prev) => ({ ...prev, [orderId]: "" }));
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const handleInitiateRefund = async (orderId: string) => {
    setRefundingId(orderId);
    try {
      const reason = refundReasons[orderId]?.trim() || undefined;
      const res = await fetch("/api/admin/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, reason }),
      });
      if (res.ok) {
        const refund = (await res.json()) as { _id: string };
        setRefundInitiated((prev) => ({ ...prev, [orderId]: refund._id }));
        setRefundReasons((prev) => ({ ...prev, [orderId]: "" }));
      }
    } finally {
      setRefundingId(null);
    }
  };

  const filteredOrders =
    activeTab === "all" ? orders : orders.filter((o) => o.status === activeTab);

  const countFor = (status: StatusFilter) =>
    status === "all" ? orders.length : orders.filter((o) => o.status === status).length;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#1f4f8f]" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Orders</h1>

      {/* Status Filter Tabs */}
      <div className="mt-6 flex flex-wrap gap-1 border-b border-slate-200">
        {(["all", ...ORDER_STATUSES] as StatusFilter[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition ${
              activeTab === tab
                ? "border-b-2 border-steel text-steel"
                : "text-slate-500 hover:text-slate-600"
            }`}
          >
            {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)} ({countFor(tab)})
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <p className="mt-8 text-slate-500">
          No orders{activeTab !== "all" ? ` with status "${activeTab}"` : ""} yet.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {filteredOrders.map((order) => (
            <div key={order._id} className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-700">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-sm text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString("en-ZA")} &middot;{" "}
                    {order.shippingAddress.fullName}
                  </p>
                  <p className="text-sm text-slate-500">
                    {order.shippingAddress.city}, {order.shippingAddress.province}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="text-lg font-bold text-slate-800">
                    R{order.total.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block rounded-full border px-3 py-0.5 text-xs font-semibold capitalize ${
                        statusColors[order.status] ?? "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {order.status}
                    </span>
                    <select
                      value={order.status}
                      disabled={updatingId === order._id}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600 focus:border-[#1f4f8f] focus:outline-none disabled:opacity-50"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                    {updatingId === order._id && (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-[#1f4f8f]" />
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 space-y-1 text-sm">
                {order.items.map((item, i) => (
                  <p key={i} className="text-slate-500">
                    {item.name} x{item.quantity} — R{(item.price * item.quantity).toLocaleString()}
                  </p>
                ))}
              </div>

              {/* Notes section */}
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Internal notes
                </p>

                {/* Legacy freetext note (if no structured entries yet) */}
                {order.notes && (!order.noteEntries || order.noteEntries.length === 0) && (
                  <p className="mt-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 italic">
                    {order.notes}
                    <span className="ml-2 text-xs text-slate-400">(legacy note)</span>
                  </p>
                )}

                {/* Timestamped note entries */}
                {order.noteEntries && order.noteEntries.length > 0 && (
                  <ul className="mt-2 space-y-2">
                    {order.noteEntries.map((note, i) => (
                      <li key={i} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                        <p className="text-slate-700">{note.text}</p>
                        <p className="mt-0.5 text-xs text-slate-400">{formatNoteDate(note.createdAt)}</p>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Add new note */}
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={newNoteDrafts[order._id] ?? ""}
                    onChange={(e) =>
                      setNewNoteDrafts((prev) => ({ ...prev, [order._id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void handleAddNote(order._id);
                    }}
                    placeholder="Add a note…"
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 placeholder-slate-400 focus:border-[#1f4f8f] focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={updatingId === order._id || !newNoteDrafts[order._id]?.trim()}
                    onClick={() => void handleAddNote(order._id)}
                    className="rounded-lg border border-steel/30 px-3 py-1.5 text-xs font-medium text-steel hover:bg-steel/10 disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Refund section */}
              <div className="mt-3 rounded-xl border border-rose-100 bg-rose-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wider text-rose-500">
                  Refund / Return
                </p>

                {refundInitiated[order._id] ? (
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-sm text-emerald-700 font-medium">Refund case created</span>
                    <Link
                      href="/admin/refunds"
                      className="text-xs font-medium text-[#1f4f8f] underline hover:no-underline"
                    >
                      View in Refunds
                    </Link>
                  </div>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <input
                      type="text"
                      value={refundReasons[order._id] ?? ""}
                      onChange={(e) =>
                        setRefundReasons((prev) => ({ ...prev, [order._id]: e.target.value }))
                      }
                      placeholder="Reason (optional)"
                      className="flex-1 min-w-0 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-sm text-slate-700 placeholder-slate-400 focus:border-rose-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={refundingId === order._id}
                      onClick={() => void handleInitiateRefund(order._id)}
                      className="rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50 whitespace-nowrap"
                    >
                      {refundingId === order._id ? "Initiating…" : "Initiate Refund"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
