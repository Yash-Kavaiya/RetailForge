"use client";

import { formatPrice } from "@/lib/api";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/types";

export function ProductGrid({ products, query }: { products: Product[]; query?: string }) {
  const { add } = useCart();
  if (!products?.length) {
    return (
      <div className="my-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
        No matching products{query ? ` for "${query}"` : ""}.
      </div>
    );
  }
  return (
    <div className="my-2 space-y-2">
      {query && (
        <p className="text-xs font-medium text-slate-500">Results for "{query}"</p>
      )}
      {products.map((p) => (
        <div
          key={p.sku}
          className="flex gap-3 rounded-xl border border-slate-200 bg-white p-2 shadow-sm"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.image_url}
            alt={p.name}
            className="h-16 w-16 shrink-0 rounded-lg object-cover"
            loading="lazy"
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-semibold text-slate-900">{p.name}</span>
            <span className="text-xs text-slate-500">{p.category}</span>
            <div className="mt-auto flex items-center justify-between pt-1">
              <span className="text-sm font-bold">{formatPrice(p.price)}</span>
              <button
                onClick={() => add(p)}
                className="rounded-md bg-forge-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-forge-700"
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
