import { Metadata } from "next";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import ProductGrid from "@/components/ProductGrid";
import FilterBar from "@/components/FilterBar";
import { buildTaxonomyProductFilter, mergeMongoFilters } from "@/lib/product-filters";
import { findTaxonomyCategory, findTaxonomySubcategory } from "@/lib/category-taxonomy";
import { getCategoryTaxonomy } from "@/models/CategoryTaxonomy";
import { buildCategoryFaqJsonLd, getCategorySeoContent, getCategorySeoDescription } from "@/lib/category-seo";
import { categoryProductsUrl, DEFAULT_OG_IMAGE, SITE_NAME, truncateMetaDescription } from "@/lib/seo";

interface ProductSearchParams {
  category?: string;
  categorySlug?: string;
  subcategory?: string;
  condition?: string;
  search?: string;
}

interface Props {
  searchParams: Promise<ProductSearchParams>;
}

function getCatalogTitle(params: ProductSearchParams, taxonomy: Awaited<ReturnType<typeof getCategoryTaxonomy>>) {
  const selectedCategory = findTaxonomyCategory(taxonomy, params.categorySlug || params.category);
  const selectedSubcategory = findTaxonomySubcategory(taxonomy, params.subcategory, selectedCategory?.slug);

  return {
    selectedCategory,
    selectedSubcategory,
    title: selectedSubcategory
      ? selectedSubcategory.subcategory.name
      : selectedCategory
        ? selectedCategory.name
        : params.category
          ? params.category
          : params.condition
            ? `${params.condition} Products`
            : "All Products",
  };
}

function hasFilterPermutation(params: ProductSearchParams) {
  return Boolean(params.search || params.condition);
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  await dbConnect();
  const taxonomy = await getCategoryTaxonomy();
  const { selectedCategory, selectedSubcategory, title } = getCatalogTitle(params, taxonomy);
  const categorySeo = getCategorySeoContent({
    categorySlug: selectedCategory?.slug,
    categoryName: selectedCategory?.name,
    subcategorySlug: selectedSubcategory?.subcategory.slug,
    subcategoryName: selectedSubcategory?.subcategory.name,
    rawCategory: params.category,
  });
  const scopedTitle = categorySeo?.seoTitle || (title === "All Products" ? "ICT Hardware, Devices & Accessories" : `${title} Products`);
  const description = truncateMetaDescription(
    categorySeo
      ? getCategorySeoDescription(categorySeo)
      : selectedSubcategory
        ? `Browse ${selectedSubcategory.subcategory.name} products in ${selectedSubcategory.category.name} from Impact Store. Compare ICT hardware, devices, accessories, and security solutions for South African buyers.`
        : selectedCategory
          ? selectedCategory.description || `Browse ${selectedCategory.name} products from Impact Store.`
          : params.search
            ? `Search Impact Store product results for ${params.search}.`
            : "Browse Impact Store ICT hardware, mobile devices, accessories, and security solutions with nationwide delivery in South Africa."
  );
  const canonical = selectedCategory
    ? categoryProductsUrl(selectedCategory.slug, selectedSubcategory?.subcategory.slug)
    : params.condition
      ? `/products?condition=${encodeURIComponent(params.condition)}`
      : "/products";
  const shouldIndex = Boolean(!hasFilterPermutation(params) && (selectedCategory || (!params.category && !params.subcategory)));

  return {
    title: scopedTitle,
    description,
    alternates: { canonical },
    openGraph: {
      title: categorySeo?.seoTitle || `${scopedTitle} | ${SITE_NAME}`,
      description,
      url: canonical,
      siteName: SITE_NAME,
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} product catalogue` }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: scopedTitle,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
    robots: {
      index: shouldIndex,
      follow: true,
    },
  };
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
  const categorySeo = getCategorySeoContent({
    categorySlug: selectedCategory?.slug,
    categoryName: selectedCategory?.name,
    subcategorySlug: selectedSubcategory?.subcategory.slug,
    subcategoryName: selectedSubcategory?.subcategory.name,
    rawCategory: params.category,
  });
  const shouldRenderCategorySeo = Boolean(categorySeo && selectedCategory && !hasFilterPermutation(params));

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
            {shouldRenderCategorySeo && categorySeo
              ? categorySeo.intro
              : "Browse Impact Store inventory by category, subcategory, condition, and search terms for procurement and everyday technology needs."}
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-[1440px] px-6 py-8">
        {shouldRenderCategorySeo && categorySeo ? (
          <>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(buildCategoryFaqJsonLd(categorySeo)) }}
            />
            <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#f7941d]">{categorySeo.eyebrow}</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">{categorySeo.seoTitle.replace(` | ${SITE_NAME}`, "")}</h2>
              <p className="mt-4 max-w-4xl text-sm leading-6 text-slate-600 md:text-base">{categorySeo.intro}</p>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {categorySeo.benefits.map((benefit) => (
                  <div key={benefit} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                    {benefit}
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-slate-950">Frequently asked questions</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  {categorySeo.faqs.map((faq) => (
                    <article key={faq.question} className="rounded-2xl border border-slate-100 p-4">
                      <h4 className="text-sm font-semibold text-slate-950">{faq.question}</h4>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{faq.answer}</p>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          </>
        ) : null}

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
