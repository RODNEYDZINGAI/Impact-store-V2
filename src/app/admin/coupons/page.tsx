"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Coupon {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  value: number;
  minOrderAmount: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  active: boolean;
}

interface CouponForm {
  code: string;
  discountType: "percentage" | "fixed";
  value: string;
  minOrderAmount: string;
  maxUses: string;
  expiresAt: string;
  active: boolean;
}

const emptyForm: CouponForm = {
  code: "",
  discountType: "percentage",
  value: "",
  minOrderAmount: "0",
  maxUses: "",
  expiresAt: "",
  active: true,
};

function toForm(coupon: Coupon): CouponForm {
  return {
    code: coupon.code,
    discountType: coupon.discountType,
    value: String(coupon.value),
    minOrderAmount: String(coupon.minOrderAmount ?? 0),
    maxUses: coupon.maxUses ? String(coupon.maxUses) : "",
    expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : "",
    active: coupon.active,
  };
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState<CouponForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchCoupons = useCallback(async () => {
    const res = await fetch("/api/coupons");
    const data = await res.json();
    setCoupons(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchCoupons();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchCoupons]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const saveCoupon = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    const payload = {
      ...form,
      code: form.code.trim().toUpperCase(),
      value: Number(form.value),
      minOrderAmount: Number(form.minOrderAmount || 0),
      maxUses: form.maxUses ? Number(form.maxUses) : undefined,
      expiresAt: form.expiresAt || undefined,
    };

    const url = editingId ? `/api/coupons/${editingId}` : "/api/coupons";
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to save coupon");
      setSaving(false);
      return;
    }

    await fetchCoupons();
    resetForm();
    setSaving(false);
  };

  const deleteCoupon = async (coupon: Coupon) => {
    if (!confirm(`Delete coupon ${coupon.code}?`)) return;
    const res = await fetch(`/api/coupons/${coupon._id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to delete coupon");
      return;
    }
    await fetchCoupons();
    if (editingId === coupon._id) resetForm();
  };

  const inputClass =
    "mt-1 w-full rounded-xl border border-white/[0.06] bg-navy px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-steel focus:outline-none";
  const labelClass = "block text-sm font-medium text-gray-500";

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-steel border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-white">Coupons</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create percentage or fixed discounts with usage limits and expiry.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
        <form
          onSubmit={saveCoupon}
          className="rounded-2xl border border-white/[0.06] bg-navy-light p-6"
        >
          <h2 className="text-lg font-semibold text-white">
            {editingId ? "Edit Coupon" : "New Coupon"}
          </h2>

          <div className="mt-4 space-y-4">
            <div>
              <label className={labelClass}>Code</label>
              <input
                required
                value={form.code}
                onChange={(event) =>
                  setForm({ ...form, code: event.target.value.toUpperCase() })
                }
                className={inputClass}
                placeholder="SAVE10"
              />
            </div>

            <div>
              <label className={labelClass}>Discount Type</label>
              <select
                value={form.discountType}
                onChange={(event) =>
                  setForm({
                    ...form,
                    discountType: event.target.value as CouponForm["discountType"],
                  })
                }
                className={inputClass}
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed amount</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>
                  Value {form.discountType === "percentage" ? "(%)" : "(R)"}
                </label>
                <input
                  required
                  min="0"
                  step="0.01"
                  type="number"
                  value={form.value}
                  onChange={(event) =>
                    setForm({ ...form, value: event.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Min Order (R)</label>
                <input
                  min="0"
                  step="0.01"
                  type="number"
                  value={form.minOrderAmount}
                  onChange={(event) =>
                    setForm({ ...form, minOrderAmount: event.target.value })
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Max Uses</label>
                <input
                  min="1"
                  type="number"
                  value={form.maxUses}
                  onChange={(event) =>
                    setForm({ ...form, maxUses: event.target.value })
                  }
                  className={inputClass}
                  placeholder="Unlimited"
                />
              </div>
              <div>
                <label className={labelClass}>Expiry</label>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={(event) =>
                    setForm({ ...form, expiresAt: event.target.value })
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <label className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-navy px-4 py-3 text-sm text-gray-300">
              Active
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) =>
                  setForm({ ...form, active: event.target.checked })
                }
                className="h-4 w-4"
              />
            </label>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-royal to-steel text-white"
            >
              {saving ? "Saving..." : editingId ? "Save Changes" : "Create Coupon"}
            </Button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-white/[0.08] px-4 py-2 text-sm text-gray-400 hover:bg-white/[0.05] hover:text-white"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/[0.06] bg-navy-light text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Min</th>
                <th className="px-4 py-3">Uses</th>
                <th className="px-4 py-3">Expiry</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {coupons.map((coupon) => (
                <tr key={coupon._id} className="hover:bg-white/[0.04]">
                  <td className="px-4 py-3 font-mono font-semibold text-white">
                    {coupon.code}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {coupon.discountType === "percentage"
                      ? `${coupon.value}%`
                      : `R${coupon.value.toLocaleString()}`}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    R{(coupon.minOrderAmount ?? 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {coupon.usedCount}
                    {coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {coupon.expiresAt
                      ? new Date(coupon.expiresAt).toLocaleDateString("en-ZA")
                      : "No expiry"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                        coupon.active
                          ? "border-emerald/30 bg-emerald/10 text-emerald"
                          : "border-gray-500/30 bg-gray-500/10 text-gray-500"
                      }`}
                    >
                      {coupon.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingId(coupon._id);
                          setForm(toForm(coupon));
                        }}
                        className="rounded-lg px-3 py-1.5 text-sm text-steel hover:bg-steel/10"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => void deleteCoupon(coupon)}
                        className="rounded-lg px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                    No coupons created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
