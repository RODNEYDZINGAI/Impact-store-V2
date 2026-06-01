import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import dbConnect from "@/lib/mongodb";
import Article from "@/models/Article";
import { buildArticleJsonLd, estimateReadingTime, getArticleMeta, renderArticleBlocks, type ArticleLike } from "@/lib/articles";
import { getBaseUrl, SITE_NAME } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getPublishedArticle(slug: string): Promise<ArticleLike | null> {
  await dbConnect();
  const article = await Article.findOne({ slug, status: "published", publishedAt: { $lte: new Date() } }).lean();
  return article ? JSON.parse(JSON.stringify(article)) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticle(slug);
  if (!article) return { title: "Article Not Found | Impact Store" };

  const meta = getArticleMeta(article);
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: meta.canonical },
    keywords: article.targetKeywords?.length ? article.targetKeywords : article.tags,
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: meta.canonical,
      siteName: SITE_NAME,
      images: [{ url: meta.image, width: 1200, height: 630, alt: article.featuredImageAlt || article.title }],
      type: "article",
      publishedTime: article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined,
      modifiedTime: article.updatedAt ? new Date(article.updatedAt).toISOString() : undefined,
      authors: [article.authorName || SITE_NAME],
      tags: article.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [meta.image],
    },
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await getPublishedArticle(slug);
  if (!article) notFound();

  const baseUrl = getBaseUrl();
  const readingTime = estimateReadingTime(article.body || article.excerpt || "");
  const articleJsonLd = buildArticleJsonLd(article);
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Articles", item: `${baseUrl}/articles` },
      { "@type": "ListItem", position: 3, name: article.title, item: `${baseUrl}/articles/${article.slug}` },
    ],
  };

  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      <article>
        <header className="bg-[#0f172a] text-white">
          <div className="mx-auto max-w-4xl px-6 py-16">
            <Link href="/articles" className="text-sm font-semibold text-[#fbbf24] transition hover:text-[#f59e0b]">
              ← All articles
            </Link>
            <div className="mt-6 flex flex-wrap gap-2">
              {(article.tags || []).slice(0, 4).map((tag) => (
                <span key={tag} className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">{article.title}</h1>
            <p className="mt-5 text-lg leading-8 text-white/75">{article.excerpt}</p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/60">
              <span>{article.authorName || "Impact Store Team"}</span>
              <span>{readingTime} min read</span>
              {article.publishedAt ? <time dateTime={new Date(article.publishedAt).toISOString()}>{new Date(article.publishedAt).toLocaleDateString()}</time> : null}
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-[1180px] gap-8 px-6 py-12 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
            <div className="prose prose-slate max-w-none">
              {renderArticleBlocks(article.body).map((block, index) => {
                if (block.type === "h2") return <h2 key={index} className="mt-8 text-2xl font-semibold text-[#0f172a] first:mt-0">{block.text}</h2>;
                if (block.type === "h3") return <h3 key={index} className="mt-6 text-xl font-semibold text-[#0f172a]">{block.text}</h3>;
                if (block.type === "ul") {
                  return (
                    <ul key={index} className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
                      {block.items.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  );
                }
                return <p key={index} className="mt-4 text-base leading-8 text-slate-700">{block.text}</p>;
              })}
            </div>
          </div>

          <aside className="space-y-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#0f172a]">Need pricing or stock?</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Share your quantity, delivery location, and preferred brands. Impact Store can quote laptops,
                networking, security, mobile devices, TAP, and MDM rollouts.
              </p>
              <Link href={`/quote?source=article&article=${encodeURIComponent(article.slug)}`} className="mt-4 inline-flex rounded-full bg-[#fbbf24] px-5 py-2.5 text-sm font-semibold text-[#1f2937] transition hover:bg-[#f59e0b]">
                Request a quote
              </Link>
            </section>

            {article.internalLinks?.length ? (
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-[#0f172a]">Related Impact Store pages</h2>
                <div className="mt-4 space-y-2">
                  {article.internalLinks.map((link) => (
                    <Link key={`${link.href}-${link.label}`} href={link.href} className="block rounded-2xl border border-slate-100 px-4 py-3 text-sm font-semibold text-[#1f4f8f] transition hover:border-[#1f4f8f]/30 hover:bg-[#1f4f8f]/5">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            {article.targetKeywords?.length ? (
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-[#0f172a]">Topics covered</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {article.targetKeywords.map((keyword) => (
                    <span key={keyword} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {keyword}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}
          </aside>
        </div>
      </article>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    </main>
  );
}
