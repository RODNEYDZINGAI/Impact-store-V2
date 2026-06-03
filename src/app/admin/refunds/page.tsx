"use client";

import { useEffect, useState, useCallback } from "react";

interface RefundNote {
  text: string;
  createdAt: string;
}

interface RefundOrderSnapshot {
  total: number;
  subtotal: number;
  discount: number;
  items: Array<{ name: string; sku?: string; price: number; quantity: number; variantTitle?: string }>;
  shippingAddress: { fullName: string; address: string; city: string; province: string; postalCode: string; phone: string };
  status: string;
  paymentStatus: string;
  paymentId?: string;
  couponCode?: string;
  orderCreatedAt: string;
}

interface RefundCase {
  _id: string;
  order: { _id: string } | null;
  status: "open" | "resolved" | "denied";
  reason?: string;
  noteEntries: RefundNote[];
  orderSnapshot: RefundOrderSnapshot;
  initiatedBy: { name?: string; email: string } | null;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  open: "bg-amber-50 text-amber-700 border-amber-200",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  denied: "bg-rose-50 text-rose-700 border-rose-200",
};

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  open: ["resolved", "denied"],
  resolved: [],
  denied: ["open"],
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState<RefundCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [newNotes, setNewNotes] = useState<Record<string, string>>({});

  const fetchRefunds = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/refunds");
      const data = (await res.json()) as RefundCase[];
      setRefunds(data);
      setNewNotes(Object.fromEntries(data.map((r) => [r._id, ""])));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRefunds();
  }, [fetchRefunds]);

  const handleStatusChange = async (refundId: string, newStatus: string) => {
    setUpdatingId(refundId);
    try {
      const res = await fetch(`/api/admin/refunds/${refundId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = (await res.json()) as RefundCase;
        setRefunds((prev) =>
          prev.map((r) => (r._id === refundId ? { ...r, status: updated.status } : r))
        );
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddNote = async (refundId: string) => {
    const text = newNotes[refundId]?.trim();
    if (!text) return;
    setUpdatingId(refundId);
    try {
      const res = await fetch(`/api/admin/refunds/${refundId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteEntry: text }),
      });
      if (res.ok) {
        const updated = (await res.json()) as RefundCase;
        setRefunds((prev) =>
          prev.map((r) => (r._id === refundId ? { ...r, noteEntries: updated.noteEntries } : r))
        );
        setNewNotes((prev) => ({ ...prev, [refundId]: "" }));
      }
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#1f4f8f]" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Refunds &amp; Returns</h1>
      <p className="mt-1 text-sm text-slate-500">
        Refund cases initiated from the Orders page. No payment gateway payouts are processed here.
      </p>

      {refunds.length === 0 ? (
        <p className="mt-8 text-slate-500">No refund cases yet.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {refunds.map((refund) => {
            const snap = refund.orderSnapshot;
            const expanded = expandedId === refund._id;
            const transitions = ALLOWED_TRANSITIONS[refund.status] ?? [];

            return (
              <div key={refund._id} className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                {/* Header row */}
                <div
                  className="flex flex-wrap items-start justify-between gap-3 p-6 cursor-pointer"
                  onClick={() => setExpandedId(expanded ? null : refund._id)}
                >
                  <div>
                    <p className="font-medium text-slate-700">
                      Case #{refund._id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-sm text-slate-500">
                      Opened {formatDate(refund.createdAt)}
                      {refund.initiatedBy && (
                        <span> &middot; by {refund.initiatedBy.name ?? refund.initiatedBy.email}</span>
                      )}
                    </p>
                    <p className="text-sm text-slate-500">
                      {snap.shippingAddress.fullName} &middot; {snap.shippingAddress.city},{" "}
                      {snap.shippingAddress.province}
                    </p>
                    {refund.reason && (
                      <p className="mt-1 text-sm text-rose-600 font-medium">Reason: {refund.reason}</p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <p className="text-lg font-bold text-slate-800">R{snap.total.toLocaleString()}</p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block rounded-full border px-3 py-0.5 text-xs font-semibold capitalize ${
                          statusColors[refund.status] ?? "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {refund.status}
                      </span>
                      {transitions.length > 0 && (
                        <select
                          value={refund.status}
                          disabled={updatingId === refund._id}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();
                            void handleStatusChange(refund._id, e.target.value);
                          }}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600 focus:border-[#1f4f8f] focus:outline-none disabled:opacity-50"
                        >
                          <option value={refund.status} disabled>
                            Change status…
                          </option>
                          {transitions.map((s) => (
                            <option key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                      )}
                      {updatingId === refund._id && (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-[#1f4f8f]" />
                      )}
                    </div>
                    <span className="text-xs text-slate-400">{expanded ? "▲ hide details" : "▼ show details"}</span>
                  </div>
                </div>

                {/* Expanded details */}
                {expanded && (
                  <div className="border-t border-slate-100 px-6 pb-6 pt-4 space-y-4">
                    {/* Order snapshot summary */}
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">
                        Order context (snapshot at time of refund)
                      </p>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm space-y-1">
                        <p className="text-slate-500">
                          Order placed:{" "}
                          <span className="text-slate-700">{formatDate(snap.orderCreatedAt)}</span>
                        </p>
                        <p className="text-slate-500">
                          Order status:{" "}
                          <span className="font-medium text-slate-700 capitalize">{snap.status}</span>
                          {" · Payment: "}
                          <span className="font-medium text-slate-700 capitalize">{snap.paymentStatus}</span>
                        </p>
                        {snap.paymentId && (
                          <p className="text-slate-500">
                            Payment ID: <span className="font-mono text-slate-700">{snap.paymentId}</span>
                          </p>
                        )}
                        {snap.couponCode && (
                          <p className="text-slate-500">
                            Coupon: <span className="text-slate-700">{snap.couponCode}</span>
                          </p>
                        )}
                        <p className="text-slate-500 mt-2">
                          <span className="font-medium text-slate-700">
                            {snap.shippingAddress.fullName}
                          </span>
                          {" · "}{snap.shippingAddress.address}, {snap.shippingAddress.city},{" "}
                          {snap.shippingAddress.province} {snap.shippingAddress.postalCode}
                          {" · "}{snap.shippingAddress.phone}
                        </p>
                        <div className="mt-3 space-y-1 border-t border-slate-200 pt-2">
                          {snap.items.map((item, i) => (
                            <p key={i} className="text-slate-500">
                              {item.name}
                              {item.variantTitle ? ` (${item.variantTitle})` : ""}
                              {item.sku ? ` [${item.sku}]` : ""} x{item.quantity} — R
                              {(item.price * item.quantity).toLocaleString()}
                            </p>
                          ))}
                          <p className="pt-1 font-semibold text-slate-700">
                            Total: R{snap.total.toLocaleString()}
                            {snap.discount > 0 && (
                              <span className="ml-2 text-sm font-normal text-slate-500">
                                (R{snap.discount.toLocaleString()} discount)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">
                        Notes (carried from order + added here)
                      </p>
                      {refund.noteEntries.length === 0 ? (
                        <p className="text-sm text-slate-400">No notes yet.</p>
                      ) : (
                        <ul className="space-y-2">
                          {refund.noteEntries.map((note, i) => (
                            <li
                              key={i}
                              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                            >
                              <p className="text-slate-700">{note.text}</p>
                              <p className="mt-0.5 text-xs text-slate-400">{formatDate(note.createdAt)}</p>
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="mt-3 flex gap-2">
                        <input
                          type="text"
                          value={newNotes[refund._id] ?? ""}
                          onChange={(e) =>
                            setNewNotes((prev) => ({ ...prev, [refund._id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") void handleAddNote(refund._id);
                          }}
                          placeholder="Add a note to this refund case…"
                          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 placeholder-slate-400 focus:border-[#1f4f8f] focus:outline-none"
                        />
                        <button
                          type="button"
                          disabled={updatingId === refund._id || !newNotes[refund._id]?.trim()}
                          onClick={() => void handleAddNote(refund._id)}
                          className="rounded-lg border border-steel/30 px-3 py-1.5 text-xs font-medium text-steel hover:bg-steel/10 disabled:opacity-50"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
