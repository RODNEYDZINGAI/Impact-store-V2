import {
  CategoryTaxonomyItem,
  findTaxonomyCategory,
  findTaxonomySubcategory,
} from "@/lib/category-taxonomy";

export interface ProductFilterInput {
  category?: string | null;
  categorySlug?: string | null;
  subcategory?: string | null;
}

export function buildTaxonomyProductFilter(taxonomy: CategoryTaxonomyItem[], input: ProductFilterInput) {
  const clauses: Record<string, unknown>[] = [];
  const selectedCategory = findTaxonomyCategory(taxonomy, input.categorySlug || input.category);
  const selectedSubcategory = findTaxonomySubcategory(taxonomy, input.subcategory, selectedCategory?.slug);

  if (selectedCategory) {
    clauses.push({ categorySlug: selectedCategory.slug });
    clauses.push({ category: selectedCategory.name });
    for (const legacyCategory of selectedCategory.legacyCategories) clauses.push({ category: legacyCategory });
  } else if (input.category) {
    clauses.push({ category: input.category });
    clauses.push({ subcategory: input.category });
  }

  if (selectedSubcategory) {
    const subcategoryClauses: Record<string, unknown>[] = [
      { subcategory: selectedSubcategory.subcategory.name },
      { subcategory: selectedSubcategory.subcategory.slug },
    ];
    const legacy = selectedSubcategory.subcategory.legacyCategory;
    const specificLegacy =
      legacy &&
      (legacy !== selectedSubcategory.category.defaultLegacyCategory ||
        legacy.toLowerCase() === selectedSubcategory.subcategory.name.toLowerCase());
    if (specificLegacy) subcategoryClauses.push({ category: legacy });
    return clauses.length > 0
      ? { $and: [{ $or: clauses }, { $or: subcategoryClauses }] }
      : { $or: subcategoryClauses };
  }

  if (input.subcategory) clauses.push({ subcategory: input.subcategory });
  if (clauses.length === 0) return {};
  if (clauses.length === 1) return clauses[0];
  return { $or: clauses };
}

export function mergeMongoFilters(...filters: Record<string, unknown>[]) {
  const populated = filters.filter((filter) => Object.keys(filter).length > 0);
  if (populated.length === 0) return {};
  if (populated.length === 1) return populated[0];
  return { $and: populated };
}
