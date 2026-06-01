"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface ArticleRow {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: "draft" | "published";
  authorName: string;
  tags?: string[];
  publishedAt?: string;
  updatedAt?: string;
}

type FilterTab = "all" | "published" | "draft";

export default function AdminArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const fetchArticles = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const response = await fetch("/api/articles?includeDrafts=true");
      const data = await response.json();
      setArticles(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const filtered = articles.filter((article) => {
    if (activeTab === "published") return article.status === "published";
    if (activeTab === "draft") return article.status !== "published";
    return true;
  });

  const deleteArticle = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    await fetch(`/api/articles/${id}`, { method: "DELETE" });
    await fetchArticles(true);
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#1f4f8f]" /></div>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-steel">SEO content</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-800">Articles</h1>
        </div>
        <Button asChild className="bg-[#1f4f8f] text-white hover:bg-[#1f4f8f]/90">
          <Link href="/admin/articles/new">New Article</Link>
        </Button>
      </div>

      <div className="mt-6 flex gap-2 border-b border-slate-200">
        {[
          ["all", `All (${articles.length})`],
          ["published", `Published (${articles.filter((item) => item.status === "published").length})`],
          ["draft", `Drafts (${articles.filter((item) => item.status !== "published").length})`],
        ].map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as FilterTab)}
            className={`px-4 py-2 text-sm font-medium transition ${activeTab === tab ? "border-b-2 border-steel text-steel" : "text-slate-500 hover:text-slate-700"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {filtered.length === 0 ? (
          <div className="p-8 text-sm text-slate-500">No articles yet. Add the first SEO guide to start building organic traffic.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Article</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((article) => (
                <tr key={article._id} className="cursor-pointer hover:bg-slate-50" onClick={() => router.push(`/admin/articles/${article._id}/edit`)}>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800">{article.title}</div>
                    <div className="mt-1 text-xs text-slate-500">/articles/{article.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${article.status === "published" ? "bg-emerald/10 text-emerald-700" : "bg-amber/10 text-amber"}`}>
                      {article.status === "published" ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{article.authorName}</td>
                  <td className="px-4 py-3 text-slate-500">{article.updatedAt ? new Date(article.updatedAt).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={(event) => { event.stopPropagation(); void deleteArticle(article._id); }} className="text-xs font-medium text-red-600 hover:text-red-700">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
