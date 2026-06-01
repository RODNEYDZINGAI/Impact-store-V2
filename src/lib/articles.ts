import { absoluteUrl, DEFAULT_OG_IMAGE, getBaseUrl, SITE_NAME, truncateMetaDescription } from "@/lib/seo";

export interface ArticleLike {
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  authorName?: string;
  status?: "draft" | "published";
  featuredImage?: string;
  featuredImageAlt?: string;
  tags?: string[];
  targetKeywords?: string[];
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  internalLinks?: { label: string; href: string }[];
  relatedProductCategories?: string[];
  publishedAt?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export function slugifyArticleTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function normalizeListInput(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  if (typeof value !== "string") return [];
  return value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
}

export function estimateReadingTime(body: string) {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export function getArticleMeta(article: ArticleLike) {
  const title = article.seoTitle || article.title;
  const description = truncateMetaDescription(article.seoDescription || article.excerpt || article.body, 160);
  const image = absoluteUrl(article.featuredImage || DEFAULT_OG_IMAGE);
  const canonical = article.canonicalUrl || `/articles/${article.slug}`;
  return { title, description, image, canonical };
}

export function buildArticleJsonLd(article: ArticleLike) {
  const baseUrl = getBaseUrl();
  const meta = getArticleMeta(article);
  const url = meta.canonical.startsWith("http") ? meta.canonical : `${baseUrl}${meta.canonical}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: meta.description,
    image: [meta.image],
    author: {
      "@type": "Organization",
      name: article.authorName || SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(DEFAULT_OG_IMAGE),
      },
    },
    mainEntityOfPage: url,
    datePublished: article.publishedAt || article.createdAt,
    dateModified: article.updatedAt || article.publishedAt || article.createdAt,
    keywords: article.targetKeywords?.length ? article.targetKeywords.join(", ") : article.tags?.join(", "),
  };
}

export function renderArticleBlocks(body: string) {
  return body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      if (block.startsWith("### ")) return { type: "h3" as const, text: block.slice(4).trim() };
      if (block.startsWith("## ")) return { type: "h2" as const, text: block.slice(3).trim() };
      if (block.startsWith("# ")) return { type: "h2" as const, text: block.slice(2).trim() };
      if (/^[-*] /.test(block)) {
        return {
          type: "ul" as const,
          items: block.split("\n").map((line) => line.replace(/^[-*]\s+/, "").trim()).filter(Boolean),
        };
      }
      return { type: "p" as const, text: block };
    });
}
