"use client";

import { useState } from "react";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";

interface ProductVariant {
  variantId: string;
  sku: string;
  title: string;
  price: number;
  originalPrice?: number;
  stock: number;
  condition?: string;
  images?: string[];
  published: boolean;
}

interface ProductForActions {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  condition: string;
  stock: number;
  variants?: ProductVariant[];
}

export default function ProductDetailActions({ product }: { product: ProductForActions }) {
  const hasVariants = (product.variants?.length ?? 0) > 0;
  const publishedVariants = product.variants?.filter((v) => v.published !== false) ?? [];

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    publishedVariants.length === 1 ? publishedVariants[0] : null
  );

  const displayPrice = selectedVariant?.price ?? product.price;
  const displayOriginalPrice = selectedVariant?.originalPrice ?? product.originalPrice;
  const displayStock = selectedVariant?.stock ?? product.stock;
  const savings = displayOriginalPrice ? displayOriginalPrice - displayPrice : 0;

  return (
    <div>
      <div className="mt-6">
        <div className="flex items-end gap-3">
          <span className="text-4xl font-semibold text-[#1f4f8f]">
            {hasVariants && !selectedVariant
              ? `From R${Math.min(...publishedVariants.map((v) => v.price)).toLocaleString()}`
              : `R${displayPrice.toLocaleString()}`}
          </span>
          {displayOriginalPrice && selectedVariant && (
            <span className="mb-1 text-lg text-slate-400 line-through">
              R{displayOriginalPrice.toLocaleString()}
            </span>
          )}
        </div>
        {savings > 0 && selectedVariant && (
          <p className="mt-2 text-lg font-semibold text-emerald-700">
            Save R{savings.toLocaleString()} vs market price
          </p>
        )}
      </div>

      {hasVariants ? (
        <div className="mt-4">
          <p className="text-sm font-medium text-slate-700">Select option:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {publishedVariants.map((variant) => (
              <button
                key={variant.variantId}
                onClick={() => setSelectedVariant(variant)}
                disabled={variant.stock <= 0}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                  selectedVariant?.variantId === variant.variantId
                    ? "border-[#1f4f8f] bg-[#1f4f8f] text-white"
                    : variant.stock <= 0
                    ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 line-through"
                    : "border-slate-200 bg-white text-slate-700 hover:border-[#1f4f8f]"
                }`}
              >
                {variant.title}
              </button>
            ))}
          </div>
          {selectedVariant && (
            <p className={`mt-3 text-sm font-medium ${displayStock > 0 ? "text-emerald-700" : "text-red-500"}`}>
              {displayStock > 0 ? `${displayStock} in stock` : "Out of stock"}
            </p>
          )}
        </div>
      ) : (
        <div className="mt-4">
          <p className={`text-sm font-medium ${displayStock > 0 ? "text-emerald-700" : "text-red-500"}`}>
            {displayStock > 0 ? `${displayStock} in stock` : "Out of stock"}
          </p>
        </div>
      )}

      <AddToCartButton product={product} selectedVariant={selectedVariant} />

      <Link
        href={`/quote?product=${product._id}&productName=${encodeURIComponent(product.name)}`}
        className="mt-3 flex w-full items-center justify-center rounded-full border border-[#1f4f8f] px-6 py-3 text-sm font-semibold text-[#1f4f8f] transition hover:bg-[#1f4f8f] hover:text-white"
      >
        Request Quote
      </Link>
    </div>
  );
}
