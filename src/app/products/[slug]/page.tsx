import { notFound } from "next/navigation";
import { Metadata } from "next";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import ProductDetailClient from "@/components/ProductDetailClient";
import { absoluteUrl, buildProductAltText, DEFAULT_OG_IMAGE, getBaseUrl, SITE_NAME, truncateMetaDescription } from "@/lib/seo";

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
    .select("name subtitle description brand condition price originalPrice category categorySlug subcategory images")
    .lean();

  if (!product) return { title: "Product Not Found | Impact Store" };

  const title = product.name;
  const description = truncateMetaDescription(
    product.subtitle ||
      product.description ||
      `Buy ${product.name} from Impact Store. ${product.condition} ${product.brand} — nationwide delivery across South Africa.`
  );
  const imageUrl = absoluteUrl(product.images?.[0] || DEFAULT_OG_IMAGE);
  const canonical = `/products/${slug}`;
  const imageAlt = buildProductAltText(product);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: imageAlt }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical,
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

  const baseUrl = getBaseUrl();
  const productUrl = `${baseUrl}/products/${slug}`;
  const productImages = (p.images?.length ? p.images : [DEFAULT_OG_IMAGE]).map((image: string) => absoluteUrl(image));
  const priceValidUntil = p.updatedAt
    ? new Date(new Date(p.updatedAt).getTime() + 1000 * 60 * 60 * 24 * 30).toISOString().split("T")[0]
    : undefined;

  // Build JSON-LD structured data for rich snippets
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description || p.subtitle || "",
    image: productImages,
    sku: p.sku || "",
    category: p.subcategory || p.category || undefined,
    brand: {
      "@type": "Brand",
      name: p.brand,
    },
    itemCondition: `https://schema.org/${p.condition === "New" ? "NewCondition" : p.condition === "Refurbished" ? "RefurbishedCondition" : "UsedCondition"}`,
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "ZAR",
      price: p.price,
      priceValidUntil,
      availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
      },
    },
  };

  // Breadcrumb JSON-LD
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Products", item: `${baseUrl}/products` },
      ...(p.category
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: p.category,
              item: p.categorySlug
                ? `${baseUrl}/products?categorySlug=${encodeURIComponent(p.categorySlug)}`
                : `${baseUrl}/products?category=${encodeURIComponent(p.category)}`,
            },
          ]
        : []),
      { "@type": "ListItem", position: p.category ? 4 : 3, name: p.name, item: productUrl },
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
