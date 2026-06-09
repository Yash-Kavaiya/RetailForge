"use client";

import { formatPrice } from "@/lib/api";

interface Refund {
  status?: string;
  order_id?: string;
  amount?: number;
  reason?: string;
}

export function RefundCard({ refund }: { refund?: Refund }) {
  if (!refund || refund.status === "not_found") {
    return (
      <div className="my-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
        Couldn't process that refund — order not found.
      </div>
    );
  }
  return (
    <div className="my-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-600 text-xs text-white">
          ✓
        </span>
        <span className="font-semibold text-emerald-800">Refund processed</span>
      </div>
      <div className="mt-2 space-y-1 text-sm text-emerald-900">
        <div className="flex justify-between">
          <span>Order</span>
          <span className="font-mono">{refund.order_id}</span>
        </div>
        <div className="flex justify-between">
          <span>Amount</span>
          <span className="font-semibold">{formatPrice(refund.amount)}</span>
        </div>
        {refund.reason && (
          <div className="flex justify-between gap-4">
            <span>Reason</span>
            <span className="truncate text-right text-emerald-700">{refund.reason}</span>
          </div>
        )}
      </div>
    </div>
  );
}
