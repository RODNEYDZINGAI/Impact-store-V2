import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import ProductGrid from "@/components/ProductGrid";
import FilterBar from "@/components/FilterBar";
import { buildTaxonomyProductFilter, mergeMongoFilters } from "@/lib/product-filters";
import { findTaxonomyCategory, findTaxonomySubcategory } from "@/lib/category-taxonomy";
import { getCategoryTaxonomy } from "@/models/CategoryTaxonomy";

interface Props {
  searchParams: Promise<{
    category?: string;
    categorySlug?: string;
    subcategory?: string;
    condition?: string;
    search?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  await dbConnect();

  const taxonomy = await getCategoryTaxonomy();
  const visibilityFilter = { $or: [{ published: true }, { published: { $exists: false } }] };
  const taxonomyFilter = buildTaxonomyProductFilter(taxonomy, params);
  const filters: Record<string, unknown>[] = [visibilityFilter, taxonomyFilter];

  if (params.condition) filters.push({ condition: params.condition });
  if (params.search) {
    filters.push({
      $or: [
        { name: { $regex: params.search, $options: "i" } },
        { brand: { $regex: params.search, $options: "i" } },
        { description: { $regex: params.search, $options: "i" } },
        { category: { $regex: params.search, $options: "i" } },
        { subcategory: { $regex: params.search, $options: "i" } },
      ],
    });
  }

  const products = await Product.find(mergeMongoFilters(...filters)).sort({ createdAt: -1 }).lean();
  const selectedCategory = findTaxonomyCategory(taxonomy, params.categorySlug || params.category);
  const selectedSubcategory = findTaxonomySubcategory(taxonomy, params.subcategory, selectedCategory?.slug);

  const title = selectedSubcategory
    ? selectedSubcategory.subcategory.name
    : selectedCategory
      ? selectedCategory.name
      : params.category
        ? params.category
        : params.condition
          ? `${params.condition} Products`
          : "All Products";

  return (
    <div className="min-h-screen bg-[#f5f7fb] pb-16">
      <div className="bg-[#0f172a] text-white">
        <div className="mx-auto max-w-[1440px] px-6 py-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#fbbf24]">Catalog</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal">{title}</h1>
          <p className="mt-3 max-w-2xl text-white/70">
            Browse Impact Store inventory by category, subcategory, condition, and search terms for procurement and everyday technology needs.
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-[1440px] px-6 py-8">
        <p className="text-sm text-slate-500">
          {products.length} product{products.length !== 1 ? "s" : ""} found
        </p>

        <FilterBar
          taxonomy={taxonomy}
          currentCategory={params.category}
          currentCategorySlug={params.categorySlug}
          currentSubcategory={params.subcategory}
          currentCondition={params.condition}
          currentSearch={params.search}
        />

        <div className="mt-8">
          <ProductGrid products={JSON.parse(JSON.stringify(products))} />
        </div>
      </div>
    </div>
  );
}
