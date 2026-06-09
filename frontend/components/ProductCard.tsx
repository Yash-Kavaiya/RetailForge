"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/api";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <Link href={`/products/${product.sku}`} className="block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image_url}
          alt={product.name}
          className="h-44 w-full object-cover"
          loading="lazy"
        />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-forge-600">
          {product.category}
        </span>
        <Link href={`/products/${product.sku}`}>
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900 hover:text-forge-700">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 line-clamp-2 text-xs text-slate-500">{product.description}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-base font-bold text-slate-900">{formatPrice(product.price)}</span>
          <button
            onClick={() => add(product)}
            className="rounded-lg bg-forge-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-forge-700"
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
