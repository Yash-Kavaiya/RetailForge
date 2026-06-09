"use client";

import { formatPrice } from "@/lib/api";
import type { Order } from "@/lib/types";

export function OrderConfirmation({ order }: { order?: Order }) {
  if (!order) {
    return (
      <div className="my-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
        The order couldn't be created.
      </div>
    );
  }
  return (
    <div className="my-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 shadow-sm">
      <p className="font-semibold text-emerald-800">🎉 Order placed!</p>
      <p className="mt-1 text-sm text-emerald-700">
        Confirmation <span className="font-mono font-semibold">{order.order_id}</span>
      </p>
      <ul className="mt-2 space-y-1 text-sm text-emerald-900">
        {order.items?.map((it) => (
          <li key={it.sku} className="flex justify-between">
            <span className="truncate">
              {it.qty}× {it.name}
            </span>
            <span>{formatPrice(it.price * it.qty)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-2 space-y-1 border-t border-emerald-200 pt-2 text-sm">
        {(order.discount ?? 0) > 0 && (
          <div className="flex justify-between text-forge-700">
            <span>Discount{order.discount_code ? ` (${order.discount_code})` : ""}</span>
            <span>−{formatPrice(order.discount)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-emerald-900">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
