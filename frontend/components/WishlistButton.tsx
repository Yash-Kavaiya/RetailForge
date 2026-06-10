"use client";

import { useWishlist } from "@/lib/wishlist";
import type { Product } from "@/lib/types";

export function WishlistButton({
  product,
  className = "",
  size = 18,
}: {
  product: Product;
  className?: string;
  size?: number;
}) {
  const { has, toggle } = useWishlist();
  const active = has(product.sku);
  return (
    <button
      type="button"
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(product);
      }}
      className={`grid place-items-center rounded-full bg-white/90 shadow-sm ring-1 ring-line transition hover:scale-105 ${className}`}
      style={{ width: size + 16, height: size + 16 }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={active ? "#e11b30" : "none"}
        stroke={active ? "#e11b30" : "#444"}
        strokeWidth="2"
      >
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
      </svg>
    </button>
  );
}
