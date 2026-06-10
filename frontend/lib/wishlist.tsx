"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "./types";

export interface WishlistItem {
  sku: string;
  name: string;
  price: number;
  image_url?: string;
  brand?: string;
  category?: string;
}

interface WishlistState {
  items: WishlistItem[];
  count: number;
  has: (sku: string) => boolean;
  toggle: (product: Product | WishlistItem) => void;
  remove: (sku: string) => void;
  clear: () => void;
}

const WishlistContext = createContext<WishlistState | null>(null);
const STORAGE_KEY = "retailforge.wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const has = useCallback((sku: string) => items.some((i) => i.sku === sku), [items]);

  const toggle = useCallback((product: Product | WishlistItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.sku === product.sku)) {
        return prev.filter((i) => i.sku !== product.sku);
      }
      return [
        ...prev,
        {
          sku: product.sku,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          brand: product.brand,
          category: product.category,
        },
      ];
    });
  }, []);

  const remove = useCallback((sku: string) => {
    setItems((prev) => prev.filter((i) => i.sku !== sku));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<WishlistState>(
    () => ({ items, count: items.length, has, toggle, remove, clear }),
    [items, has, toggle, remove, clear],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistState {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}
