import dotenv from "dotenv";
import mongoose, { Schema } from "mongoose";

const SITE_URL = "https://impactstore.co.za";
const SAMPLE_SIZE = 5;
const DESCRIPTION_MIN_LENGTH = 50;

// Load local environment variables without modifying app source files.
dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI. Ensure it is set in .env.local or the environment.");
  process.exit(1);
}

const ProductVariantSchema = new Schema(
  {
    variantId: { type: String, required: true },
    sku: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    stock: { type: Number, required: true, default: 0 },
    condition: { type: String, enum: ["New", "Refurbished", "Used"] },
    attributes: { type: Map, of: String, default: {} },
    images: [{ type: String }],
    published: { type: Boolean, default: true },
  },
  { _id: false }
);

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    sku: { type: String, unique: true, sparse: true },
    subtitle: { type: String },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    category: { type: String, required: true, trim: true },
    categorySlug: { type: String, trim: true, index: true },
    subcategory: { type: String, trim: true, index: true },
    condition: { type: String, required: true, enum: ["New", "Refurbished", "Used"] },
    brand: { type: String, required: true },
    images: [{ type: String }],
    specs: { type: Map, of: String, default: {} },
    stock: { type: Number, required: true, default: 0 },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    variants: [ProductVariantSchema],
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

const checks = [
  { key: "missingName", label: "Missing name/title", test: (p) => hasText(p.name) },
  {
    key: "shortDescriptions",
    label: `Short/missing description (<${DESCRIPTION_MIN_LENGTH} chars)`,
    test: (p) => hasText(p.description) && p.description.trim().length >= DESCRIPTION_MIN_LENGTH,
  },
  { key: "missingSubtitle", label: "Missing subtitle", test: (p) => hasText(p.subtitle) },
  { key: "missingImages", label: "Without images", test: (p) => Array.isArray(p.images) && p.images.length > 0 },
  { key: "missingBrand", label: "Without brand", test: (p) => hasText(p.brand) },
  { key: "missingCategory", label: "Without category", test: (p) => hasText(p.category) },
  { key: "missingSku", label: "Missing SKU", test: (p) => hasText(p.sku) },
  { key: "invalidSlug", label: "Invalid/missing slug", test: (p) => isValidSlug(p.slug) },
  { key: "invalidPrice", label: "Invalid price (<= 0)", test: (p) => Number(p.price) > 0 },
  { key: "unpublishedProducts", label: "Unpublished", test: (p) => p.published !== false },
];

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidSlug(value) {
  return hasText(value) && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.trim());
}

function productLabel(product) {
  const name = hasText(product.name) ? product.name.trim() : "Untitled product";
  const sku = hasText(product.sku) ? `SKU: ${product.sku.trim()}` : "no SKU";
  const slug = hasText(product.slug) ? `/products/${product.slug.trim()}` : "no slug";
  return `${name} (${sku}, ${slug})`;
}

function printIssueList(label, products) {
  console.log(`\n${label}: ${products.length}`);
  if (!products.length) {
    console.log("  None");
    return;
  }

  for (const product of products) {
    console.log(`  - ${productLabel(product)}`);
  }
}

async function fetchText(url) {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "ImpactStoreSEOAudit/1.0" },
    });
    const text = await response.text();
    return { ok: response.ok, status: response.status, text, error: null };
  } catch (error) {
    return { ok: false, status: null, text: "", error: error.message };
  }
}

function containsProductJsonLd(html) {
  const scripts = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];

  return scripts.some((script) => {
    const jsonText = script
      .replace(/^<script[^>]*>/i, "")
      .replace(/<\/script>$/i, "")
      .trim();

    try {
      const parsed = JSON.parse(jsonText);
      return jsonLdHasProduct(parsed);
    } catch {
      return /"@type"\s*:\s*"Product"/.test(jsonText);
    }
  });
}

function jsonLdHasProduct(value) {
  if (!value) return false;

  if (Array.isArray(value)) {
    return value.some(jsonLdHasProduct);
  }

  if (typeof value === "object") {
    const type = value["@type"];
    if (type === "Product" || (Array.isArray(type) && type.includes("Product"))) return true;
    if (value["@graph"]) return jsonLdHasProduct(value["@graph"]);
  }

  return false;
}

