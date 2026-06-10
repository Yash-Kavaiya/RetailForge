"use client";

import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { useWishlist } from "@/lib/wishlist";
import type { Product } from "@/lib/types";

export default function WishlistPage() {
  const { items, count, clear } = useWishlist();

  return (
    <div className="container-store py-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">My Wishlist</h1>
          <p className="mt-1 text-sm text-ink/50">{count} saved item{count === 1 ? "" : "s"}</p>
        </div>
        {count > 0 && (
          <button onClick={clear} className="text-sm font-medium text-ink/50 hover:text-brand-600">
            Clear all
          </button>
        )}
      </div>

      {count === 0 ? (
        <div className="rounded-xl border border-line bg-surface-muted py-16 text-center">
          <p className="text-ink/60">Your wishlist is empty.</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((it) => (
            <ProductCard key={it.sku} product={it as unknown as Product} />
          ))}
        </div>
      )}
    </div>
  );
}
