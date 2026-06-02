import { MetadataRoute } from "next";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Article from "@/models/Article";
import { getCategoryTaxonomy } from "@/models/CategoryTaxonomy";
import { categoryProductsUrlXml, getBaseUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const now = new Date();

  const staticPages = [
    { path: "/", changeFrequency: "daily" as const, priority: 1.0 },
    { path: "/products", changeFrequency: "daily" as const, priority: 0.9 },
    { path: "/articles", changeFrequency: "weekly" as const, priority: 0.75 },
    { path: "/about", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/contact", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/quote", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/recycling", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/tap", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/mdm", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/privacy-policy", changeFrequency: "monthly" as const, priority: 0.5 },
    { path: "/terms-of-service", changeFrequency: "monthly" as const, priority: 0.5 },
    { path: "/shipping-policy", changeFrequency: "monthly" as const, priority: 0.5 },
    { path: "/returns-policy", changeFrequency: "monthly" as const, priority: 0.5 },
    { path: "/laybuy-policy", changeFrequency: "monthly" as const, priority: 0.5 },
    { path: "/warranty-policy", changeFrequency: "monthly" as const, priority: 0.5 },
  ].map((page) => ({
    url: `${baseUrl}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  let products: { slug: string; updatedAt?: Date }[] = [];
  let articles: { slug: string; updatedAt?: Date; publishedAt?: Date }[] = [];
  let categories: Awaited<ReturnType<typeof getCategoryTaxonomy>> = [];

  try {
    await dbConnect();
    const [productResults, articleResults, taxonomyResults] = await Promise.all([
      Product.find({ published: true }).select("slug updatedAt").lean(),
      Article.find({ status: "published", publishedAt: { $lte: now } }).select("slug updatedAt publishedAt").lean(),
      getCategoryTaxonomy(),
    ]);
    products = productResults;
    articles = articleResults;
    categories = taxonomyResults;
  } catch {
    products = [];
    articles = [];
    categories = [];
  }

  const categoryPages = categories.flatMap((category) => [
    {
      url: `${baseUrl}${categoryProductsUrlXml(category.slug)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    },
    ...category.subcategories.map((subcategory) => ({
      url: `${baseUrl}${categoryProductsUrlXml(category.slug, subcategory.slug)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ]);

  const productPages = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const articlePages = articles.map((article) => ({
    url: `${baseUrl}/articles/${article.slug}`,
    lastModified: article.updatedAt ? new Date(article.updatedAt) : article.publishedAt ? new Date(article.publishedAt) : now,
    changeFrequency: "monthly" as const,
    priority: 0.72,
  }));

  return [...staticPages, ...categoryPages, ...productPages, ...articlePages];
}
