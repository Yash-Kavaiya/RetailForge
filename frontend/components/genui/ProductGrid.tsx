"use client";

import { useCart } from "@/lib/cart";
import { PriceBlock } from "@/components/PriceBlock";
import type { Product } from "@/lib/types";

export function ProductGrid({ products, query }: { products: Product[]; query?: string }) {
  const { add } = useCart();
  if (!products?.length) {
    return (
      <div className="my-2 rounded-lg bg-surface-muted p-3 text-sm text-ink/50">
        No matching products{query ? ` for "${query}"` : ""}.
      </div>
    );
  }
  return (
    <div className="my-2 space-y-2">
      {query && <p className="text-xs font-medium text-ink/50">Results for &ldquo;{query}&rdquo;</p>}
      {products.map((p) => (
        <div key={p.sku} className="flex gap-3 rounded-xl border border-line bg-white p-2 shadow-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.image_url}
            alt={p.name}
            className="h-16 w-16 shrink-0 rounded-lg object-cover"
            loading="lazy"
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink">{p.brand}</span>
            <span className="truncate text-sm font-medium text-ink/80">{p.name}</span>
            <div className="mt-auto flex items-center justify-between pt-1">
              <PriceBlock sku={p.sku} price={p.price} />
              <button
                onClick={() => add(p)}
                className="rounded-full bg-brand-500 px-3 py-1 text-[11px] font-semibold text-white hover:bg-brand-600"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
