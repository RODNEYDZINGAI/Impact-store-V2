export interface CategorySubcategory {
  name: string;
  slug: string;
  legacyCategory?: string;
}

export interface CategoryTaxonomyItem {
  name: string;
  slug: string;
  description: string;
  legacyCategories: string[];
  defaultLegacyCategory: string;
  subcategories: CategorySubcategory[];
}

export const DEFAULT_CATEGORY_TAXONOMY: CategoryTaxonomyItem[] = [
  {
    name: "Mobile Devices",
    slug: "mobile-devices",
    description: "Phones, tablets, and device accessories for teams and individual buyers.",
    legacyCategories: ["Phones", "Tablets", "Accessories"],
    defaultLegacyCategory: "Phones",
    subcategories: [
      { name: "Phones", slug: "phones", legacyCategory: "Phones" },
      { name: "Tablets", slug: "tablets", legacyCategory: "Tablets" },
      { name: "Accessories", slug: "mobile-accessories", legacyCategory: "Accessories" },
    ],
  },
  {
    name: "IT Hardware",
    slug: "it-hardware",
    description: "Workplace infrastructure, endpoints, components, and peripherals.",
    legacyCategories: ["Laptops", "IT Hardware"],
    defaultLegacyCategory: "IT Hardware",
    subcategories: [
      { name: "Laptops & Desktops", slug: "laptops-desktops", legacyCategory: "Laptops" },
      { name: "Components", slug: "components", legacyCategory: "IT Hardware" },
      { name: "Networking", slug: "networking", legacyCategory: "IT Hardware" },
      { name: "Storage", slug: "storage", legacyCategory: "IT Hardware" },
      { name: "Peripherals", slug: "peripherals", legacyCategory: "IT Hardware" },
      { name: "Power & UPS", slug: "power-ups", legacyCategory: "IT Hardware" },
      { name: "Servers & Workstations", slug: "servers-workstations", legacyCategory: "IT Hardware" },
      { name: "Printers & Scanners", slug: "printers-scanners", legacyCategory: "IT Hardware" },
      { name: "Cables & Adapters", slug: "cables-adapters", legacyCategory: "IT Hardware" },
    ],
  },
  {
    name: "Security and Access Control",
    slug: "security-access-control",
    description: "Surveillance, access, alarm, and site security systems.",
    legacyCategories: ["Security & Access Control"],
    defaultLegacyCategory: "Security & Access Control",
    subcategories: [
      { name: "Cameras/CCTV", slug: "cameras-cctv", legacyCategory: "Security & Access Control" },
      { name: "NVR/DVR", slug: "nvr-dvr", legacyCategory: "Security & Access Control" },
      { name: "Alarms", slug: "alarms", legacyCategory: "Security & Access Control" },
      { name: "Access Readers & Controllers", slug: "access-readers-controllers", legacyCategory: "Security & Access Control" },
      { name: "Biometrics", slug: "biometrics", legacyCategory: "Security & Access Control" },
      { name: "Intercoms", slug: "intercoms", legacyCategory: "Security & Access Control" },
      { name: "Smart Locks", slug: "smart-locks", legacyCategory: "Security & Access Control" },
      { name: "Accessories/Cables/Mounts/Storage", slug: "security-accessories-cables-mounts-storage", legacyCategory: "Security & Access Control" },
    ],
  },
];

export const LEGACY_CATEGORY_OPTIONS = [
  "Phones",
  "Tablets",
  "Laptops",
  "Accessories",
  "IT Hardware",
  "Security & Access Control",
];

export function slugifyTaxonomyValue(value: string) {
  return value.trim().toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function normalizeTaxonomy(categories: CategoryTaxonomyItem[]) {
  return categories
    .filter((category) => category.name.trim())
    .map((category) => {
      const subcategories = category.subcategories
        .filter((subcategory) => subcategory.name.trim())
        .map((subcategory) => ({
          name: subcategory.name.trim(),
          slug: subcategory.slug.trim() || slugifyTaxonomyValue(subcategory.name),
          legacyCategory: subcategory.legacyCategory?.trim() || category.defaultLegacyCategory,
        }));

      return {
        name: category.name.trim(),
        slug: category.slug.trim() || slugifyTaxonomyValue(category.name),
        description: category.description.trim(),
        legacyCategories: Array.from(
          new Set(
            [
              ...category.legacyCategories,
              category.defaultLegacyCategory,
              ...subcategories.map((subcategory) => subcategory.legacyCategory).filter(Boolean),
            ].map((value) => String(value).trim()).filter(Boolean)
          )
        ),
        defaultLegacyCategory: category.defaultLegacyCategory.trim(),
        subcategories,
      };
    });
}

export function findTaxonomyCategory(categories: CategoryTaxonomyItem[], value?: string | null) {
  if (!value) return undefined;
  const normalized = value.toLowerCase();
  return categories.find(
    (category) =>
      category.slug === value ||
      category.name.toLowerCase() === normalized ||
      category.legacyCategories.some((legacy) => legacy.toLowerCase() === normalized)
  );
}

export function findTaxonomySubcategory(categories: CategoryTaxonomyItem[], value?: string | null, categorySlug?: string | null) {
  if (!value) return undefined;
  const normalized = value.toLowerCase();
  const scopedCategories = categorySlug ? categories.filter((category) => category.slug === categorySlug) : categories;

  for (const category of scopedCategories) {
    const subcategory = category.subcategories.find(
      (item) => item.slug === value || item.name.toLowerCase() === normalized
    );
    if (subcategory) return { category, subcategory };
  }

  return undefined;
}

export function getLegacyCategoryForSelection(categories: CategoryTaxonomyItem[], categorySlug: string, subcategorySlug?: string) {
  const category = categories.find((item) => item.slug === categorySlug);
  if (!category) return "";
  const subcategory = category.subcategories.find((item) => item.slug === subcategorySlug);
  return subcategory?.legacyCategory || category.defaultLegacyCategory;
}
