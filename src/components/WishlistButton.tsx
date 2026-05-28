"use client";

import { Heart } from "lucide-react";
import { useState } from "react";
import { useWishlist, WishlistProduct } from "@/context/WishlistContext";

interface WishlistButtonProps {
  product: WishlistProduct;
  className?: string;
  compact?: boolean;
}

export default function WishlistButton({ product, className = "", compact = false }: WishlistButtonProps) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [saving, setSaving] = useState(false);
  const active = isWishlisted(product._id);

  const handleClick = async () => {
    setSaving(true);
    try {
      await toggleWishlist(product);
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={saving}
      aria-label={active ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
      aria-pressed={active}
      className={`inline-flex items-center justify-center gap-2 rounded-full border transition disabled:cursor-wait disabled:opacity-70 ${
        active
          ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
          : "border-slate-200 bg-white text-slate-600 hover:border-rose-200 hover:text-rose-600"
      } ${compact ? "h-10 w-10" : "px-4 py-2 text-sm font-semibold"} ${className}`}
    >
      <Heart className={`h-4 w-4 ${active ? "fill-current" : ""}`} />
      {!compact && <span>{active ? "Saved" : "Save"}</span>}
    </button>
  );
}
