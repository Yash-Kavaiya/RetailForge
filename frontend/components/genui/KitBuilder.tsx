"use client";

import { formatPrice } from "@/lib/api";
import { useCart } from "@/lib/cart";

interface KitItem {
  sku: string;
  name: string;
  category?: string;
  price: number;
  image_url?: string;
  in_stock?: boolean;
}

interface Kit {
  activity?: string;
  items?: KitItem[];
  subtotal?: number;
  discount?: number;
  total?: number;
  promotion?: { code: string; description: string } | null;
}

export function KitBuilder({ kit }: { kit?: Kit }) {
  const { add } = useCart();
  if (!kit?.items?.length) {
    return (
      <div className="my-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
        Couldn't assemble a kit.
      </div>
    );
  }
  return (
    <div className="my-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <p className="mb-2 text-sm font-semibold text-slate-900">
        🎒 Kit for {kit.activity || "your trip"}
      </p>
      <ul className="space-y-2">
        {kit.items.map((it) => (
          <li key={it.sku} className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={it.image_url}
              alt={it.name}
              className="h-10 w-10 rounded-md object-cover"
              loading="lazy"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">{it.name}</p>
              <p className="text-xs text-slate-400">
                {it.category}
                {it.in_stock === false && <span className="text-rose-500"> · out of stock</span>}
              </p>
            </div>
            <span className="text-sm font-semibold">{formatPrice(it.price)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 space-y-1 border-t border-slate-100 pt-2 text-sm">
        <div className="flex justify-between text-slate-500">
          <span>Subtotal</span>
          <span>{formatPrice(kit.subtotal)}</span>
        </div>
        {kit.promotion && (kit.discount ?? 0) > 0 && (
          <div className="flex justify-between text-forge-700">
            <span>{kit.promotion.code} discount</span>
            <span>−{formatPrice(kit.discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-bold text-slate-900">
          <span>Total</span>
          <span>{formatPrice(kit.total)}</span>
        </div>
      </div>
      <button
        onClick={() => kit.items?.forEach((it) => add(it))}
        className="mt-3 w-full rounded-lg bg-forge-600 py-2 text-sm font-semibold text-white hover:bg-forge-700"
      >
        Add kit to cart
      </button>
    </div>
  );
}
