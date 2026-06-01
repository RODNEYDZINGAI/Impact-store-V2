"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { useSession } from "next-auth/react";

export interface WishlistProduct {
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
}

interface WishlistContextType {
  items: WishlistProduct[];
  wishlistCount: number;
  isWishlisted: (productId: string) => boolean;
  addToWishlist: (product: WishlistProduct) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  toggleWishlist: (product: WishlistProduct) => Promise<void>;
  loading: boolean;
}

const STORAGE_KEY = "impact-store-wishlist";
const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

function dedupeProducts(products: WishlistProduct[]) {
  const seen = new Set<string>();
  return products.filter((product) => {
    if (!product?._id || seen.has(product._id)) return false;
    seen.add(product._id);
    return true;
  });
}

function readStoredWishlist() {
  if (typeof window === "undefined") return [];
  try {
    return dedupeProducts(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const [items, setItems] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated") {
      let cancelled = false;

      void Promise.resolve()
        .then(async () => {
          setLoading(true);
          const res = await fetch("/api/wishlist");
          if (!res.ok) throw new Error("Failed to fetch wishlist");
          return (await res.json()) as WishlistProduct[];
        })
        .then((products) => {
          if (!cancelled) setItems(dedupeProducts(products));
        })
        .catch(() => {
          if (!cancelled) setItems([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });

      return () => {
        cancelled = true;
      };
    }

    queueMicrotask(() => {
      setItems(readStoredWishlist());
      setLoading(false);
    });
  }, [status]);

  useEffect(() => {
    if (status === "unauthenticated") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, status]);

  const isWishlisted = useCallback(
    (productId: string) => items.some((item) => item._id === productId),
    [items]
  );

  const addToWishlist = useCallback(
    async (product: WishlistProduct) => {
      if (status === "authenticated") {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product._id }),
        });
        if (!res.ok) throw new Error("Failed to add wishlist item");
        setItems(dedupeProducts(await res.json()));
        return;
      }

      setItems((prev) => dedupeProducts([...prev, product]));
    },
    [status]
  );

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      if (status === "authenticated") {
        const res = await fetch(`/api/wishlist?productId=${encodeURIComponent(productId)}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to remove wishlist item");
        setItems(dedupeProducts(await res.json()));
        return;
      }

      setItems((prev) => prev.filter((item) => item._id !== productId));
    },
    [status]
  );

  const toggleWishlist = useCallback(
    async (product: WishlistProduct) => {
      if (isWishlisted(product._id)) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product);
      }
    },
    [addToWishlist, isWishlisted, removeFromWishlist]
  );

  const value = useMemo(
    () => ({
      items,
      wishlistCount: items.length,
      isWishlisted,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      loading,
    }),
    [addToWishlist, isWishlisted, items, loading, removeFromWishlist, toggleWishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
}
