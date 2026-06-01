"use client";

import Link from "next/link";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export default function WishlistPage() {
  const { items, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-[#1f4f8f]">Saved products</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">My Wishlist</h1>
            <p className="mt-2 max-w-2xl text-slate-500">
              Keep track of devices you are considering, then add them to cart or request a quote when you are ready.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-full bg-[#1f4f8f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#173b6b]"
          >
            Browse products
          </Link>
        </div>

        {loading ? (
          <div className="mt-12 flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 shadow-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1f4f8f] border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500">
              <Heart className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-slate-900">Your wishlist is empty</h2>
            <p className="mt-2 text-slate-500">Tap the heart on any product to save it here for later.</p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-[#1f4f8f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#173b6b]"
            >
              Shop products
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((product) => (
              <div key={product._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <Link href={`/products/${product.slug}`} className="block aspect-[4/3] bg-slate-100">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-300">
                      <Heart className="h-10 w-10" />
                    </div>
                  )}
                </Link>
                <div className="p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{product.brand}</p>
                  <Link href={`/products/${product.slug}`}>
                    <h2 className="mt-2 line-clamp-2 font-semibold text-slate-900 hover:text-[#1f4f8f]">{product.name}</h2>
                  </Link>
                  {product.subtitle && <p className="mt-2 line-clamp-2 text-sm text-slate-500">{product.subtitle}</p>}
                  <p className="mt-3 text-xl font-semibold text-[#1f4f8f]">R{product.price.toLocaleString()}</p>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => addToCart({
                        _id: product._id,
                        name: product.name,
                        price: product.price,
                        image: product.images?.[0] || "",
                        condition: product.condition,
                      })}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[#1f4f8f] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#173b6b]"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromWishlist(product._id)}
                      aria-label={`Remove ${product.name} from wishlist`}
                      className="inline-flex items-center justify-center rounded-md border border-slate-200 px-3 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
