"use client";

import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/types";

export function AddToCartButton({ product }: { product: Product }) {
  const { add } = useCart();
  return (
    <button
      onClick={() => add(product)}
      className="rounded-lg bg-forge-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-forge-700"
    >
      Add to cart
    </button>
  );
}
