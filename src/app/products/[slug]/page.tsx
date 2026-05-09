import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import ProductDetailActions from "@/components/ProductDetailActions";
import ProductGallery from "@/components/ProductGallery";
import ProductCard from "@/components/ProductCard";
import { Badge } from "@/components/ui/badge";

interface Props {
  params: Promise<{ slug: string }>;
}

const conditionStyles: Record<string, string> = {
  New: "bg-[#fbbf24] text-[#1f2937] border-[#fbbf24]",
  Refurbished: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Used: "bg-slate-100 text-slate-700 border-slate-200",
};

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  await dbConnect();
  const product = await Product.findOne({
    slug,
    $or: [{ published: true }, { published: { $exists: false } }]
  }).lean();

  if (!product) notFound();

  const p = JSON.parse(JSON.stringify(product));
  const specs: [string, string][] = p.specs ? Object.entries(p.specs) : [];

  // Fetch related products from the same category (excluding current product)
  const relatedProductsRaw = await Product.find({
    category: p.category,
    _id: { $ne: p._id },
    stock: { $gt: 0 },
    $or: [{ published: true }, { published: { $exists: false } }],
  })
    .limit(4)
    .lean();

  const relatedProducts = JSON.parse(JSON.stringify(relatedProductsRaw));

  return (
    <div className="min-h-screen bg-[#f5f7fb] pb-16">
      <div className="mx-auto max-w-[1440px] px-6 py-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <ProductGallery images={p.images || []} name={p.name} />

          <div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={`rounded-full text-[10px] uppercase tracking-widest ${conditionStyles[p.condition]}`}>
                {p.condition}
              </Badge>
              <span className="text-sm font-medium uppercase tracking-widest text-slate-400">{p.brand}</span>
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-normal text-[#1f2937]">{p.name}</h1>
            {p.subtitle && <p className="mt-3 leading-relaxed text-slate-500">{p.subtitle}</p>}

            {/* Price, stock, variant selector, and add-to-cart are all handled client-side */}
            <ProductDetailActions product={p} />

            {specs.length > 0 && (
              <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <h2 className="border-b border-slate-200 px-4 py-3 text-lg font-semibold text-[#1f2937]">Specifications</h2>
                {specs.map(([key, value], i) => (
                  <div key={key} className={`flex justify-between gap-4 px-4 py-3 text-sm ${i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                    <span className="text-slate-500">{key}</span>
                    <span className="text-right font-medium text-[#1f2937]">{value}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 grid grid-cols-2 gap-3">
              {["Authorized Dealer", "Quality Checked", "Nationwide Delivery", "Business Support"].map((badge) => (
                <div key={badge} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600">
                  <span className="mr-2 text-[#fbbf24]">&#10003;</span>
                  {badge}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description Section */}
        {p.description && (
          <div className="mt-16">
            <div className="mb-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
              <h2 className="text-center text-2xl font-semibold tracking-normal text-[#1f2937]">
                Description
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
              <p className="whitespace-pre-wrap leading-relaxed text-slate-600">{p.description}</p>
            </div>
          </div>
        )}

        {/* You May Also Like Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="mb-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
              <h2 className="text-center text-2xl font-semibold tracking-normal text-[#1f2937]">
                You May Also Like
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((product: typeof relatedProducts[0]) => (
                <ProductCard key={product._id} {...product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
