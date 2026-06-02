import { SITE_NAME } from "@/lib/seo";

type VariantLike = {
  variantId?: string;
  sku?: string;
  title?: string;
  price?: number;
  stock?: number;
  condition?: string;
  images?: string[];
  published?: boolean;
};

export type GoogleMerchantProductLike = {
  _id?: unknown;
  name?: string;
  slug?: string;
  sku?: string;
  description?: string;
  price?: number;
  category?: string;
  subcategory?: string;
  condition?: string;
  brand?: string;
  images?: string[];
  stock?: number;
  published?: boolean;
  variants?: VariantLike[];
};

export type GoogleMerchantFeedItem = {
  id: string;
  title: string;
  description: string;
  link: string;
  imageLink: string;
  additionalImageLinks: string[];
  availability: "in_stock" | "out_of_stock";
  price: string;
  condition: "new" | "refurbished" | "used";
  brand: string;
  mpn?: string;
  productType: string;
  googleProductCategory: string;
  itemGroupId?: string;
};

function collapseWhitespace(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function cleanDescription(value: unknown) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/Model\s*\/\s*Supplier\s+code\s*:/gi, "Model code:")
    .replace(/\bSupplier\s+code\s*:/gi, "Model code:")
    .replace(/\s*Supplied by [^.]+\./gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanText(value: unknown) {
  return collapseWhitespace(value);
}

function truncate(value: string, maxLength: number) {
  return value.length <= maxLength ? value : value.slice(0, maxLength).trimEnd();
}

export function xmlEscape(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function formatGoogleMerchantPrice(value: unknown) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return `${amount.toFixed(2)} ZAR`;
}

export function mapGoogleMerchantCondition(value: unknown): GoogleMerchantFeedItem["condition"] {
  const normalized = cleanText(value).toLowerCase();
  if (normalized === "refurbished") return "refurbished";
  if (normalized === "used") return "used";
  return "new";
}

export function googleProductCategory(category?: string, subcategory?: string) {
  const normalized = `${category ?? ""} ${subcategory ?? ""}`.toLowerCase();

  if (/camera|cctv|nvr|dvr|surveillance|security/.test(normalized)) {
    return "Electronics > Video > Video Surveillance";
  }

  if (/cable|adapter|connector|converter/.test(normalized)) {
    return "Electronics > Electronics Accessories > Cables";
  }

  if (/storage|drive|ssd|hard drive|memory card/.test(normalized)) {
    return "Electronics > Computers > Computer Components > Storage Devices";
  }

  if (/power|ups|battery|charger|adapter/.test(normalized)) {
    return "Electronics > Electronics Accessories > Power";
  }

  if (/network|router|switch|wireless|wi-?fi|access point|ethernet/.test(normalized)) {
    return "Electronics > Network Components";
  }

  return "Electronics";
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/$/, "");
}

function productId(product: GoogleMerchantProductLike) {
  return cleanText(product.sku) || cleanText(product._id) || cleanText(product.slug);
}

