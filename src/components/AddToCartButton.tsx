"use client";

import { useCart } from "@/context/CartContext";

interface ProductVariant {
  variantId: string;
  title: string;
  price: number;
  stock: number;
  images?: string[];
  condition?: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  condition: string;
  stock: number;
  variants?: ProductVariant[];
}

interface Props {
  product: Product;
  selectedVariant?: ProductVariant | null;
  quantity?: number;
}

export default function AddToCartButton({ product, selectedVariant, quantity = 1 }: Props) {
  const { addToCart, updateQuantity, items } = useCart();

  const hasVariants = (product.variants?.length ?? 0) > 0;
  const effectivePrice = selectedVariant ? selectedVariant.price : product.price;
  const effectiveStock = selectedVariant ? selectedVariant.stock : product.stock;
  const effectiveImage = selectedVariant?.images?.[0] ?? product.images?.[0] ?? "";
  const effectiveCondition = selectedVariant?.condition ?? product.condition;
  const cartKey = selectedVariant
    ? `${product._id}|${selectedVariant.variantId}`
    : product._id;

  const inCart = items.find((i) => i.cartKey === cartKey)?.quantity ?? 0;
  const atLimit = inCart + quantity > effectiveStock;

  if (hasVariants && !selectedVariant) {
    return (
      <button
        disabled
        className="mt-6 w-full cursor-not-allowed rounded-xl bg-slate-300 px-5 py-3 text-sm font-semibold text-slate-500"
      >
        Select an option above
      </button>
    );
  }

  if (effectiveStock <= 0) {
    return (
      <button
        disabled
        className="mt-6 w-full cursor-not-allowed rounded-xl bg-slate-300 px-5 py-3 text-sm font-semibold text-slate-500"
      >
        Out of Stock
      </button>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      _id: product._id,
      variantId: selectedVariant?.variantId,
      variantTitle: selectedVariant?.title,
      name: product.name,
      price: effectivePrice,
      image: effectiveImage,
      condition: effectiveCondition,
    });
    if (quantity > 1) {
      updateQuantity(cartKey, Math.min(inCart + quantity, effectiveStock));
    }
  };

  return (
    <div className="mt-6">
      <button
        onClick={handleAddToCart}
        disabled={atLimit}
        className={`w-full rounded-xl px-5 py-3 text-sm font-semibold transition ${
          atLimit
            ? "cursor-not-allowed bg-slate-300 text-slate-500"
            : "bg-[#1f4f8f] text-white hover:bg-[#173b6b]"
        }`}
      >
        {atLimit ? "Max stock reached" : "Add to Cart"}
      </button>
      {inCart > 0 && (
        <p className="mt-2 text-center text-sm text-slate-500">
          {inCart} in cart · {effectiveStock - inCart} left
        </p>
      )}
    </div>
  );
}
