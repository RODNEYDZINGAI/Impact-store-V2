"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface ProductRow {
  productId: string;
  productName: string;
  quantityMin: string;
  quantityMax: string;
}

function QuoteForm() {
  const searchParams = useSearchParams();

  const prefillId = searchParams.get("product") ?? "";
  const prefillName = searchParams.get("productName") ?? "";

  const [products, setProducts] = useState<ProductRow[]>([
    { productId: prefillId, productName: prefillName, quantityMin: "", quantityMax: "" },
  ]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (prefillId || prefillName) {
      setProducts([{ productId: prefillId, productName: prefillName, quantityMin: "", quantityMax: "" }]);
    }
  }, [prefillId, prefillName]);

  const updateProduct = (index: number, field: keyof ProductRow, value: string) => {
    setProducts((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const addProduct = () => {
    setProducts((prev) => [...prev, { productId: "", productName: "", quantityMin: "", quantityMax: "" }]);
  };

  const removeProduct = (index: number) => {
    if (products.length === 1) return;
    setProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const filledProducts = products.filter((p) => p.productId.trim() || p.productName.trim());
    const missingId = filledProducts.find((p) => p.productName.trim() && !p.productId.trim());
    if (missingId) {
      setError(`Missing product ID for "${missingId.productName}". Use the Request Quote button on a product page to pre-fill, or leave the product fields blank for a general enquiry.`);
      return;
    }

    const validProducts = filledProducts.filter((p) => p.productId.trim());

    setSubmitting(true);

    const payload = {
      name,
      email,
      phone: phone || undefined,
      company: company || undefined,
      budget: budget || undefined,
      timeline: timeline || undefined,
      message,
      products: validProducts.map((p) => ({
        product: p.productId.trim(),
        quantityMin: p.quantityMin ? Number(p.quantityMin) : undefined,
        quantityMax: p.quantityMax ? Number(p.quantityMax) : undefined,
      })),
    };

    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <span className="text-2xl text-emerald-600">&#10003;</span>
          </div>
          <h2 className="text-2xl font-semibold text-[#1f2937]">Quote Request Sent!</h2>
          <p className="mt-3 text-slate-500">
            Thank you! Our team will review your request and get back to you within 1–2 business days.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/products"
              className="rounded-full bg-[#1f4f8f] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a3f73]"
            >
              Continue Shopping
            </Link>
            <Link
              href="/"
              className="rounded-full border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[#1f2937]">Request a Quote</h1>
        <p className="mt-3 text-slate-500">
          Need bulk pricing or a custom solution? Fill in the form and our team will respond within 1–2 business days.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Information */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-[#1f2937]">Contact Information</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-[#1f2937] placeholder:text-slate-400 focus:border-[#1f4f8f] focus:outline-none focus:ring-1 focus:ring-[#1f4f8f]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@company.com"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-[#1f2937] placeholder:text-slate-400 focus:border-[#1f4f8f] focus:outline-none focus:ring-1 focus:ring-[#1f4f8f]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+27 10 000 0000"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-[#1f2937] placeholder:text-slate-400 focus:border-[#1f4f8f] focus:outline-none focus:ring-1 focus:ring-[#1f4f8f]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Company / Organisation</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Corp"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-[#1f2937] placeholder:text-slate-400 focus:border-[#1f4f8f] focus:outline-none focus:ring-1 focus:ring-[#1f4f8f]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Budget Range</label>
              <input
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. R10 000 – R50 000"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-[#1f2937] placeholder:text-slate-400 focus:border-[#1f4f8f] focus:outline-none focus:ring-1 focus:ring-[#1f4f8f]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Timeline</label>
              <input
                type="text"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                placeholder="e.g. Within 2 weeks"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-[#1f2937] placeholder:text-slate-400 focus:border-[#1f4f8f] focus:outline-none focus:ring-1 focus:ring-[#1f4f8f]"
              />
            </div>
          </div>
        </div>

        {/* Products of Interest */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-[#1f2937]">Products of Interest</h2>
            <button
              type="button"
              onClick={addProduct}
              className="text-sm font-medium text-[#1f4f8f] transition hover:text-[#1a3f73]"
            >
              + Add product
            </button>
          </div>
          <p className="mb-4 text-xs text-slate-400">
            Optional — use the &ldquo;Request Quote&rdquo; button on any product page to pre-fill automatically, or leave blank for a general enquiry.
          </p>
          <div className="space-y-4">
            {products.map((row, i) => (
              <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Product {i + 1}</span>
                  {products.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProduct(i)}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-slate-600">Product Name</label>
                    <input
                      type="text"
                      value={row.productName}
                      readOnly={!!row.productId}
                      onChange={(e) => updateProduct(i, "productName", e.target.value)}
                      placeholder="e.g. Samsung Galaxy S24"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-[#1f2937] placeholder:text-slate-400 focus:border-[#1f4f8f] focus:outline-none focus:ring-1 focus:ring-[#1f4f8f] read-only:bg-slate-100 read-only:text-slate-500"
                    />
                    {row.productId && (
                      <p className="mt-1 text-xs text-slate-400">Pre-filled from product page</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">Min Qty</label>
                      <input
                        type="number"
                        min={1}
                        value={row.quantityMin}
                        onChange={(e) => updateProduct(i, "quantityMin", e.target.value)}
                        placeholder="1"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-[#1f2937] placeholder:text-slate-400 focus:border-[#1f4f8f] focus:outline-none focus:ring-1 focus:ring-[#1f4f8f]"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">Max Qty</label>
                      <input
                        type="number"
                        min={1}
                        value={row.quantityMax}
                        onChange={(e) => updateProduct(i, "quantityMax", e.target.value)}
                        placeholder="10"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-[#1f2937] placeholder:text-slate-400 focus:border-[#1f4f8f] focus:outline-none focus:ring-1 focus:ring-[#1f4f8f]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={2000}
            placeholder="Tell us about your requirements, timeline, budget, or any other details..."
            className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-[#1f2937] placeholder:text-slate-400 focus:border-[#1f4f8f] focus:outline-none focus:ring-1 focus:ring-[#1f4f8f]"
          />
          <p className="mt-1 text-right text-xs text-slate-400">{message.length}/2000</p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-[#1f4f8f] py-3 text-sm font-semibold text-white transition hover:bg-[#1a3f73] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit Quote Request"}
        </button>
      </form>
    </div>
  );
}

export default function QuotePage() {
  return (
    <div className="min-h-screen bg-[#f5f7fb] pb-16">
      <Suspense
        fallback={
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1f4f8f] border-t-transparent" />
          </div>
        }
      >
        <QuoteForm />
      </Suspense>
    </div>
  );
}
