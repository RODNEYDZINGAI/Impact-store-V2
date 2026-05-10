"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Order {
  _id: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: string;
  shippingAddress: { fullName: string; city: string; province: string };
  createdAt: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  referralCode?: string;
  referralEnabled: boolean;
  referralStats?: {
    usageCount: number;
    revenue: number;
    discountIssued: number;
  };
  address?: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-violet-50 text-violet-700 border-violet-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default function UserDetailPage() {
  const params = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingReferral, setUpdatingReferral] = useState(false);

  useEffect(() => {
    fetch(`/api/users?id=${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setUser(data.user);
        setOrders(data.orders);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#1f4f8f]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-800">User not found</h1>
        <Link
          href="/admin/users"
          className="mt-4 inline-block text-steel hover:text-violet-bright"
        >
          Back to Users
        </Link>
      </div>
    );
  }

  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div>
      <div className="flex items-center gap-4">
        <Link
          href="/admin/users"
          className="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        >
          ← Back
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Customer Details</h1>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Customer Info Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-royal to-steel text-xl font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">{user.name}</h2>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Status</span>
              <span
                className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                  user.emailVerified
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-amber-200 bg-amber-50 text-amber-700"
                }`}
              >
                {user.emailVerified ? "Verified" : "Unverified"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Joined</span>
              <span className="text-sm text-slate-600">
                {new Date(user.createdAt).toLocaleDateString("en-ZA", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Total Orders</span>
              <span className="text-sm text-slate-800">{orders.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Total Spent</span>
              <span className="text-sm font-medium text-slate-800">
                R{totalSpent.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Address Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-medium uppercase tracking-wider text-slate-500">
            Delivery Address
          </h3>
          {user.address ? (
            <div className="mt-4 space-y-2">
              <p className="text-slate-800">{user.address.street}</p>
              <p className="text-slate-600">
                {user.address.city}, {user.address.province}
              </p>
              <p className="text-slate-600">{user.address.postalCode}</p>
              <p className="text-slate-500">{user.address.country}</p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              No address saved yet.
            </p>
          )}
        </div>

        {/* Stats Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-medium uppercase tracking-wider text-slate-500">
            Order Statistics
          </h3>
          <div className="mt-4 space-y-3">
            {["pending", "confirmed", "shipped", "delivered"].map((status) => {
              const count = orders.filter((o) => o.status === status).length;
              return (
                <div key={status} className="flex justify-between">
                  <span className="text-sm capitalize text-slate-500">
                    {status}
                  </span>
                  <span className="text-sm text-slate-800">{count}</span>
                </div>
              );
            })}
            <div className="border-t border-slate-200 pt-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Referral Uses</span>
                <span className="text-sm text-slate-800">
                  {user.referralStats?.usageCount ?? 0}
                </span>
              </div>
              <div className="mt-3 flex justify-between">
                <span className="text-sm text-slate-500">Referral Revenue</span>
                <span className="text-sm text-slate-800">
                  R{(user.referralStats?.revenue ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="mt-3 flex justify-between">
                <span className="text-sm text-slate-500">Discount Issued</span>
                <span className="text-sm text-slate-800">
                  R{(user.referralStats?.discountIssued ?? 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Code Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium uppercase tracking-wider text-slate-500">
              Referral Program
            </h3>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={!!user.referralEnabled}
                onChange={async () => {
                  setUpdatingReferral(true);
                  const newValue = !user.referralEnabled;
                  try {
                    const res = await fetch("/api/users", {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        userId: user._id,
                        referralEnabled: newValue,
                      }),
                    });
                    const data = await res.json();
                    if (res.ok) {
                      setUser({ 
                        ...user, 
                        referralEnabled: data.user.referralEnabled,
                        referralCode: data.user.referralCode 
                      });
                    } else {
                      alert(data.error || "Failed to update referral");
                    }
                  } catch (error) {
                    console.error("Failed to update referral:", error);
                    alert("Failed to update referral. Please try again.");
                  }
                  setUpdatingReferral(false);
                }}
                disabled={updatingReferral}
              />
              <div className="peer h-6 w-11 rounded-full bg-slate-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-disabled:opacity-50"></div>
            </label>
          </div>

          {!!user.referralEnabled && user.referralCode ? (
            <div className="mt-4">
              <p className="text-xs text-slate-500">Referral Code</p>
              <div className="mt-2 flex items-center gap-3">
                <div className="rounded-lg bg-gradient-to-r from-gold/20 to-gold/10 px-4 py-2">
                  <span className="font-mono text-lg font-bold text-gold">
                    {user.referralCode}
                  </span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(user.referralCode!);
                    alert("Copied to clipboard!");
                  }}
                  className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  title="Copy code"
                >
                  Copy
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Customer gets 5% off when using this code at checkout
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              Enable to generate a referral code for this customer
            </p>
          )}
        </div>
      </div>

      {/* Orders Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-slate-800">Order History</h2>

        {orders.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-500">No orders yet.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-800">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString("en-ZA", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                        statusColors[order.status] ||
                        "border-slate-200 bg-slate-100 text-slate-600"
                      }`}
                    >
                      {order.status}
                    </span>
                    <span className="text-lg font-bold text-slate-800">
                      R{order.total.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-slate-500">
                        {item.name} x{item.quantity}
                      </span>
                      <span className="text-slate-600">
                        R{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  Ship to: {order.shippingAddress.fullName},{" "}
                  {order.shippingAddress.city}, {order.shippingAddress.province}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
