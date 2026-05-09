"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  cartKey: string;
  _id: string;
  variantId?: string;
  variantTitle?: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  condition: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity" | "cartKey">) => void;
  removeFromCart: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function migrateStoredItems(raw: unknown[]): CartItem[] {
  return raw.map((item) => {
    const i = item as Partial<CartItem> & { _id?: string };
    const cartKey = i.cartKey || (i.variantId ? `${i._id}|${i.variantId}` : i._id) || "";
    return { ...i, cartKey } as CartItem;
  });
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem("impact-store-cart");
    if (!stored) return [];
    try {
      return migrateStoredItems(JSON.parse(stored));
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("impact-store-cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (item: Omit<CartItem, "quantity" | "cartKey">) => {
    const cartKey = item.variantId ? `${item._id}|${item.variantId}` : item._id;
    setItems((prev) => {
      const existing = prev.find((i) => i.cartKey === cartKey);
      if (existing) {
        return prev.map((i) =>
          i.cartKey === cartKey ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, cartKey, quantity: 1 }];
    });
  };

  const removeFromCart = (cartKey: string) => {
    setItems((prev) => prev.filter((i) => i.cartKey !== cartKey));
  };

  const updateQuantity = (cartKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartKey);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.cartKey === cartKey ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setItems([]);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, itemCount, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
