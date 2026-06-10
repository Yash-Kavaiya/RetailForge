"use client";

import { useState } from "react";
import { PriceBlock } from "@/components/PriceBlock";
import { RatingStars } from "@/components/RatingStars";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import type { Product } from "@/lib/types";

const SIZES = ["XS", "S", "M", "L", "XL"];

export function ProductBuyBox({ product }: { product: Product }) {
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const wished = has(product.sku);

  const baseColor = (product.attributes?.color as string) || "Classic";
  const colors = [baseColor, "Black", "Stone"];
  const [color, setColor] = useState(baseColor);
  const [size, setSize] = useState("M");
  const [qty, setQty] = useState(1);
  const [open, setOpen] = useState<string | null>("shipping");

  const inv = product.inventory;
  const inStock = (inv?.qty_on_hand ?? 0) > 0;

  return (
    <div>
      <span className="text-sm font-bold uppercase tracking-wider text-ink">{product.brand}</span>
      <h1 className="mt-1 font-display text-3xl font-bold leading-tight text-ink">{product.name}</h1>

      <a href="#reviews" className="mt-2 inline-flex items-center gap-2">
        <RatingStars rating={product.rating} count={product.review_count} size="md" />
        <span className="text-xs text-ink/50 underline">Read reviews</span>
      </a>

      <div className="mt-4">
        <PriceBlock sku={product.sku} price={product.price} size="lg" />
      </div>

      {/* Color */}
      <div className="mt-6">
        <p className="text-sm font-semibold text-ink">
          Color: <span className="font-normal text-ink/60">{color}</span>
        </p>
        <div className="mt-2 flex gap-2">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`rounded-full px-4 py-1.5 text-sm ring-1 transition ${
                color === c ? "bg-ink text-white ring-ink" : "ring-line hover:ring-ink/50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div className="mt-5">
        <p className="text-sm font-semibold text-ink">Size</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`h-10 w-12 rounded-md text-sm font-medium ring-1 transition ${
                size === s ? "bg-ink text-white ring-ink" : "ring-line hover:ring-ink/50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Quantity + actions */}
      <div className="mt-6 flex items-center gap-3">
        <div className="flex items-center rounded-full ring-1 ring-line">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2 text-lg">
            −
          </button>
          <span className="w-8 text-center text-sm font-semibold">{qty}</span>
          <button onClick={() => setQty((q) => q + 1)} className="px-3 py-2 text-lg">
            +
          </button>
        </div>
        <p className={`text-sm font-medium ${inStock ? "text-emerald-600" : "text-brand-600"}`}>
          {inStock ? `In stock${inv?.aisle ? ` · aisle ${inv.aisle}` : ""}` : "Out of stock"}
        </p>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          disabled={!inStock}
          onClick={() => add(product, qty)}
          className="flex-1 rounded-full bg-brand-500 py-3.5 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-brand-600 disabled:opacity-40"
        >
          Add to Bag
        </button>
        <button
          onClick={() => toggle(product)}
          aria-pressed={wished}
          className={`rounded-full border px-5 text-sm font-semibold transition ${
            wished ? "border-brand-500 bg-brand-50 text-brand-600" : "border-line text-ink hover:bg-surface-muted"
          }`}
        >
          {wished ? "♥ Saved" : "♡ Wishlist"}
        </button>
      </div>

      {/* Accordions */}
      <div className="mt-8 divide-y divide-line border-y border-line">
        {[
          { id: "shipping", title: "Shipping & Returns", body: "Free shipping on orders $25+. Free 90-day returns, in store or by mail." },
          { id: "details", title: "Product Details", body: product.description },
          { id: "care", title: "Materials & Care", body: "Quality-tested for the outdoors. Follow care label instructions." },
        ].map((a) => (
          <div key={a.id}>
            <button
              onClick={() => setOpen((o) => (o === a.id ? null : a.id))}
              className="flex w-full items-center justify-between py-3.5 text-sm font-semibold text-ink"
            >
              {a.title}
              <span className="text-lg">{open === a.id ? "−" : "+"}</span>
            </button>
            {open === a.id && <p className="pb-4 text-sm text-ink/60">{a.body}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
