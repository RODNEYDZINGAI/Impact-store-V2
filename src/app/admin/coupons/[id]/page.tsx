"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

interface Coupon {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minimumOrder?: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
}

export default function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minimumOrder, setMinimumOrder] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/coupons/${id}`);
        if (!res.ok) {
          setError("Coupon not found");
          return;
        }
        const data: Coupon = await res.json();
        setCoupon(data);
        setDiscountType(data.discountType);
        setDiscountValue(String(data.discountValue));
        setMinimumOrder(data.minimumOrder ? String(data.minimumOrder) : "");
        setMaxUses(data.maxUses ? String(data.maxUses) : "");
        setExpiresAt(data.expiresAt ? data.expiresAt.slice(0, 16) : "");
        setIsActive(data.isActive);
      } catch {
        setError("Failed to load coupon");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        discountType,
        discountValue: Number(discountValue),
        isActive,
      };
      if (minimumOrder) body.minimumOrder = Number(minimumOrder);
      else body.minimumOrder = null;
      if (maxUses) body.maxUses = Number(maxUses);
      else body.maxUses = null;
      if (expiresAt) body.expiresAt = new Date(expiresAt).toISOString();
      else body.expiresAt = null;

      const res = await fetch(`/api/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update");
        return;
      }
      router.push("/admin/coupons");
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Deactivate this coupon?")) return;
    await fetch(`/api/coupons/${id}`, { method: "DELETE" });
    router.push("/admin/coupons");
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#1f4f8f]" />
      </div>
    );
  }

  if (!coupon) {
    return (
      <div>
        <p className="text-red-700">{error || "Coupon not found"}</p>
        <button
          onClick={() => router.push("/admin/coupons")}
          className="mt-4 text-sm text-steel hover:underline"
        >
          Back to Coupons
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Edit Coupon</h1>
        <button
          onClick={() => router.push("/admin/coupons")}
          className="text-sm text-slate-500 hover:text-slate-800"
        >
          Cancel
        </button>
      </div>

      <form
        onSubmit={handleSave}
        className="max-w-lg rounded-2xl border border-slate-200 bg-white p-6"
      >
        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <label className="mb-1 block text-sm font-medium text-slate-500">
          Code
        </label>
        <input
          type="text"
          value={coupon.code}
          readOnly
          className="mb-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
        />

        <label className="mb-1 block text-sm font-medium text-slate-500">
          Discount Type
        </label>
        <select
          value={discountType}
          onChange={(e) => setDiscountType(e.target.value as "percentage" | "fixed")}
          className="mb-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-[#1f4f8f] focus:outline-none"
        >
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed Amount</option>
        </select>

        <label className="mb-1 block text-sm font-medium text-slate-500">
          Discount Value {discountType === "percentage" ? "(%)" : "(cents)"}
        </label>
        <input
          type="number"
          value={discountValue}
          onChange={(e) => setDiscountValue(e.target.value)}
          required
          min="1"
          className="mb-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-[#1f4f8f] focus:outline-none"
        />

        <label className="mb-1 block text-sm font-medium text-slate-500">
          Minimum Order (cents, optional)
        </label>
        <input
          type="number"
          value={minimumOrder}
          onChange={(e) => setMinimumOrder(e.target.value)}
          min="0"
          className="mb-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-[#1f4f8f] focus:outline-none"
        />

        <label className="mb-1 block text-sm font-medium text-slate-500">
          Max Uses (optional, leave empty for unlimited)
        </label>
        <input
          type="number"
          value={maxUses}
          onChange={(e) => setMaxUses(e.target.value)}
          min="1"
          className="mb-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-[#1f4f8f] focus:outline-none"
        />

        <label className="mb-1 block text-sm font-medium text-slate-500">
          Expires At
        </label>
        <input
          type="datetime-local"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          className="mb-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-[#1f4f8f] focus:outline-none"
        />

        <label className="mb-6 flex items-center gap-2 text-sm text-slate-500">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="rounded border-slate-200"
          />
          Active
        </label>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[#1f4f8f] px-6 py-2 text-sm font-medium text-white shadow-md shadow-[#1f4f8f]/10 transition hover:bg-[#1f4f8f]/90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {coupon.isActive && (
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-xl border border-red-200 px-4 py-2 text-sm text-red-700 transition hover:bg-red-50"
            >
              Deactivate
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
