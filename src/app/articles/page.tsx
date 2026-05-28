import Link from "next/link";
import { Metadata } from "next";
import dbConnect from "@/lib/mongodb";
import Article from "@/models/Article";
import { estimateReadingTime, getArticleMeta, type ArticleLike } from "@/lib/articles";
import { DEFAULT_OG_IMAGE, getBaseUrl, SITE_NAME } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Business Technology Buying Guides & ICT Procurement Articles",
  description:
    "Read Impact Store buying guides for business laptops, ICT hardware, networking equipment, CCTV, access control, tablets, MDM, and technology procurement in South Africa.",
  alternates: { canonical: "/articles" },
  openGraph: {
    title: "Business Technology Buying Guides | Impact Store",
    description:
      "Keyword-led ICT procurement articles for South African businesses, schools, and growing teams.",
    url: "/articles",
    siteName: SITE_NAME,
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "Impact Store buying guides" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Business Technology Buying Guides | Impact Store",
    description: "ICT procurement articles for South African businesses, schools, and growing teams.",
    images: [DEFAULT_OG_IMAGE],
  },
};

async function getPublishedArticles(): Promise<ArticleLike[]> {
  await dbConnect();
  const articles = await Article.find({ status: "published", publishedAt: { $lte: new Date() } })
    .sort({ publishedAt: -1, createdAt: -1 })
    .select("title slug excerpt body authorName featuredImage featuredImageAlt tags targetKeywords publishedAt updatedAt")
    .lean();

  return JSON.parse(JSON.stringify(articles));
}

export default async function ArticlesPage() {
  const articles = await getPublishedArticles();
  const baseUrl = getBaseUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Impact Store Business Technology Articles",
    description: metadata.description,
    url: `${baseUrl}/articles`,
    itemListElement: articles.map((article, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${baseUrl}/articles/${article.slug}`,
      name: article.title,
    })),
  };

  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      <section className="bg-[#0f172a] text-white">
        <div className="mx-auto max-w-[1440px] px-6 py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#fbbf24]">Impact Store articles</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight md:text-5xl">
            Business technology buying guides for South African teams
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-white/75 md:text-lg">
            Practical procurement advice for laptops, ICT hardware suppliers, networking equipment, CCTV,
            access control, tablets, mobile device management, and secure technology rollouts.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold">
            <Link href="/products" className="rounded-full bg-[#fbbf24] px-5 py-2.5 text-[#1f2937] transition hover:bg-[#f59e0b]">
              Browse products
            </Link>
            <Link href="/quote?source=articles-hero" className="rounded-full border border-white/25 px-5 py-2.5 text-white transition hover:bg-white/10">
              Request a bulk quote
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#f7941d]">Latest guides</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#0f172a]">Procurement articles and checklists</h2>
          </div>
          <p className="text-sm text-slate-500">
            {articles.length} published article{articles.length === 1 ? "" : "s"}
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">
            Articles are being prepared. Check back soon for Impact Store procurement guides.
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {articles.map((article) => {
              const meta = getArticleMeta(article);
              const readingTime = estimateReadingTime(article.body || article.excerpt || "");
              return (
                <article key={article.slug} className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex flex-wrap gap-2">
                      {(article.tags || []).slice(0, 3).map((tag) => (
                        <span key={tag} className="rounded-full bg-[#1f4f8f]/10 px-3 py-1 text-xs font-semibold text-[#1f4f8f]">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="mt-4 text-xl font-semibold leading-snug text-[#0f172a]">
                      <Link href={`/articles/${article.slug}`} className="hover:text-[#1f4f8f]">
                        {article.title}
                      </Link>
                    </h3>
                    <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{meta.description}</p>
                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
                      <span>{article.authorName || "Impact Store Team"}</span>
                      <span>{readingTime} min read</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  );
}
