import ArticleForm from "@/components/admin/ArticleForm";

export default function NewArticlePage() {
  return (
    <div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-steel">SEO content</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-800">New Article</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Draft keyword-led buying guides and connect each article to quote/product-intent pages.
        </p>
      </div>
      <ArticleForm />
    </div>
  );
}
