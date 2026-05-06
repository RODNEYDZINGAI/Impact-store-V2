import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import ProductGrid from "@/components/ProductGrid";
import FilterBar from "@/components/FilterBar";

interface Props {
  searchParams: Promise<{ category?: string; condition?: string; search?: string }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  await dbConnect();

  const filter: Record<string, unknown> = { $or: [{ published: true }, { published: { $exists: false } }] };
  if (params.category) filter.category = params.category;
  if (params.condition) filter.condition = params.condition;
  if (params.search) {
    filter.$and = [
      { $or: [{ published: true }, { published: { $exists: false } }] },
      {
        $or: [
          { name: { $regex: params.search, $options: "i" } },
          { brand: { $regex: params.search, $options: "i" } },
          { description: { $regex: params.search, $options: "i" } },
        ],
      },
    ];
    delete filter.$or;
  }

  const products = await Product.find(filter).sort({ createdAt: -1 }).lean();

  const title = params.category
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
            Browse Impact Store inventory for business procurement, team rollouts, and everyday technology needs.
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-[1440px] px-6 py-8">
        <p className="text-sm text-slate-500">
          {products.length} product{products.length !== 1 ? "s" : ""} found
        </p>

        <FilterBar
          currentCategory={params.category}
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
