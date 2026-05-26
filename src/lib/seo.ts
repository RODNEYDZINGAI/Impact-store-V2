export const SITE_NAME = "Impact Store";
export const DEFAULT_BASE_URL = "https://impactstore.co.za";
export const DEFAULT_OG_IMAGE = "/impact/impact-logo.svg";

export function getBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  return (configured || DEFAULT_BASE_URL).replace(/\/$/, "");
}

export function absoluteUrl(pathOrUrl: string | undefined | null) {
  const fallback = DEFAULT_OG_IMAGE;
  const value = pathOrUrl?.trim() || fallback;

  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("//")) return `https:${value}`;

  const normalizedPath = value.startsWith("/") ? value : `/${value}`;
  return `${getBaseUrl()}${normalizedPath}`;
}

export function buildProductAltText(product: {
  name: string;
  brand?: string | null;
  condition?: string | null;
  category?: string | null;
}) {
  const parts = [product.condition, product.brand, product.name, product.category]
    .map((part) => part?.trim())
    .filter(Boolean);
  return `${parts.join(" ")} product image from Impact Store`;
}

export function truncateMetaDescription(description: string, maxLength = 160) {
  const normalized = description.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

export function categoryProductsUrl(categorySlug: string, subcategorySlug?: string) {
  const params = new URLSearchParams({ categorySlug });
  if (subcategorySlug) params.set("subcategory", subcategorySlug);
  // URLSearchParams.toString() uses & which is fine for HTTP but
  // must be &amp; in XML contexts (sitemap). Return raw here —
  // the sitemap consumer must XML-encode.
  return `/products?${params.toString()}`;
}

/** XML-safe variant of categoryProductsUrl for sitemap use. */
export function categoryProductsUrlXml(categorySlug: string, subcategorySlug?: string) {
  return categoryProductsUrl(categorySlug, subcategorySlug).replace(/&/g, "&amp;");
}
