"use client";

import { formatPrice } from "@/lib/api";

interface Discount {
  valid?: boolean;
  reason?: string;
  code?: string;
  discount?: number;
  total?: number;
  promotion?: { code: string; description: string } | null;
}

export function DiscountCard({ discount }: { discount?: Discount }) {
  if (!discount) return null;
  if (!discount.valid) {
    return (
      <div className="my-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
        <span className="font-semibold">{discount.code}</span> can't be applied
        {discount.reason ? `: ${discount.reason}` : "."}
      </div>
    );
  }
  return (
    <div className="my-2 rounded-xl border border-forge-100 bg-forge-50 p-3 shadow-sm">
      <p className="text-sm font-semibold text-forge-700">
        🏷️ {discount.code} applied
      </p>
      {discount.promotion?.description && (
        <p className="mt-0.5 text-xs text-forge-700/80">{discount.promotion.description}</p>
      )}
      <div className="mt-2 flex justify-between text-sm">
        <span className="text-slate-600">You save</span>
        <span className="font-semibold text-forge-700">−{formatPrice(discount.discount)}</span>
      </div>
      <div className="flex justify-between text-base font-bold text-slate-900">
        <span>New total</span>
        <span>{formatPrice(discount.total)}</span>
      </div>
    </div>
  );
}
