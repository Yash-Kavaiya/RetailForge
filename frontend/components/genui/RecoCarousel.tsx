"use client";

import { formatPrice } from "@/lib/api";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/types";

export function RecoCarousel({ products, strategy }: { products: Product[]; strategy?: string }) {
  const { add } = useCart();
  if (!products?.length) {
    return (
      <div className="my-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
        No recommendations available yet.
      </div>
    );
  }
  const label = strategy === "also_bought" ? "Frequently bought together" : "Trending now";
  return (
    <div className="my-2">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-forge-600">{label}</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {products.map((p) => (
          <div
            key={p.sku}
            className="flex w-36 shrink-0 flex-col rounded-xl border border-slate-200 bg-white p-2 shadow-sm"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.image_url}
              alt={p.name}
              className="h-20 w-full rounded-lg object-cover"
              loading="lazy"
            />
            <span className="mt-1 line-clamp-2 text-xs font-semibold text-slate-900">{p.name}</span>
            <div className="mt-auto flex items-center justify-between pt-1">
              <span className="text-xs font-bold">{formatPrice(p.price)}</span>
              <button
                onClick={() => add(p)}
                className="rounded-md bg-forge-600 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-forge-700"
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
