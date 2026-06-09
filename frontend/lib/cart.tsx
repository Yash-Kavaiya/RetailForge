"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Product } from "./types";

export interface CartLine {
  sku: string;
  name: string;
  price: number;
  qty: number;
  image_url?: string;
}

interface CartState {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (product: Pick<Product, "sku" | "name" | "price" | "image_url">, qty?: number) => void;
  remove: (sku: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  const add: CartState["add"] = useCallback((product, qty = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.sku === product.sku);
      if (existing) {
        return prev.map((l) => (l.sku === product.sku ? { ...l, qty: l.qty + qty } : l));
      }
      return [
        ...prev,
        {
          sku: product.sku,
          name: product.name,
          price: product.price,
          qty,
          image_url: product.image_url,
        },
      ];
    });
  }, []);

  const remove = useCallback((sku: string) => {
    setLines((prev) => prev.filter((l) => l.sku !== sku));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartState>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
    return { lines, count, subtotal, add, remove, clear };
  }, [lines, add, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
