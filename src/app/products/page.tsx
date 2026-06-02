import { Metadata } from "next";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import ProductGrid from "@/components/ProductGrid";
import FilterBar from "@/components/FilterBar";
import { buildTaxonomyProductFilter, mergeMongoFilters } from "@/lib/product-filters";
import { findTaxonomyCategory, findTaxonomySubcategory } from "@/lib/category-taxonomy";
import { getCategoryTaxonomy } from "@/models/CategoryTaxonomy";
import { categoryProductsUrl, DEFAULT_OG_IMAGE, SITE_NAME, truncateMetaDescription } from "@/lib/seo";
import { buildFAQPageJsonLd, categorySEOContent, getCategorySEOContent, getCategorySEOMetaDescription } from "@/lib/category-seo-content";

interface ProductSearchParams {
  category?: string;
  categorySlug?: string;
  subcategory?: string;
  condition?: string;
  search?: string;
  inStock?: string;
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

function getCategoryKeyForSEO(
  params: ProductSearchParams,
  selectedCategory: ReturnType<typeof findTaxonomyCategory>,
) {
  if (params.category && categorySEOContent[params.category]) return params.category;
  if (selectedCategory?.name && categorySEOContent[selectedCategory.name]) return selectedCategory.name;
  return undefined;
}

function hasFilterPermutation(params: ProductSearchParams) {
  return Boolean(params.search || params.condition || params.inStock);
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  await dbConnect();
  const taxonomy = await getCategoryTaxonomy();
  const { selectedCategory, selectedSubcategory, title } = getCatalogTitle(params, taxonomy);
  const categoryKey = getCategoryKeyForSEO(params, selectedCategory);
  const seoContent = categoryKey && !hasFilterPermutation(params) ? getCategorySEOContent(categoryKey) : undefined;
  const scopedTitle = seoContent?.seoTitle || (title === "All Products" ? "ICT Hardware, Devices & Accessories" : `${title} Products`);
  const description = truncateMetaDescription(
    seoContent
      ? getCategorySEOMetaDescription(seoContent)
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
      title: seoContent?.seoTitle || `${scopedTitle} | ${SITE_NAME}`,
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
  if (params.inStock === "true") {
    filters.push({
      $or: [
        {
          $and: [
            { $or: [{ variants: { $exists: false } }, { variants: { $size: 0 } }] },
            { stock: { $gt: 0 } },
          ],
        },
        { "variants.stock": { $gt: 0 } },
      ],
    });
  }
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

  const products = await Product.find(mergeMongoFilters(...filters))
    .select("-sourceUrl -supplier")
    .sort({ createdAt: -1 })
    .lean();
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

  const categoryKey = getCategoryKeyForSEO(params, selectedCategory);
  const seoContent = categoryKey && !hasFilterPermutation(params) ? getCategorySEOContent(categoryKey) : undefined;

  return (
    <div className="min-h-screen bg-[#f5f7fb] pb-16">
      <div className="bg-[#0f172a] text-white">
        <div className="mx-auto max-w-[1440px] px-6 py-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#fbbf24]">Catalog</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal">{title}</h1>
          <p className="mt-3 max-w-2xl text-white/70">
            {seoContent?.intro || "Browse Impact Store inventory by category, subcategory, condition, and search terms for procurement and everyday technology needs."}
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
          currentInStock={params.inStock}
        />

        <div className="mt-8">
          <ProductGrid products={JSON.parse(JSON.stringify(products))} />
        </div>

        {seoContent ? (
          <section className="mt-12 space-y-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#f7941d]">{seoContent.eyebrow}</p>
              <h2 className="mt-2 text-2xl font-semibold text-[#1f2937]">{seoContent.seoTitle.replace(` | ${SITE_NAME}`, "")}</h2>
            </div>

            <p className="max-w-4xl text-sm leading-relaxed text-slate-600 md:text-base">
              {seoContent.description}
            </p>

            <div className="grid gap-4 md:grid-cols-3">
              {seoContent.benefits.map((benefit) => (
                <div key={benefit} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  {benefit}
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#0f172a]">Frequently Asked Questions</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {seoContent.faqs.map((faq) => (
                  <article key={faq.question} className="rounded-2xl border border-slate-200 bg-[#f5f7fb] p-6">
                    <h4 className="text-sm font-semibold text-[#0f172a]">{faq.question}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">{faq.answer}</p>
                  </article>
                ))}
              </div>
            </div>

            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFAQPageJsonLd(seoContent)) }}
            />
          </section>
        ) : null}
      </div>
    </div>
  );
}
