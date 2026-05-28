"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { slugifyArticleTitle } from "@/lib/articles";

interface ArticleFormState {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  authorName: string;
  status: "draft" | "published";
  featuredImage: string;
  featuredImageAlt: string;
  tags: string;
  targetKeywords: string;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  internalLinks: { label: string; href: string }[];
  relatedProductCategories: string;
}

interface ArticleFormProps {
  articleId?: string;
  initialArticle?: Partial<ArticleFormState> & { tags?: string[] | string; targetKeywords?: string[] | string; relatedProductCategories?: string[] | string };
}

const inputClass = "mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#1f4f8f] focus:outline-none";
const textareaClass = `${inputClass} min-h-28`;

function toTextareaList(value: string[] | string | undefined) {
  if (Array.isArray(value)) return value.join("\n");
  return value || "";
}

export default function ArticleForm({ articleId, initialArticle }: ArticleFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ArticleFormState>({
    title: initialArticle?.title || "",
    slug: initialArticle?.slug || "",
    excerpt: initialArticle?.excerpt || "",
    body: initialArticle?.body || "",
    authorName: initialArticle?.authorName || "Impact Store Team",
    status: initialArticle?.status || "draft",
    featuredImage: initialArticle?.featuredImage || "",
    featuredImageAlt: initialArticle?.featuredImageAlt || "",
    tags: toTextareaList(initialArticle?.tags),
    targetKeywords: toTextareaList(initialArticle?.targetKeywords),
    seoTitle: initialArticle?.seoTitle || "",
    seoDescription: initialArticle?.seoDescription || "",
    canonicalUrl: initialArticle?.canonicalUrl || "",
    internalLinks: initialArticle?.internalLinks?.length ? initialArticle.internalLinks : [
      { label: "Shop business laptops", href: "/products?categorySlug=it-hardware&subcategory=laptops-desktops" },
      { label: "Request a bulk quote", href: "/quote?source=article" },
    ],
    relatedProductCategories: toTextareaList(initialArticle?.relatedProductCategories),
  });

  const update = <K extends keyof ArticleFormState>(key: K, value: ArticleFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateLink = (index: number, key: "label" | "href", value: string) => {
    const links = [...form.internalLinks];
    links[index] = { ...links[index], [key]: value };
    update("internalLinks", links);
  };

  const addLink = () => update("internalLinks", [...form.internalLinks, { label: "", href: "" }]);
  const removeLink = (index: number) => update("internalLinks", form.internalLinks.filter((_, i) => i !== index));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const slug = form.slug || slugifyArticleTitle(form.title);
    const response = await fetch(articleId ? `/api/articles/${articleId}` : "/api/articles", {
      method: articleId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, slug }),
    });

    setSaving(false);
    if (response.ok) {
      router.push("/admin/articles");
      router.refresh();
      return;
    }
    alert("Failed to save article");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <div>
          <label className="block text-sm font-medium text-slate-500">Article title</label>
          <input
            required
            value={form.title}
            onChange={(event) => {
              const title = event.target.value;
              setForm((current) => ({ ...current, title, slug: current.slug ? current.slug : slugifyArticleTitle(title) }));
            }}
            className={inputClass}
            placeholder="e.g. How to Choose Business Laptops for South African Teams"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-500">Slug</label>
          <input required value={form.slug} onChange={(event) => update("slug", slugifyArticleTitle(event.target.value))} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-500">Excerpt</label>
          <textarea required value={form.excerpt} onChange={(event) => update("excerpt", event.target.value)} rows={3} className={textareaClass} placeholder="Short search-result-ready summary." />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-500">Article body</label>
          <textarea required value={form.body} onChange={(event) => update("body", event.target.value)} rows={16} className={`${textareaClass} font-mono`} placeholder={"Use plain text/markdown-style headings.\n\n## Buying checklist\n\n- Warranty\n- Stock availability"} />
          <p className="mt-2 text-xs text-slate-500">Supports simple headings (#/##/###), paragraphs, and bullet lists on the public page.</p>
        </div>
      </section>

      <aside className="space-y-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-800">Publishing</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-500">Status</label>
              <select value={form.status} onChange={(event) => update("status", event.target.value as "draft" | "published")} className={inputClass}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500">Author</label>
              <input value={form.authorName} onChange={(event) => update("authorName", event.target.value)} className={inputClass} />
            </div>
            <Button disabled={saving} className="w-full bg-[#1f4f8f] text-white hover:bg-[#1f4f8f]/90">
              {saving ? "Saving..." : articleId ? "Save article" : "Create article"}
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-800">SEO</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-500">SEO title</label>
              <input value={form.seoTitle} onChange={(event) => update("seoTitle", event.target.value)} className={inputClass} placeholder="Defaults to article title" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500">Meta description</label>
              <textarea value={form.seoDescription} onChange={(event) => update("seoDescription", event.target.value)} rows={3} className={textareaClass} placeholder="Defaults to excerpt" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500">Target keywords</label>
              <textarea value={form.targetKeywords} onChange={(event) => update("targetKeywords", event.target.value)} rows={4} className={textareaClass} placeholder="One per line or comma-separated" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500">Tags</label>
              <textarea value={form.tags} onChange={(event) => update("tags", event.target.value)} rows={3} className={textareaClass} placeholder="Buying Guides, IT Hardware" />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-800">Internal linking</h2>
          <div className="mt-4 space-y-3">
            {form.internalLinks.map((link, index) => (
              <div key={index} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <input value={link.label} onChange={(event) => updateLink(index, "label", event.target.value)} className={inputClass} placeholder="Link label" />
                <input value={link.href} onChange={(event) => updateLink(index, "href", event.target.value)} className={inputClass} placeholder="/products?categorySlug=..." />
                <button type="button" onClick={() => removeLink(index)} className="mt-2 text-xs font-medium text-red-600 hover:text-red-700">Remove link</button>
              </div>
            ))}
            <button type="button" onClick={addLink} className="text-sm font-medium text-steel hover:text-violet-bright">+ Add internal link</button>
            <div>
              <label className="block text-sm font-medium text-slate-500">Related category slugs</label>
              <textarea value={form.relatedProductCategories} onChange={(event) => update("relatedProductCategories", event.target.value)} rows={3} className={textareaClass} placeholder="it-hardware\nsecurity-access-control" />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-800">Image</h2>
          <input value={form.featuredImage} onChange={(event) => update("featuredImage", event.target.value)} className={inputClass} placeholder="/impact/article-image.jpg" />
          <input value={form.featuredImageAlt} onChange={(event) => update("featuredImageAlt", event.target.value)} className={inputClass} placeholder="Image alt text" />
        </section>
      </aside>
    </form>
  );
}
