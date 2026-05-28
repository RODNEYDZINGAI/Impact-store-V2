export type AdminProductStatusFilter = "all" | "published" | "unpublished";
export type AdminProductStockFilter = "all" | "in-stock" | "out-of-stock";

export interface AdminProductFilterableProduct {
  _id: string;
  name?: string;
  brand?: string;
  category?: string;
  categorySlug?: string;
  subcategory?: string;
  condition?: string;
  stock?: number;
  published?: boolean;
}

export interface AdminProductFilters {
  status: AdminProductStatusFilter;
  search: string;
  category: string;
  brand: string;
  condition: string;
  stock: AdminProductStockFilter;
}

export interface AdminProductFilterOptions {
  categories: string[];
  brands: string[];
  conditions: string[];
}

export const ADMIN_PRODUCT_STATUSES = ["all", "published", "unpublished"] as const satisfies readonly AdminProductStatusFilter[];
export const ADMIN_PRODUCT_STOCK_FILTERS = ["all", "in-stock", "out-of-stock"] as const satisfies readonly AdminProductStockFilter[];

export function createDefaultAdminProductFilters(): AdminProductFilters {
  return {
    status: "all",
    search: "",
    category: "all",
    brand: "all",
    condition: "all",
    stock: "all",
  };
}

export function isAdminProductPublished(product: AdminProductFilterableProduct): boolean {
  return product.published !== false;
}

export function applyAdminProductFilters<T extends AdminProductFilterableProduct>(
  products: T[],
  filters: Partial<AdminProductFilters>
): T[] {
  const normalized = { ...createDefaultAdminProductFilters(), ...filters };
  const search = normalizeValue(normalized.search).toLowerCase();

  return products.filter((product) => {
    if (normalized.status === "published" && !isAdminProductPublished(product)) return false;
    if (normalized.status === "unpublished" && isAdminProductPublished(product)) return false;

    if (!matchesStringFilter(product.category, normalized.category)) return false;
    if (!matchesStringFilter(product.brand, normalized.brand)) return false;
    if (!matchesStringFilter(product.condition, normalized.condition)) return false;

    if (normalized.stock === "in-stock" && Number(product.stock ?? 0) <= 0) return false;
    if (normalized.stock === "out-of-stock" && Number(product.stock ?? 0) > 0) return false;

    if (search) {
      const searchable = [
        product.name,
        product.brand,
        product.category,
        product.categorySlug,
        product.subcategory,
        product.condition,
      ]
        .map(normalizeValue)
        .join(" ")
        .toLowerCase();
      if (!searchable.includes(search)) return false;
    }

    return true;
  });
}

export function buildAdminProductFilterOptions(
  products: AdminProductFilterableProduct[]
): AdminProductFilterOptions {
  return {
    categories: uniqueSorted(products.map((p) => p.category)),
    brands: uniqueSorted(products.map((p) => p.brand)),
    conditions: uniqueSorted(products.map((p) => p.condition)),
  };
}

export function hasActiveAdminProductAttributeFilters(
  filters: Partial<AdminProductFilters>
): boolean {
  const normalized = { ...createDefaultAdminProductFilters(), ...filters };
  return Boolean(
    normalizeValue(normalized.search) ||
      normalized.category !== "all" ||
      normalized.brand !== "all" ||
      normalized.condition !== "all" ||
      normalized.stock !== "all"
  );
}

function matchesStringFilter(value: string | undefined, filter: string): boolean {
  return filter === "all" || normalizeValue(value) === filter;
}

function uniqueSorted(values: (string | undefined)[]): string[] {
  return Array.from(new Set(values.map(normalizeValue).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b)
  ) as string[];
}

function normalizeValue(value: string | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}
