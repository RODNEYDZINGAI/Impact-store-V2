import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Article from "@/models/Article";
import { normalizeListInput, slugifyArticleTitle } from "@/lib/articles";

function serializeArticleBody(body: Record<string, unknown>) {
  const status = body.status === "published" ? "published" : "draft";
  const title = String(body.title || "").trim();
  const now = new Date();

  return {
    title,
    slug: String(body.slug || slugifyArticleTitle(title)).trim().toLowerCase(),
    excerpt: String(body.excerpt || "").trim(),
    body: String(body.body || "").trim(),
    authorName: String(body.authorName || "Impact Store Team").trim(),
    status,
    featuredImage: String(body.featuredImage || "").trim() || undefined,
    featuredImageAlt: String(body.featuredImageAlt || "").trim() || undefined,
    tags: normalizeListInput(body.tags),
    targetKeywords: normalizeListInput(body.targetKeywords),
    seoTitle: String(body.seoTitle || "").trim() || undefined,
    seoDescription: String(body.seoDescription || "").trim() || undefined,
    canonicalUrl: String(body.canonicalUrl || "").trim() || undefined,
    internalLinks: Array.isArray(body.internalLinks)
      ? body.internalLinks
          .map((link) => ({
            label: String((link as { label?: unknown }).label || "").trim(),
            href: String((link as { href?: unknown }).href || "").trim(),
          }))
          .filter((link) => link.label && link.href)
      : [],
    relatedProductCategories: normalizeListInput(body.relatedProductCategories),
    publishedAt: status === "published" ? body.publishedAt ? new Date(String(body.publishedAt)) : now : undefined,
  };
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const includeDrafts = searchParams.get("includeDrafts") === "true";
    const tag = searchParams.get("tag");
    const q = searchParams.get("q");

    const filter: Record<string, unknown> = {};
    if (includeDrafts) {
      const session = await getServerSession(authOptions);
      if (!session || session.user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } else {
      filter.status = "published";
      filter.publishedAt = { $lte: new Date() };
    }
    if (tag) filter.tags = tag;
    if (q) filter.$text = { $search: q };

    const articles = await Article.find(filter).sort({ publishedAt: -1, createdAt: -1 }).lean();
    return NextResponse.json(JSON.parse(JSON.stringify(articles)));
  } catch (error) {
    console.error("Articles GET error:", error);
    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const article = await Article.create(serializeArticleBody(body));
    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error("Articles POST error:", error);
    return NextResponse.json({ error: "Failed to create article" }, { status: 500 });
  }
}
