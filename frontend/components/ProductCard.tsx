"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { isBonusBuy } from "@/lib/pricing";
import type { Product } from "@/lib/types";
import { Badge } from "./Badge";
import { PriceBlock } from "./PriceBlock";
import { RatingStars } from "./RatingStars";
import { WishlistButton } from "./WishlistButton";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const bonus = isBonusBuy(product.sku);

  return (
    <div className="group relative flex flex-col">
      <div className="relative overflow-hidden rounded-lg bg-surface-muted">
        <Link href={`/products/${product.sku}`} className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image_url}
            alt={product.name}
            className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        <div className="absolute left-2 top-2">
          {bonus ? <Badge tone="bonus">Bonus Buy</Badge> : <Badge tone="sale">Sale</Badge>}
        </div>

        <div className="absolute right-2 top-2">
          <WishlistButton product={product} size={16} />
        </div>

        {/* Hover quick-add */}
        <div className="absolute inset-x-2 bottom-2 translate-y-3 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
          <button
            onClick={() => add(product)}
            className="w-full rounded-full bg-ink py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-brand-600"
          >
            Add to Bag
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-1 flex-col">
        <span className="text-[11px] font-bold uppercase tracking-wider text-ink">
          {product.brand}
        </span>
        <Link href={`/products/${product.sku}`}>
          <h3 className="mt-0.5 line-clamp-2 text-sm text-ink/80 hover:text-brand-600">
            {product.name}
          </h3>
        </Link>
        <div className="mt-1">
          <RatingStars rating={product.rating} count={product.review_count} />
        </div>
        <div className="mt-1.5">
          <PriceBlock sku={product.sku} price={product.price} />
        </div>
      </div>
    </div>
  );
}
