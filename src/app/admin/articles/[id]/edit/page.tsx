"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ArticleForm from "@/components/admin/ArticleForm";

export default function EditArticlePage() {
  const params = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/articles/${params.id}`)
      .then((response) => response.json())
      .then((data) => {
        setArticle(data);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#1f4f8f]" /></div>;
  }

  if (!article) return <div className="text-slate-700">Article not found.</div>;

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wider text-steel">SEO content</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-800">Edit Article</h1>
      <ArticleForm articleId={String(params.id)} initialArticle={article} />
    </div>
  );
}
