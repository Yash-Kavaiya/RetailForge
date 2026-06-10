"use client";

import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/api";
import type { Product } from "@/lib/types";

export function RecoCarousel({ products, strategy }: { products: Product[]; strategy?: string }) {
  const { add } = useCart();
  if (!products?.length) {
    return (
      <div className="my-2 rounded-lg bg-surface-muted p-3 text-sm text-ink/50">
        No recommendations available yet.
      </div>
    );
  }
  const label = strategy === "also_bought" ? "Frequently bought together" : "Trending now";
  return (
    <div className="my-2">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-600">{label}</p>
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {products.map((p) => (
          <div key={p.sku} className="flex w-36 shrink-0 flex-col rounded-xl border border-line bg-white p-2 shadow-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.image_url} alt={p.name} className="h-20 w-full rounded-lg object-cover" loading="lazy" />
            <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-ink">{p.brand}</span>
            <span className="line-clamp-2 text-xs text-ink/80">{p.name}</span>
            <div className="mt-auto flex items-center justify-between pt-1">
              <span className="text-xs font-semibold text-brand-600">{formatPrice(p.price)}</span>
              <button
                onClick={() => add(p)}
                className="rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-brand-600"
              >
                Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
