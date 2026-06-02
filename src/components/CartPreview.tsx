"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ShoppingBag } from "lucide-react";

const PREVIEW_LIMIT = 4;

export default function CartPreview() {
  const { items, total, itemCount } = useCart();

  if (itemCount === 0) {
    return (
      <div className="p-5 text-center">
        <ShoppingBag className="mx-auto h-8 w-8 text-slate-300" />
        <p className="mt-2 text-sm font-medium text-slate-600">Your cart is empty</p>
        <Link
          href="/products"
          className="mt-3 inline-block rounded-full bg-[#1f4f8f] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-[#173d6e]"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  const visible = items.slice(0, PREVIEW_LIMIT);
  const overflow = items.length - PREVIEW_LIMIT;

  return (
    <div>
      <div className="divide-y divide-slate-100">
        {visible.map((item) => (
          <div key={item.cartKey} className="flex items-center gap-3 px-4 py-3">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt={item.name} className="h-full w-full object-contain p-1" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-slate-300" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-800">{item.name}</p>
              {item.variantTitle && (
                <p className="truncate text-[10px] text-[#1f4f8f]">{item.variantTitle}</p>
              )}
              <p className="mt-0.5 text-[10px] text-slate-500">
                {item.quantity} × R{item.price.toLocaleString()}
              </p>
            </div>
            <p className="shrink-0 text-xs font-bold text-slate-800">
              R{(item.price * item.quantity).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
      {overflow > 0 && (
        <p className="px-4 pb-2 text-center text-[10px] text-slate-400">
          and {overflow} more item{overflow > 1 ? "s" : ""}
        </p>
      )}
      <div className="border-t border-slate-100 px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-600">Subtotal</span>
          <span className="font-bold text-slate-900">R{total.toLocaleString()}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 border-t border-slate-100 p-3">
        <Link
          href="/cart"
          className="rounded-full border border-slate-200 py-2 text-center text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
        >
          View Cart
        </Link>
        <Link
          href="/checkout"
          className="rounded-full bg-[#1f4f8f] py-2 text-center text-xs font-semibold text-white transition hover:bg-[#173d6e]"
        >
          Checkout
        </Link>
      </div>
    </div>
  );
}
