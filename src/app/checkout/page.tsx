"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { checkoutFormFromCustomerAddress } from "@/lib/customer-address";

interface CustomerAddress {
  street?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
}

interface UserProfileResponse {
  name?: string;
  address?: CustomerAddress;
}

type PaymentMethod = "bobpay" | "payfast";

const paymentMethodLabels: Record<PaymentMethod, string> = {
  bobpay: "BobPay",
  payfast: "PayFast",
};

export default function CheckoutPage() {
  const { items, total } = useCart();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bobpay");
  const [form, setForm] = useState({
    fullName: "", address: "", city: "", province: "", postalCode: "", phone: "",
  });
  
  // Referral code state
  const [referralCode, setReferralCode] = useState("");
  const [referralLoading, setReferralLoading] = useState(false);
  const [referralValid, setReferralValid] = useState(false);
  const [referralError, setReferralError] = useState("");
  const [couponCode, setCouponCode] = useState("");

  // Shipping and discount calculation
  const SHIPPING_COST = 99;
  const discount = referralValid ? Math.round(total * 0.05) : 0;
  const finalTotal = total + SHIPPING_COST - discount;

  useEffect(() => {
    if (!session) return;

    let cancelled = false;

    fetch("/api/user")
      .then((res) => (res.ok ? res.json() : null))
      .then((user: UserProfileResponse | null) => {
        if (cancelled || !user) return;

        const savedForm = checkoutFormFromCustomerAddress(
          user.address,
          user.name || session.user?.name || ""
        );

        if (savedForm) {
          setForm(savedForm);
        } else if (user.name || session.user?.name) {
          setForm((prev) => ({
            ...prev,
            fullName: prev.fullName || user.name || session.user?.name || "",
          }));
        }
      })
      .catch(() => {
        if (cancelled) return;
        setForm((prev) => ({
          ...prev,
          fullName: prev.fullName || session.user?.name || "",
        }));
      });

    return () => {
      cancelled = true;
    };
  }, [session]);

  if (items.length === 0) {
    return (
      <div className="relative min-h-screen bg-white flex items-center justify-center text-center px-4 overflow-hidden">
        <div className="splash splash-blue h-64 w-64 -right-16 top-32" />
        <div className="splash splash-violet h-48 w-48 -left-12 bottom-32" />
        <div className="relative">
          <h1 className="text-2xl font-bold text-gray-900">Nothing to checkout</h1>
          <Button asChild className="mt-4 bg-gradient-to-r from-royal to-steel text-white"><Link href="/products">Shop Now</Link></Button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="relative min-h-screen bg-white flex items-center justify-center text-center px-4 overflow-hidden">
        <div className="splash splash-blue h-64 w-64 -right-16 top-32" />
        <div className="splash splash-violet h-48 w-48 -left-12 bottom-32" />
        <div className="relative">
          <h1 className="text-2xl font-bold text-gray-900">Sign in to checkout</h1>
          <p className="mt-2 text-gray-500">You need an account to place an order.</p>
          <Button asChild className="mt-4 bg-gradient-to-r from-royal to-steel text-white"><Link href="/login">Sign In</Link></Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const selectedPaymentLabel = paymentMethodLabels[paymentMethod];
      const res = await fetch(`/api/payments/${paymentMethod}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ product: i._id, variantId: i.variantId, name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
          shippingAddress: form,
          total: finalTotal,
          referralCode: referralValid ? referralCode : undefined,
          couponCode: couponCode.trim() || undefined,
          discount: referralValid ? discount : 0,
        }),
      });
      const data = await res.json();
      if (res.ok && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        alert(data.error || `Failed to initiate ${selectedPaymentLabel} payment.`);
      }
    } catch { alert("Something went wrong."); }
    finally { setLoading(false); }
  };

  const updateField = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const validateReferralCode = async () => {
    if (!referralCode.trim()) return;
    
    setReferralLoading(true);
    setReferralError("");
    
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralCode: referralCode.trim().toUpperCase() }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.valid) {
        setReferralValid(true);
      } else {
        setReferralError(data.error || "Invalid referral code");
        setReferralValid(false);
      }
    } catch {
      setReferralError("Failed to validate code");
      setReferralValid(false);
    } finally {
      setReferralLoading(false);
    }
  };

  const inputClass = "mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-steel focus:outline-none focus:ring-1 focus:ring-steel/30";

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      <div className="splash splash-blue h-72 w-72 -right-20 top-20" />
      <div className="splash splash-violet h-56 w-56 -left-16 bottom-40" />
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 z-10">
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900">Shipping Address</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-600">Full Name</label>
                  <input type="text" required value={form.fullName} onChange={(e) => updateField("fullName", e.target.value)} className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-600">Address</label>
                  <input type="text" required value={form.address} onChange={(e) => updateField("address", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">City</label>
                  <input type="text" required value={form.city} onChange={(e) => updateField("city", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Province</label>
                  <input type="text" required value={form.province} onChange={(e) => updateField("province", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Postal Code</label>
                  <input type="text" required value={form.postalCode} onChange={(e) => updateField("postalCode", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Phone</label>
                  <input type="tel" required value={form.phone} onChange={(e) => updateField("phone", e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>

            {/* Referral Code Section */}
            <div className="mt-6 rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900">Referral Code</h2>
              <p className="text-sm text-gray-500">Have a referral code? Enter it below for 5% off!</p>
              
              <div className="mt-4 flex gap-3">
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => {
                    setReferralCode(e.target.value.toUpperCase());
                    setReferralValid(false);
                    setReferralError("");
                  }}
                  disabled={referralValid}
                  placeholder="MEG123"
                  className={`flex-1 rounded-xl border px-4 py-2.5 text-sm uppercase focus:outline-none focus:ring-1 ${
                    referralValid
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : referralError
                      ? "border-red-300 bg-red-50 text-red-700"
                      : "border-gray-200 bg-white text-gray-900 focus:border-steel focus:ring-steel/30"
                  }`}
                />
                <button
                  type="button"
                  onClick={referralValid ? () => {
                    setReferralCode("");
                    setReferralValid(false);
                    setReferralError("");
                  } : validateReferralCode}
                  disabled={referralLoading || !referralCode.trim()}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                    referralValid
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-gradient-to-r from-royal to-steel text-white hover:from-steel hover:to-royal disabled:opacity-50"
                  }`}
                >
                  {referralLoading
                    ? "Checking..."
                    : referralValid
                    ? "Remove"
                    : "Apply"}
                </button>
              </div>

              {referralValid && (
                <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
                  ✓ Referral code applied! You saved R{discount.toLocaleString()} (5% off)
                </div>
              )}
              
              {referralError && (
                <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  ✗ {referralError}
                </div>
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900">Coupon Code</h2>
              <p className="text-sm text-gray-500">
                Coupon discounts are validated securely before payment.
              </p>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="SAVE10"
                className="mt-4 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm uppercase text-gray-900 placeholder-gray-400 focus:border-steel focus:outline-none focus:ring-1 focus:ring-steel/30"
              />
            </div>
          </div>

          <div>
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
              <div className="mt-4 space-y-3">
                {items.map((item) => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.name} x{item.quantity}</span>
                    <span className="text-gray-900">R{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <hr className="border-gray-100" />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>R{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span>R{SHIPPING_COST.toLocaleString()}</span>
                </div>
                {referralValid && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Referral Discount (5%)</span>
                    <span>-R{discount.toLocaleString()}</span>
                  </div>
                )}
                {couponCode.trim() && (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Coupon</span>
                    <span>{couponCode.trim().toUpperCase()}</span>
                  </div>
                )}
                <hr className="border-gray-100" />
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>R{finalTotal.toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900">Payment Method</h3>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  {(["bobpay", "payfast"] as PaymentMethod[]).map((method) => {
                    const selected = paymentMethod === method;
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`rounded-xl border px-4 py-3 text-left transition ${
                          selected
                            ? "border-steel bg-steel/10 text-steel"
                            : "border-gray-200 bg-white text-gray-700 hover:border-steel/60"
                        }`}
                        aria-pressed={selected}
                      >
                        <span className="block text-sm font-semibold">{paymentMethodLabels[method]}</span>
                        <span className="mt-1 block text-xs text-gray-500">Secure online payment</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="mt-6 w-full bg-gradient-to-r from-royal to-steel text-white shadow-lg shadow-royal/25 hover:from-steel hover:to-royal disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading
                  ? `Initiating ${paymentMethodLabels[paymentMethod]}...`
                  : `Pay with ${paymentMethodLabels[paymentMethod]}`}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
