"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
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

interface Address {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

interface UserData {
  name: string;
  email: string;
  referralCode?: string;
  referralEnabled: boolean;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-violet-50 text-violet-700 border-violet-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [address, setAddress] = useState<Address>({
    street: "",
    city: "",
    province: "",
    postalCode: "",
    country: "South Africa",
  });
  const [activeTab, setActiveTab] = useState<"orders" | "address" | "affiliate">("orders");
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/orders")
        .then((r) => r.json())
        .then(setOrders)
        .finally(() => setLoading(false));

      // Load user data and address
      fetch("/api/user")
        .then((r) => r.json())
        .then((user) => {
          setUserData(user);
          if (user.address) {
            setAddress(user.address);
          }
        })
        .catch(() => {
          // User might not have data yet
        });
    }
  }, [status]);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/user", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
    });
    if (res.ok) {
      alert("Address saved successfully!");
    } else {
      alert("Failed to save address");
    }
    setSaving(false);
  };

  if (status === "unauthenticated") {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 text-center">
        <div className="splash splash-blue -right-16 top-32 h-64 w-64" />
        <div className="splash splash-violet -left-12 bottom-32 h-48 w-48" />
        <div className="relative">
          <h1 className="text-2xl font-bold text-gray-900">Sign in to view your profile</h1>
          <Button asChild className="mt-4 bg-gradient-to-r from-royal to-steel text-white">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-steel border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <div className="splash splash-blue -right-20 top-20 h-72 w-72" />
      <div className="splash splash-violet -left-16 bottom-40 h-56 w-56" />
      <div className="splash splash-teal bottom-20 right-1/4 h-48 w-48" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar */}
          <div className="lg:w-64">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-royal to-steel text-xl font-bold text-white">
                  {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <h2 className="mt-4 text-lg font-semibold text-gray-900">{session?.user?.name}</h2>
                <p className="text-sm text-gray-500">{session?.user?.email}</p>
              </div>

              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition ${
                    activeTab === "orders"
                      ? "bg-royal/10 text-royal"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  My Orders
                </button>
                <button
                  onClick={() => setActiveTab("address")}
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition ${
                    activeTab === "address"
                      ? "bg-royal/10 text-royal"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Address
                </button>
                <button
                  onClick={() => setActiveTab("affiliate")}
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition ${
                    activeTab === "affiliate"
                      ? "bg-royal/10 text-royal"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Affiliate Program
                  <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                    Coming Soon
                  </span>
                </button>
              </nav>

              <hr className="my-4 border-gray-100" />

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "orders" && (
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>

                {orders.length === 0 ? (
                  <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
                    <p className="text-gray-500">You haven&apos;t placed any orders yet.</p>
                    <Button asChild className="mt-4 bg-gradient-to-r from-royal to-steel text-white">
                      <Link href="/products">Shop Now</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    {orders.map((order) => (
                      <div key={order._id} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              Order #{order._id.slice(-8).toUpperCase()}
                            </p>
                            <p className="text-xs text-gray-400">
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
                                "border-gray-200 bg-gray-50 text-gray-600"
                              }`}
                            >
                              {order.status}
                            </span>
                            <span className="text-lg font-bold text-gray-900">
                              R{order.total.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 space-y-1.5">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                {item.name} x{item.quantity}
                              </span>
                              <span className="text-gray-900">
                                R{(item.price * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                        <p className="mt-3 text-xs text-gray-400">
                          Ship to: {order.shippingAddress.fullName},{" "}
                          {order.shippingAddress.city}, {order.shippingAddress.province}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "address" && (
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Delivery Address</h1>
                <p className="mt-2 text-gray-500">Update your preferred delivery address for future orders.</p>

                <form onSubmit={handleSaveAddress} className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Street Address</label>
                      <input
                        type="text"
                        required
                        value={address.street}
                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-royal focus:outline-none"
                        placeholder="123 Main Street, Apt 4B"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">City</label>
                      <input
                        type="text"
                        required
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-royal focus:outline-none"
                        placeholder="Johannesburg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Province</label>
                      <input
                        type="text"
                        required
                        value={address.province}
                        onChange={(e) => setAddress({ ...address, province: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-royal focus:outline-none"
                        placeholder="Gauteng"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                      <input
                        type="text"
                        required
                        value={address.postalCode}
                        onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-royal focus:outline-none"
                        placeholder="2000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Country</label>
                      <input
                        type="text"
                        required
                        value={address.country}
                        onChange={(e) => setAddress({ ...address, country: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-royal focus:outline-none"
                        placeholder="South Africa"
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-gradient-to-r from-royal to-steel text-white"
                    >
                      {saving ? "Saving..." : "Save Address"}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "affiliate" && (
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">Affiliate Program</h1>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
                    Coming Soon
                  </span>
                </div>
                <p className="mt-2 text-gray-500">Affiliate rewards are being prepared and are not open for new sign-ups yet.</p>

                {userData?.referralEnabled && userData?.referralCode ? (
                  <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="rounded-xl bg-gradient-to-r from-gold/10 to-amber/10 p-4">
                      <p className="text-sm font-medium text-gray-700">Your Program Code</p>
                      <div className="mt-2 flex items-center gap-4">
                        <div className="rounded-lg bg-white px-4 py-2 shadow-sm">
                          <span className="font-mono text-2xl font-bold text-gray-900">
                            {userData.referralCode}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(userData.referralCode!);
                            alert("Copied to clipboard!");
                          }}
                          className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                        >
                          Copy Code
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl bg-emerald-50 p-4">
                        <p className="text-sm text-gray-600">Commission Rate</p>
                        <p className="text-2xl font-bold text-emerald-700">5%</p>
                        <p className="text-xs text-gray-500">on every order</p>
                      </div>
                      <div className="rounded-xl bg-blue-50 p-4">
                        <p className="text-sm text-gray-600">Your Earnings</p>
                        <p className="text-2xl font-bold text-blue-700">R0</p>
                        <p className="text-xs text-gray-500">coming soon</p>
                      </div>
                    </div>

                    <div className="mt-6 rounded-xl bg-gray-50 p-4">
                      <h3 className="font-medium text-gray-900">How it works</h3>
                      <ul className="mt-3 space-y-2 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-500">✓</span>
                          Share your unique code with friends and family
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-500">✓</span>
                          They get 5% off their order
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-500">✓</span>
                          You earn up to 5% commission on their purchase
                        </li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                      <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="mt-4 text-lg font-semibold text-gray-900">Affiliate Program Coming Soon</h2>
                    <p className="mt-2 text-gray-500">
                      We are setting up affiliate rewards for Impact Store customers. New sign-ups are paused until the program is ready.
                    </p>
                    <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-left">
                      <h3 className="font-medium text-emerald-900">Planned benefits:</h3>
                      <ul className="mt-2 space-y-1 text-sm text-emerald-700">
                        <li>• Earn up to 5% commission on every referral order</li>
                        <li>• Customers can use approved coupon codes at checkout</li>
                        <li>• Track your earnings in your profile</li>
                      </ul>
                    </div>
                    <Button
                      disabled
                      className="mt-6 bg-gray-200 text-gray-500"
                    >
                      Coming Soon
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
