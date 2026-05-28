import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Article from "@/models/Article";
import { normalizeListInput, slugifyArticleTitle } from "@/lib/articles";

function serializeArticleBody(body: Record<string, unknown>) {
  const status = body.status === "published" ? "published" : "draft";
  const title = String(body.title || "").trim();

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
    publishedAt: status === "published" ? body.publishedAt ? new Date(String(body.publishedAt)) : new Date() : undefined,
  };
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return Boolean(session && session.user.role === "admin");
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const article = await Article.findById(id).lean();
    if (!article) return NextResponse.json({ error: "Article not found" }, { status: 404 });
    return NextResponse.json(JSON.parse(JSON.stringify(article)));
  } catch (error) {
    console.error("Article GET error:", error);
    return NextResponse.json({ error: "Failed to fetch article" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const article = await Article.findByIdAndUpdate(id, { $set: serializeArticleBody(body) }, { returnDocument: "after" });
    if (!article) return NextResponse.json({ error: "Article not found" }, { status: 404 });
    return NextResponse.json(article);
  } catch (error) {
    console.error("Article PUT error:", error);
    return NextResponse.json({ error: "Failed to update article" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const article = await Article.findByIdAndDelete(id);
    if (!article) return NextResponse.json({ error: "Article not found" }, { status: 404 });
    return NextResponse.json({ message: "Article deleted" });
  } catch (error) {
    console.error("Article DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete article" }, { status: 500 });
  }
}
