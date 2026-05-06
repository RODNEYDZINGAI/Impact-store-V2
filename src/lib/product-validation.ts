export const PRODUCT_CATEGORIES = [
  "Phones",
  "Tablets",
  "Laptops",
  "Accessories",
  "IT Hardware",
  "Security & Access Control",
] as const;

export const PRODUCT_CONDITIONS = ["New", "Refurbished"] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
export type ProductCondition = (typeof PRODUCT_CONDITIONS)[number];

export interface ProductPayload {
  name: string;
  slug: string;
  sku?: string;
  subtitle?: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: ProductCategory;
  condition: ProductCondition;
  brand: string;
  images: string[];
  specs: Record<string, string>;
  stock: number;
  featured: boolean;
  published: boolean;
}

export interface ProductValidationResult {
  product?: ProductPayload;
  errors: string[];
  warnings: string[];
}

export const PRODUCT_IMPORT_HEADERS = [
  "sku",
  "name",
  "slug",
  "brand",
  "category",
  "condition",
  "price",
  "originalPrice",
  "stock",
  "featured",
  "published",
  "subtitle",
  "description",
  "images",
  "specs",
] as const;

const FIELD_ALIASES: Record<string, string> = {
  originalprice: "originalPrice",
  original_price: "originalPrice",
  originalpricezar: "originalPrice",
  saleprice: "price",
  productname: "name",
  product_name: "name",
  image: "images",
  imageurls: "images",
  image_urls: "images",
  specifications: "specs",
};

export function generateSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function normalizeSku(value: unknown) {
  const sku = stringValue(value).toUpperCase().replace(/\s+/g, "-");
  return sku || undefined;
}

export function normalizeProductRow(row: Record<string, unknown>) {
  const normalized: Record<string, unknown> = {};

  for (const [rawKey, value] of Object.entries(row)) {
    const key = rawKey.trim();
    if (!key) continue;

    const compactKey = key.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
    const mappedKey = FIELD_ALIASES[compactKey] || key;
    normalized[mappedKey] = value;
  }

  return normalized;
}

export function validateProductInput(
  rawInput: Record<string, unknown>,
  options: { partial?: boolean; defaultPublished?: boolean } = {}
): ProductValidationResult {
  const input = normalizeProductRow(rawInput);
  const errors: string[] = [];
  const warnings: string[] = [];
  const partial = options.partial === true;

  const name = stringValue(input.name);
  const brand = stringValue(input.brand);
  const description = stringValue(input.description);
  const slug = stringValue(input.slug) || generateSlug(name);
  const sku = normalizeSku(input.sku);
  const subtitle = optionalString(input.subtitle);
  const price = numberValue(input.price);
  const originalPrice = optionalNumber(input.originalPrice);
  const stock = integerValue(input.stock);
  const category = stringValue(input.category) as ProductCategory;
  const condition = stringValue(input.condition) as ProductCondition;
  const featured = booleanValue(input.featured, false);
  const published = booleanValue(input.published, options.defaultPublished ?? true);
  const images = imageListValue(input.images);
  const specs = specsValue(input.specs);

  if (!partial || input.name !== undefined) {
    if (!name) errors.push("Name is required.");
  }
  if (!partial || input.slug !== undefined || input.name !== undefined) {
    if (!slug) errors.push("Slug is required or must be generated from a product name.");
  }
  if (!partial || input.brand !== undefined) {
    if (!brand) errors.push("Brand is required.");
  }
  if (!partial || input.description !== undefined) {
    if (!description) errors.push("Description is required.");
  }
  if (!partial || input.category !== undefined) {
    if (!PRODUCT_CATEGORIES.includes(category)) {
      errors.push(`Category must be one of: ${PRODUCT_CATEGORIES.join(", ")}.`);
    }
  }
  if (!partial || input.condition !== undefined) {
    if (!PRODUCT_CONDITIONS.includes(condition)) {
      errors.push(`Condition must be one of: ${PRODUCT_CONDITIONS.join(", ")}.`);
    }
  }
  if (!partial || input.price !== undefined) {
    if (price === undefined || price <= 0) errors.push("Price must be greater than 0.");
  }
  if (originalPrice !== undefined && originalPrice < 0) {
    errors.push("Original price cannot be negative.");
  }
  if (!partial || input.stock !== undefined) {
    if (stock === undefined || stock < 0) errors.push("Stock must be 0 or greater.");
  }
  if (images.some((url) => !isAllowedImageValue(url))) {
    errors.push("Images must be valid URL or site-relative paths.");
  }

  if (!images.length) warnings.push("No product images provided.");
  if (originalPrice !== undefined && price !== undefined && originalPrice < price) {
    warnings.push("Original price is lower than price.");
  }

  if (errors.length) return { errors, warnings };

  const product: ProductPayload = {
    name,
    slug,
    description,
    price: price as number,
    category,
    condition,
    brand,
    images,
    specs,
    stock: stock as number,
    featured,
    published,
  };

  if (sku) product.sku = sku;
  if (subtitle) product.subtitle = subtitle;
  if (originalPrice !== undefined) product.originalPrice = originalPrice;

  return { product, errors, warnings };
}

export function pickProductUpdate(rawInput: Record<string, unknown>) {
  const allowed = new Set([
    "name",
    "slug",
    "sku",
    "subtitle",
    "description",
    "price",
    "originalPrice",
    "category",
    "condition",
    "brand",
    "images",
    "specs",
    "stock",
    "featured",
    "published",
  ]);
  const normalized = normalizeProductRow(rawInput);
  const picked: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(normalized)) {
    if (allowed.has(key)) picked[key] = value;
  }

  return picked;
}

function stringValue(value: unknown) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function optionalString(value: unknown) {
  const text = stringValue(value);
  return text || undefined;
}

function numberValue(value: unknown) {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(String(value).replace(/[R,\s]/g, ""));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function optionalNumber(value: unknown) {
  return numberValue(value);
}

function integerValue(value: unknown) {
  const parsed = numberValue(value);
  return parsed === undefined ? undefined : Math.trunc(parsed);
}

function booleanValue(value: unknown, fallback: boolean) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  const text = String(value).trim().toLowerCase();
  if (["true", "yes", "y", "1", "published", "featured"].includes(text)) return true;
  if (["false", "no", "n", "0", "unpublished"].includes(text)) return false;
  return fallback;
}

function imageListValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => stringValue(item)).filter(Boolean);
  }
  const text = stringValue(value);
  if (!text) return [];
  return text
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function specsValue(value: unknown) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .map(([key, val]) => [key.trim(), stringValue(val)])
        .filter(([key]) => key)
    );
  }

  const text = stringValue(value);
  if (!text) return {};

  return Object.fromEntries(
    text
      .split(/[;\n]/)
      .map((pair) => {
        const separatorIndex = pair.indexOf(":");
        if (separatorIndex === -1) return ["", ""];
        return [
          pair.slice(0, separatorIndex).trim(),
          pair.slice(separatorIndex + 1).trim(),
        ];
      })
      .filter(([key]) => key)
  );
}

function isAllowedImageValue(value: string) {
  if (value.startsWith("/")) return true;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}
