import { notFound } from "next/navigation";
import { Metadata } from "next";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import ProductDetailClient from "@/components/ProductDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  await dbConnect();
  const product = await Product.findOne({
    slug,
    $or: [{ published: true }, { published: { $exists: false } }],
  })
    .select("name subtitle description brand condition price originalPrice category images")
    .lean();

  if (!product) return { title: "Product Not Found | Impact Store" };

  const title = `${product.name} | Impact Store`;
  const description =
    product.subtitle ||
    product.description?.slice(0, 160) ||
    `Buy ${product.name} from Impact Store. ${product.condition} ${product.brand} — nationwide delivery across South Africa.`;
  const imageUrl = product.images?.[0] || "/impact/impact-logo.svg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://impactstore.co.za/products/${slug}`,
      siteName: "Impact Store",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: product.name }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `https://impactstore.co.za/products/${slug}`,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  await dbConnect();
  const product = await Product.findOne({
    slug,
    $or: [{ published: true }, { published: { $exists: false } }],
  }).lean();

  if (!product) notFound();

  const p = JSON.parse(JSON.stringify(product));

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

  // Build JSON-LD structured data for rich snippets
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description || p.subtitle || "",
    image: p.images || [],
    sku: p.sku || "",
    brand: {
      "@type": "Brand",
      name: p.brand,
    },
    condition: `https://schema.org/${p.condition === "New" ? "NewCondition" : p.condition === "Refurbished" ? "RefurbishedCondition" : "UsedCondition"}`,
    offers: {
      "@type": "Offer",
      url: `https://impactstore.co.za/products/${slug}`,
      priceCurrency: "ZAR",
      price: p.price,
      availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Impact Store",
      },
    },
  };

  // Breadcrumb JSON-LD
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://impactstore.co.za" },
      { "@type": "ListItem", position: 2, name: "Products", item: "https://impactstore.co.za/products" },
      ...(p.category
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: p.category,
              item: `https://impactstore.co.za/products?category=${encodeURIComponent(p.category)}`,
            },
          ]
        : []),
      { "@type": "ListItem", position: p.category ? 4 : 3, name: p.name, item: `https://impactstore.co.za/products/${slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <ProductDetailClient product={p} relatedProducts={relatedProducts} />
    </>
  );
}
