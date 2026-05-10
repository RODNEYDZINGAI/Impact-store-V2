"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface QuoteProduct {
  name: string;
  quantityMin?: number;
  quantityMax?: number;
}

interface Quote {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  products: QuoteProduct[];
  status: "new" | "contacted" | "quoted" | "won" | "lost" | "archived";
  adminNotes?: string;
  quotedPrice?: number;
  quotedNotes?: string;
  source?: string;
  budget?: string;
  timeline?: string;
  createdAt: string;
  updatedAt: string;
}

const STATUSES = ["new", "contacted", "quoted", "won", "lost", "archived"] as const;

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-50 text-blue-700 border-blue-200",
  contacted: "bg-amber-50 text-amber-700 border-amber-200",
  quoted: "bg-violet-50 text-violet-700 border-violet-200",
  won: "bg-emerald-50 text-emerald-700 border-emerald-200",
  lost: "bg-red-50 text-red-700 border-red-200",
  archived: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function AdminQuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("");
  const [adminNotes, setAdminNotes] = useState("");
  const [quotedPrice, setQuotedPrice] = useState("");
  const [quotedNotes, setQuotedNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    fetch(`/api/quotes/${id}`)
      .then((r) => r.json())
      .then((data: Quote) => {
        setQuote(data);
        setStatus(data.status);
        setAdminNotes(data.adminNotes ?? "");
        setQuotedPrice(data.quotedPrice !== undefined ? String(data.quotedPrice) : "");
        setQuotedNotes(data.quotedNotes ?? "");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      const body: Record<string, unknown> = { status, adminNotes, quotedNotes };
      if (quotedPrice !== "") {
        const parsed = parseFloat(quotedPrice);
        if (!isNaN(parsed) && parsed >= 0) body.quotedPrice = parsed;
      } else {
        body.quotedPrice = null;
      }
      const res = await fetch(`/api/quotes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const updated = await res.json() as Quote;
        setQuote(updated);
        setSaveMsg("Saved successfully.");
      } else {
        const err = await res.json() as { error?: string };
        setSaveMsg(err.error ?? "Failed to save.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#1f4f8f]" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-500">Quote not found.</p>
        <Link href="/admin/quotes" className="mt-4 inline-block text-sm text-steel hover:underline">
          Back to Quotes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/admin/quotes")}
          className="text-sm text-slate-500 transition hover:text-slate-600"
        >
          ← Back to Quotes
        </button>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
            STATUS_COLORS[quote.status] ?? "bg-slate-100 text-slate-600 border-slate-200"
          }`}
        >
          {quote.status}
        </span>
      </div>

      <h1 className="text-2xl font-bold text-slate-800">Quote from {quote.name}</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Contact Details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 font-semibold text-slate-800">Contact Details</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Name</dt>
              <dd className="text-right font-medium text-slate-700">{quote.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Email</dt>
              <dd className="text-right">
                <a href={`mailto:${quote.email}`} className="text-steel hover:underline">
                  {quote.email}
                </a>
              </dd>
            </div>
            {quote.phone && (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Phone</dt>
                <dd className="text-right text-slate-700">{quote.phone}</dd>
              </div>
            )}
            {quote.company && (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Company</dt>
                <dd className="text-right text-slate-700">{quote.company}</dd>
              </div>
            )}
            {quote.budget && (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Budget</dt>
                <dd className="text-right text-slate-700">{quote.budget}</dd>
              </div>
            )}
            {quote.timeline && (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Timeline</dt>
                <dd className="text-right text-slate-700">{quote.timeline}</dd>
              </div>
            )}
            {quote.source && (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Source</dt>
                <dd className="text-right text-slate-500">{quote.source}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Submitted</dt>
              <dd className="text-right text-slate-500">
                {new Date(quote.createdAt).toLocaleString("en-ZA")}
              </dd>
            </div>
          </dl>
        </div>

        {/* Products */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 font-semibold text-slate-800">Products of Interest</h2>
          {quote.products.length > 0 ? (
            <div className="space-y-3">
              {quote.products.map((p, i) => (
                <div key={i} className="rounded-xl border border-slate-200 px-4 py-3 text-sm">
                  <p className="font-medium text-slate-700">{p.name}</p>
                  {(p.quantityMin ?? p.quantityMax) ? (
                    <p className="mt-1 text-xs text-slate-500">
                      Qty: {p.quantityMin ?? 1}{p.quantityMax ? ` – ${p.quantityMax}` : "+"}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">General enquiry — no specific products listed.</p>
          )}
        </div>
      </div>

      {/* Message */}
      {quote.message && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-3 font-semibold text-slate-800">Message from Requester</h2>
          <p className="whitespace-pre-wrap text-sm text-slate-600">{quote.message}</p>
        </div>
      )}

      {/* Admin Actions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-slate-800">Admin Actions</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-500">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-[#1f4f8f] focus:outline-none focus:ring-1 focus:ring-[#1f4f8f]"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s} className="bg-slate-50 capitalize">
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-500">Quoted Price (R)</label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={quotedPrice}
              onChange={(e) => setQuotedPrice(e.target.value)}
              placeholder="e.g. 12500"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-500 focus:border-[#1f4f8f] focus:outline-none focus:ring-1 focus:ring-[#1f4f8f]"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-medium text-slate-500">
            Quoted Notes <span className="text-slate-500">(sent to customer)</span>
          </label>
          <textarea
            rows={3}
            value={quotedNotes}
            onChange={(e) => setQuotedNotes(e.target.value)}
            maxLength={4000}
            placeholder="Details included in the customer quote..."
            className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-500 focus:border-[#1f4f8f] focus:outline-none focus:ring-1 focus:ring-[#1f4f8f]"
          />
          <p className="mt-1 text-right text-xs text-slate-500">{quotedNotes.length}/4000</p>
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-medium text-slate-500">
            Internal Notes <span className="text-slate-500">(admin only)</span>
          </label>
          <textarea
            rows={4}
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            maxLength={4000}
            placeholder="Add internal notes about this quote request..."
            className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-500 focus:border-[#1f4f8f] focus:outline-none focus:ring-1 focus:ring-[#1f4f8f]"
          />
          <p className="mt-1 text-right text-xs text-slate-500">{adminNotes.length}/4000</p>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-[#1f4f8f] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#1f4f8f]/90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {saveMsg && (
            <span className={`text-sm ${saveMsg.includes("success") ? "text-emerald-700" : "text-red-700"}`}>
              {saveMsg}
            </span>
          )}
        </div>
      </div>

      {/* Quick Reply */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-3 font-semibold text-slate-800">Reply to Requester</h2>
        <p className="mb-4 text-sm text-slate-500">Open your email client to respond directly.</p>
        <a
          href={`mailto:${quote.email}?subject=Re: Your Quote Request - Impact Store&body=Hi ${encodeURIComponent(quote.name)},%0A%0AThank you for your quote request.%0A%0A`}
          className="inline-block rounded-lg border border-steel px-4 py-2 text-sm font-medium text-steel transition hover:bg-steel/10"
        >
          Reply via Email
        </a>
      </div>
    </div>
  );
}
