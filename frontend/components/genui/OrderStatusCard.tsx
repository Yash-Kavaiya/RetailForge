"use client";

import { formatPrice } from "@/lib/api";
import type { Order } from "@/lib/types";

const STATUS_STYLES: Record<string, string> = {
  processing: "bg-amber-100 text-amber-700",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
  refunded: "bg-slate-200 text-slate-700",
};

export function OrderStatusCard({ order, notFound }: { order?: Order; notFound?: boolean }) {
  if (notFound || !order) {
    return (
      <div className="my-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
        We couldn't find that order.
      </div>
    );
  }
  const badge = STATUS_STYLES[order.status] ?? "bg-slate-100 text-slate-700";
  return (
    <div className="my-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm font-semibold">{order.order_id}</span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${badge}`}>
          {order.status}
        </span>
      </div>
      <ul className="mt-2 space-y-1 text-sm text-slate-600">
        {order.items?.map((it) => (
          <li key={it.sku} className="flex justify-between">
            <span className="truncate">
              {it.qty}× {it.name}
            </span>
            <span>{formatPrice(it.price * it.qty)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex justify-between border-t border-slate-100 pt-2 text-sm font-semibold">
        <span>Total</span>
        <span>{formatPrice(order.total)}</span>
      </div>
    </div>
  );
}
