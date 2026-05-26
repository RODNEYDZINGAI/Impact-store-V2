"use client";

import { FileText, ShoppingCart, Tag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { buildProductAltText } from "@/lib/seo";

interface ProductVariant {
  price: number;
  published?: boolean;
}

interface ProductCardProps {
  _id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  category: string;
  condition: string;
  brand: string;
  images: string[];
  subtitle?: string;
  variants?: ProductVariant[];
}

const conditionStyles: Record<string, string> = {
  New: "bg-[#fbbf24] text-[#1f2937]",
  Refurbished: "bg-emerald-100 text-emerald-700",
  Used: "bg-slate-200 text-slate-700",
};

export default function ProductCard({
  _id,
  name,
  slug,
  price,
  originalPrice,
  category,
  condition,
  brand,
  images,
  subtitle,
  variants,
}: ProductCardProps) {
  const { addToCart } = useCart();

  const publishedVariants = variants?.filter((v) => v.published !== false) ?? [];
  const hasVariants = publishedVariants.length > 0;
  const fromPrice = hasVariants ? Math.min(...publishedVariants.map((v) => v.price)) : null;
  const savings = originalPrice ? originalPrice - price : 0;
  const imageAlt = buildProductAltText({ name, brand, condition, category });
  const quoteHref = `/quote?${new URLSearchParams({
    product: _id,
    productName: name,
    source: "product-card",
  }).toString()}`;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/products/${slug}`} className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {!hasVariants && savings > 0 && (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-[#fbbf24] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#1f2937] shadow-sm">
            Save R{savings.toLocaleString()}
          </span>
        )}
        <span
          className={`absolute right-4 top-4 z-10 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest shadow-sm ${
            conditionStyles[condition] || conditionStyles.Used
          }`}
        >
          {condition}
        </span>
        <div className="relative h-full w-full transition-transform duration-500 group-hover:scale-110">
          {images[0] ? (
            <img src={images[0]} alt={imageAlt} className="h-full w-full object-cover object-center" />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-300">
              <ShoppingCart className="h-12 w-12" />
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{brand}</p>
        <Link href={`/products/${slug}`} className="mt-2">
          <h3 className="font-semibold leading-snug text-[#1f2937] transition group-hover:text-[#1f4f8f]">{name}</h3>
          {subtitle && <p className="mt-2 line-clamp-2 text-sm text-slate-500">{subtitle}</p>}
        </Link>

        <div className="mt-auto pt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold text-[#1f4f8f]">
              {hasVariants
                ? `From R${fromPrice!.toLocaleString()}`
                : `R${price.toLocaleString()}`}
            </span>
            {!hasVariants && originalPrice && (
              <span className="text-xs text-slate-400 line-through">R{originalPrice.toLocaleString()}</span>
            )}
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {hasVariants ? (
            <Link
              href={`/products/${slug}`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[#1f4f8f] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#173b6b]"
            >
              <Tag className="h-4 w-4" />
              View Options
            </Link>
          ) : (
            <button
              onClick={() => addToCart({ _id, name, price, image: images[0] || "", condition })}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[#1f4f8f] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#173b6b]"
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </button>
          )}
          <Link
            href={quoteHref}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-xs font-semibold text-[#1f2937] transition hover:bg-slate-50"
          >
            <FileText className="h-4 w-4" />
            Quote
          </Link>
        </div>
      </div>
    </div>
  );
}
