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
  new: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  contacted: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  quoted: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  won: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  lost: "bg-red-500/20 text-red-400 border-red-500/30",
  archived: "bg-gray-500/20 text-gray-400 border-gray-500/30",
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-steel border-t-transparent" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Quote not found.</p>
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
          className="text-sm text-gray-500 transition hover:text-gray-300"
        >
          ← Back to Quotes
        </button>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
            STATUS_COLORS[quote.status] ?? "bg-gray-500/20 text-gray-400 border-gray-500/30"
          }`}
        >
          {quote.status}
        </span>
      </div>

      <h1 className="text-2xl font-bold text-white">Quote from {quote.name}</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Contact Details */}
        <div className="rounded-2xl border border-white/[0.06] bg-navy-light p-6">
          <h2 className="mb-4 font-semibold text-white">Contact Details</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Name</dt>
              <dd className="text-right font-medium text-gray-200">{quote.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Email</dt>
              <dd className="text-right">
                <a href={`mailto:${quote.email}`} className="text-steel hover:underline">
                  {quote.email}
                </a>
              </dd>
            </div>
            {quote.phone && (
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Phone</dt>
                <dd className="text-right text-gray-200">{quote.phone}</dd>
              </div>
            )}
            {quote.company && (
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Company</dt>
                <dd className="text-right text-gray-200">{quote.company}</dd>
              </div>
            )}
            {quote.budget && (
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Budget</dt>
                <dd className="text-right text-gray-200">{quote.budget}</dd>
              </div>
            )}
            {quote.timeline && (
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Timeline</dt>
                <dd className="text-right text-gray-200">{quote.timeline}</dd>
              </div>
            )}
            {quote.source && (
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Source</dt>
                <dd className="text-right text-gray-400">{quote.source}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Submitted</dt>
              <dd className="text-right text-gray-400">
                {new Date(quote.createdAt).toLocaleString("en-ZA")}
              </dd>
            </div>
          </dl>
        </div>

        {/* Products */}
        <div className="rounded-2xl border border-white/[0.06] bg-navy-light p-6">
          <h2 className="mb-4 font-semibold text-white">Products of Interest</h2>
          {quote.products.length > 0 ? (
            <div className="space-y-3">
              {quote.products.map((p, i) => (
                <div key={i} className="rounded-xl border border-white/[0.06] px-4 py-3 text-sm">
                  <p className="font-medium text-gray-200">{p.name}</p>
                  {(p.quantityMin ?? p.quantityMax) ? (
                    <p className="mt-1 text-xs text-gray-500">
                      Qty: {p.quantityMin ?? 1}{p.quantityMax ? ` – ${p.quantityMax}` : "+"}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">General enquiry — no specific products listed.</p>
          )}
        </div>
      </div>

      {/* Message */}
      {quote.message && (
        <div className="rounded-2xl border border-white/[0.06] bg-navy-light p-6">
          <h2 className="mb-3 font-semibold text-white">Message from Requester</h2>
          <p className="whitespace-pre-wrap text-sm text-gray-300">{quote.message}</p>
        </div>
      )}

      {/* Admin Actions */}
      <div className="rounded-2xl border border-white/[0.06] bg-navy-light p-6">
        <h2 className="mb-4 font-semibold text-white">Admin Actions</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-400">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-navy px-3 py-2 text-sm text-gray-200 focus:border-steel focus:outline-none focus:ring-1 focus:ring-steel"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s} className="bg-navy capitalize">
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-400">Quoted Price (R)</label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={quotedPrice}
              onChange={(e) => setQuotedPrice(e.target.value)}
              placeholder="e.g. 12500"
              className="w-full rounded-lg border border-white/10 bg-navy px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 focus:border-steel focus:outline-none focus:ring-1 focus:ring-steel"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-medium text-gray-400">
            Quoted Notes <span className="text-gray-600">(sent to customer)</span>
          </label>
          <textarea
            rows={3}
            value={quotedNotes}
            onChange={(e) => setQuotedNotes(e.target.value)}
            maxLength={4000}
            placeholder="Details included in the customer quote..."
            className="w-full resize-none rounded-lg border border-white/10 bg-navy px-3 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:border-steel focus:outline-none focus:ring-1 focus:ring-steel"
          />
          <p className="mt-1 text-right text-xs text-gray-600">{quotedNotes.length}/4000</p>
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-medium text-gray-400">
            Internal Notes <span className="text-gray-600">(admin only)</span>
          </label>
          <textarea
            rows={4}
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            maxLength={4000}
            placeholder="Add internal notes about this quote request..."
            className="w-full resize-none rounded-lg border border-white/10 bg-navy px-3 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:border-steel focus:outline-none focus:ring-1 focus:ring-steel"
          />
          <p className="mt-1 text-right text-xs text-gray-600">{adminNotes.length}/4000</p>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-gradient-to-r from-royal to-steel px-5 py-2 text-sm font-medium text-white transition hover:from-steel hover:to-royal disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {saveMsg && (
            <span className={`text-sm ${saveMsg.includes("success") ? "text-emerald" : "text-red-400"}`}>
              {saveMsg}
            </span>
          )}
        </div>
      </div>

      {/* Quick Reply */}
      <div className="rounded-2xl border border-white/[0.06] bg-navy-light p-6">
        <h2 className="mb-3 font-semibold text-white">Reply to Requester</h2>
        <p className="mb-4 text-sm text-gray-500">Open your email client to respond directly.</p>
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
