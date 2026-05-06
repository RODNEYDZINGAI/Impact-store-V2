"use client";

import { useCart } from "@/context/CartContext";

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  condition: string;
  stock: number;
}

export default function AddToCartButton({ product }: { product: Product }) {
  const { addToCart, items } = useCart();
  const inCart = items.find((i) => i._id === product._id)?.quantity ?? 0;
  const atLimit = inCart >= product.stock;

  if (product.stock <= 0) {
    return (
      <button disabled className="mt-6 w-full cursor-not-allowed rounded-md bg-slate-300 px-5 py-3 text-sm font-semibold text-slate-500">
        Out of Stock
      </button>
    );
  }

  return (
    <div className="mt-6">
      <button
        onClick={() =>
          addToCart({
            _id: product._id,
            name: product.name,
            price: product.price,
            image: product.images?.[0] || "",
            condition: product.condition,
          })
        }
        disabled={atLimit}
        className={`w-full rounded-md px-5 py-3 text-sm font-semibold transition ${atLimit ? "cursor-not-allowed bg-slate-300 text-slate-500" : "bg-[#1f4f8f] text-white hover:bg-[#173b6b]"}`}
      >
        {atLimit ? "Max stock reached" : "Add to Cart"}
      </button>
      {inCart > 0 && (
        <p className="mt-2 text-center text-sm text-slate-500">
          {inCart} in cart · {product.stock - inCart} left
        </p>
      )}
    </div>
  );
}