function absoluteImageUrl(image: string, baseUrl: string) {
  const trimmed = image.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;

  const normalizedPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${normalizeBaseUrl(baseUrl)}${normalizedPath}`;
}

function itemFromProduct(
  product: GoogleMerchantProductLike,
  baseUrl: string,
  variant?: VariantLike
): GoogleMerchantFeedItem | null {
  if (product.published === false) return null;

  const slug = cleanText(product.slug);
  const parentId = productId(product);
  const id = cleanText(variant?.sku) || (variant?.variantId ? `${parentId}-${variant.variantId}` : parentId);
  const productName = cleanText(product.name);
  const variantTitle = cleanText(variant?.title);
  const title = variant ? [productName, variantTitle].filter(Boolean).join(" - ") : productName;
  const description = truncate(cleanDescription(product.description), 5000);
  const brand = cleanText(product.brand);
  const price = formatGoogleMerchantPrice(variant?.price ?? product.price);
  const stock = Number(variant?.stock ?? product.stock ?? 0);
  const rawImages = (variant?.images?.length ? variant.images : product.images ?? []).filter(Boolean);
  const imageLinks = rawImages.map((image) => absoluteImageUrl(image, baseUrl));

  if (!id || !title || !description || !slug || !brand || !price || !imageLinks[0]) return null;

  const productType = [cleanText(product.category), cleanText(product.subcategory)].filter(Boolean).join(" > ");

  const item: GoogleMerchantFeedItem = {
    id,
    title: truncate(title, 150),
    description,
    link: `${normalizeBaseUrl(baseUrl)}/products/${encodeURIComponent(slug)}`,
    imageLink: imageLinks[0],
    additionalImageLinks: imageLinks.slice(1, 11),
    availability: stock > 0 ? "in_stock" : "out_of_stock",
    price,
    condition: mapGoogleMerchantCondition(variant?.condition ?? product.condition),
    brand: truncate(brand, 70),
    mpn: cleanText(variant?.sku) || cleanText(product.sku) || undefined,
    productType: productType || "Electronics",
    googleProductCategory: googleProductCategory(product.category, product.subcategory),
  };

  if (variant && parentId) {
    item.itemGroupId = parentId;
  }

  return item;
}

export function mapProductToGoogleMerchantFeedItems(
  product: GoogleMerchantProductLike,
  baseUrl: string
): GoogleMerchantFeedItem[] {
  const variants = product.variants?.filter((variant) => variant.published !== false) ?? [];

  if (variants.length > 0) {
    return variants
      .map((variant) => itemFromProduct(product, baseUrl, variant))
      .filter((item): item is GoogleMerchantFeedItem => Boolean(item));
  }

  const item = itemFromProduct(product, baseUrl);
  return item ? [item] : [];
}

function googleMerchantItemXml(item: GoogleMerchantFeedItem) {
  const optionalImages = item.additionalImageLinks
    .map((image) => `      <g:additional_image_link>${xmlEscape(image)}</g:additional_image_link>`)
    .join("\n");

  return [
    "    <item>",
    `      <g:id>${xmlEscape(item.id)}</g:id>`,
    `      <g:title>${xmlEscape(item.title)}</g:title>`,
    `      <g:description>${xmlEscape(item.description)}</g:description>`,
    `      <g:link>${xmlEscape(item.link)}</g:link>`,
    `      <g:image_link>${xmlEscape(item.imageLink)}</g:image_link>`,
    optionalImages,
    `      <g:availability>${item.availability}</g:availability>`,
    `      <g:price>${xmlEscape(item.price)}</g:price>`,
    `      <g:condition>${item.condition}</g:condition>`,
    `      <g:brand>${xmlEscape(item.brand)}</g:brand>`,
    item.mpn ? `      <g:mpn>${xmlEscape(item.mpn)}</g:mpn>` : "",
    item.itemGroupId ? `      <g:item_group_id>${xmlEscape(item.itemGroupId)}</g:item_group_id>` : "",
    `      <g:product_type>${xmlEscape(item.productType)}</g:product_type>`,
    `      <g:google_product_category>${xmlEscape(item.googleProductCategory)}</g:google_product_category>`,
    "    </item>",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildGoogleMerchantFeedXml(products: GoogleMerchantProductLike[], baseUrl: string) {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  const items = products.flatMap((product) => mapProductToGoogleMerchantFeedItems(product, normalizedBaseUrl));

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
    "  <channel>",
    `    <title>${xmlEscape(`${SITE_NAME} Products`)}</title>`,
    `    <link>${xmlEscape(normalizedBaseUrl)}</link>`,
    `    <description>${xmlEscape(`${SITE_NAME} product feed for Google Merchant Center`)}</description>`,
    ...items.map(googleMerchantItemXml),
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}
