"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus, Clock, Truck } from "lucide-react";
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
  const [quantity, setQuantity] = useState(1);

  const displayPrice = selectedVariant?.price ?? product.price;
  const displayOriginalPrice = selectedVariant?.originalPrice ?? product.originalPrice;
  const displayStock = selectedVariant?.stock ?? product.stock;
  const savings = displayOriginalPrice ? displayOriginalPrice - displayPrice : 0;
  const isLowStock = displayStock > 0 && displayStock <= 5;
  const showPriceDetails = !hasVariants || !!selectedVariant;

  return (
    <div>
      {/* Price */}
      <div className="mt-6">
        <div className="flex items-end gap-3">
          <span className="text-4xl font-semibold text-[#1f4f8f]">
            {hasVariants && !selectedVariant
              ? `From R${Math.min(...publishedVariants.map((v) => v.price)).toLocaleString()}`
              : `R${displayPrice.toLocaleString()}`}
          </span>
          {displayOriginalPrice && showPriceDetails && (
            <span className="mb-1 text-lg text-slate-400 line-through">
              R{displayOriginalPrice.toLocaleString()}
            </span>
          )}
        </div>
        {savings > 0 && showPriceDetails && (
          <p className="mt-2 text-lg font-semibold text-emerald-700">
            Save R{savings.toLocaleString()} vs market price
          </p>
        )}
      </div>

      {/* Variants */}
      {hasVariants ? (
        <div className="mt-4">
          <p className="text-sm font-medium text-slate-700">Select option:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {publishedVariants.map((variant) => (
              <button
                key={variant.variantId}
                onClick={() => {
                  setSelectedVariant(variant);
                  setQuantity(1);
                }}
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

      {/* Low stock urgency */}
      {isLowStock && showPriceDetails && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <Clock className="h-4 w-4 flex-shrink-0 text-amber-600" />
          <p className="text-sm font-medium text-amber-700">
            Only {displayStock} left — order soon!
          </p>
        </div>
      )}

      {/* Quantity selector */}
      {displayStock > 0 && showPriceDetails && (
        <div className="mt-5">
          <p className="mb-2 text-sm font-medium text-slate-700">Quantity</p>
          <div className="inline-flex overflow-hidden rounded-xl border border-slate-200">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className="px-4 py-2.5 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-[3rem] border-x border-slate-200 bg-white px-3 py-2.5 text-center font-semibold text-slate-800">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => Math.min(displayStock, q + 1))}
              disabled={quantity >= displayStock}
              aria-label="Increase quantity"
              className="px-4 py-2.5 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <AddToCartButton product={product} selectedVariant={selectedVariant} quantity={quantity} />

      {/* Delivery estimate */}
      <div className="mt-4 flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
        <Truck className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-500" />
        <div>
          <p className="text-xs font-medium text-slate-700">Estimated Delivery</p>
          <p className="text-xs text-slate-500">
            2–3 business days (Gauteng) · 3–5 business days nationwide
          </p>
        </div>
      </div>

      <Link
        href={`/quote?product=${product._id}&productName=${encodeURIComponent(product.name)}`}
        className="mt-3 flex w-full items-center justify-center rounded-full border border-[#1f4f8f] px-6 py-3 text-sm font-semibold text-[#1f4f8f] transition hover:bg-[#1f4f8f] hover:text-white"
      >
        Request Quote
      </Link>
    </div>
  );
}
