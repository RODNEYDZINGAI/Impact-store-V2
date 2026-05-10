"use client";

import { useEffect, useState, useCallback } from "react";
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
  company?: string;
  products: QuoteProduct[];
  status: string;
  createdAt: string;
}

type StatusFilter = "all" | "new" | "contacted" | "quoted" | "won" | "lost";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-50 text-blue-700 border-blue-200",
  contacted: "bg-amber-50 text-amber-700 border-amber-200",
  quoted: "bg-violet-50 text-violet-700 border-violet-200",
  won: "bg-emerald-50 text-emerald-700 border-emerald-200",
  lost: "bg-red-50 text-red-700 border-red-200",
  archived: "bg-slate-100 text-slate-600 border-slate-200",
};

const STATUS_TABS: StatusFilter[] = ["all", "new", "contacted", "quoted", "won", "lost"];

const PAGE_SIZE = 20;

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);

  const fetchQuotes = useCallback(async (tab: StatusFilter, p: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(PAGE_SIZE) });
      if (tab !== "all") params.set("status", tab);
      const r = await fetch(`/api/quotes?${params}`);
      const data = await r.json() as { quotes?: Quote[]; total?: number };
      setQuotes(data.quotes ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotes(activeTab, page);
  }, [fetchQuotes, activeTab, page]);

  const handleTabChange = (tab: StatusFilter) => {
    setActiveTab(tab);
    setPage(1);
  };

  const pages = Math.ceil(total / PAGE_SIZE);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#1f4f8f]" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Quote Requests</h1>

      {/* Status Tabs */}
      <div className="mt-6 flex flex-wrap gap-1 border-b border-slate-200">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition ${
              activeTab === tab
                ? "border-b-2 border-steel text-steel"
                : "text-slate-500 hover:text-slate-600"
            }`}
          >
            {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            {activeTab === tab ? ` (${total})` : ""}
          </button>
        ))}
      </div>

      {quotes.length === 0 ? (
        <p className="mt-8 text-slate-500">
          No quote requests{activeTab !== "all" ? ` with status "${activeTab}"` : ""} yet.
        </p>
      ) : (
        <>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-white text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Requester</th>
                  <th className="px-4 py-3">Products</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {quotes.map((q) => (
                  <tr key={q._id} className="transition hover:bg-slate-100">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-700">{q.name}</p>
                      <p className="text-xs text-slate-500">{q.email}</p>
                      {q.company && <p className="text-xs text-slate-500">{q.company}</p>}
                    </td>
                    <td className="px-4 py-3">
                      {q.products.length > 0 ? (
                        <>
                          <p className="text-slate-600">{q.products.map((p) => p.name).join(", ")}</p>
                          <p className="text-xs text-slate-500">
                            {q.products.length} product{q.products.length !== 1 ? "s" : ""}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-slate-500 italic">General enquiry</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
                          STATUS_COLORS[q.status] ?? "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(q.createdAt).toLocaleDateString("en-ZA")}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/quotes/${q._id}`}
                        className="rounded-lg bg-steel/20 px-3 py-1.5 text-xs font-medium text-steel transition hover:bg-steel/30"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
              <span>
                Page {page} of {pages} &middot; {total} total
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs transition hover:border-steel disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={page >= pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs transition hover:border-steel disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