async function auditLiveSite(sampleProducts) {
  const sitemap = await fetchText(`${SITE_URL}/sitemap.xml`);
  const robots = await fetchText(`${SITE_URL}/robots.txt`);
  const sitemapUrlCount = sitemap.ok ? (sitemap.text.match(/<loc>/g) || []).length : 0;

  const productPages = [];
  for (const product of sampleProducts) {
    const url = `${SITE_URL}/products/${encodeURIComponent(product.slug)}`;
    const result = await fetchText(url);
    productPages.push({
      product,
      url,
      status: result.status,
      ok: result.ok,
      hasJsonLd: result.ok ? containsProductJsonLd(result.text) : false,
      error: result.error,
    });
  }

  return { sitemap, sitemapUrlCount, robots, productPages };
}

async function main() {
  await mongoose.connect(MONGODB_URI);

  try {
    const products = await Product.find({}).sort({ name: 1 }).lean();

    const failures = Object.fromEntries(checks.map((check) => [check.key, []]));
    let productsPassingAllChecks = 0;

    for (const product of products) {
      let passesAll = true;
      for (const check of checks) {
        if (!check.test(product)) {
          failures[check.key].push(product);
          passesAll = false;
        }
      }
      if (passesAll) productsPassingAllChecks += 1;
    }

    const totalProducts = products.length;
    const publishedCount = products.filter((product) => product.published !== false).length;
    const unpublishedCount = products.filter((product) => product.published === false).length;
    const healthScore = totalProducts ? Math.round((productsPassingAllChecks / totalProducts) * 100) : 0;

    const sampleProducts = products
      .filter((product) => product.published !== false && isValidSlug(product.slug))
      .slice(0, SAMPLE_SIZE);
    const liveSite = await auditLiveSite(sampleProducts);

    console.log("Impact Store V2 Product SEO Audit");
    console.log("=================================");
    console.log(`Generated: ${new Date().toISOString()}`);
    console.log(`Total products: ${totalProducts}`);
    console.log(`Published: ${publishedCount}`);
    console.log(`Unpublished: ${unpublishedCount}`);
    console.log(`Products passing all checks: ${productsPassingAllChecks}`);
    console.log(`Overall SEO health score: ${healthScore}%`);

    console.log("\nField Issue Summary");
    console.log("-------------------");
    for (const check of checks) {
      console.log(`${check.label}: ${failures[check.key].length}`);
    }

    printIssueList("Products missing name/title", failures.missingName);
    printIssueList(`Products with short descriptions (<${DESCRIPTION_MIN_LENGTH} chars)`, failures.shortDescriptions);
    printIssueList("Products missing subtitle", failures.missingSubtitle);
    printIssueList("Products without images", failures.missingImages);
    printIssueList("Products without brand", failures.missingBrand);
    printIssueList("Products without category", failures.missingCategory);
    printIssueList("Products missing SKU", failures.missingSku);
    printIssueList("Products with invalid/missing slug", failures.invalidSlug);
    printIssueList("Products with invalid price (<= 0)", failures.invalidPrice);
    printIssueList("Unpublished products", failures.unpublishedProducts);

    console.log("\nLive Site Checks");
    console.log("----------------");
    console.log(
      `Sitemap: ${liveSite.sitemap.ok ? "OK" : "FAILED"}` +
        ` (status: ${liveSite.sitemap.status ?? "n/a"}, URLs: ${liveSite.sitemapUrlCount})`
    );
    if (liveSite.sitemap.error) console.log(`  Error: ${liveSite.sitemap.error}`);
    console.log(
      `Robots.txt: ${liveSite.robots.ok ? "OK" : "FAILED"}` +
        ` (status: ${liveSite.robots.status ?? "n/a"})`
    );
    if (liveSite.robots.error) console.log(`  Error: ${liveSite.robots.error}`);

    console.log(`\nSample product JSON-LD checks (${liveSite.productPages.length}):`);
    if (!liveSite.productPages.length) {
      console.log("  No published products with valid slugs available for sampling.");
    }
    for (const page of liveSite.productPages) {
      console.log(
        `  - ${productLabel(page.product)}\n` +
          `    ${page.url}\n` +
          `    status: ${page.status ?? "n/a"}, JSON-LD Product: ${page.hasJsonLd ? "YES" : "NO"}` +
          `${page.error ? `, error: ${page.error}` : ""}`
      );
    }
  } finally {
    await mongoose.disconnect();
  }
}

main().catch(async (error) => {
  console.error("SEO audit failed:", error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
