import { fetchOrders, formatPrice } from "@/lib/api";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUS: Record<string, string> = {
  processing: "bg-amber-100 text-amber-700",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
  refunded: "bg-stone-200 text-stone-700",
};

export default async function OrdersPage() {
  let orders: Order[] = [];
  let error = false;
  try {
    orders = await fetchOrders("USER-1001");
  } catch {
    error = true;
  }

  return (
    <div className="container-store py-8">
      <h1 className="font-display text-3xl font-bold text-ink">My Orders</h1>
      <p className="mb-8 mt-1 text-sm text-ink/50">
        Demo shopper · USER-1001. Ask the concierge to check status or start a return.
      </p>

      {error ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          Couldn&apos;t reach the storefront API. Start it with <code>make read-api</code>.
        </div>
      ) : orders.length === 0 ? (
        <p className="text-ink/50">No orders yet.</p>
      ) : (
        <div className="space-y-5">
          {orders.map((o) => (
            <div key={o.order_id} className="overflow-hidden rounded-xl border border-line bg-white shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-muted px-5 py-3">
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-ink/40">Order</p>
                    <p className="font-mono font-semibold text-ink">{o.order_id}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-ink/40">Placed</p>
                    <p className="text-ink/80">{new Date(o.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-ink/40">Total</p>
                    <p className="font-semibold text-ink">{formatPrice(o.total)}</p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                    STATUS[o.status] ?? "bg-stone-100 text-stone-700"
                  }`}
                >
                  {o.status}
                </span>
              </div>
              <ul className="divide-y divide-line px-5">
                {o.items.map((it) => (
                  <li key={it.sku} className="flex items-center justify-between py-3 text-sm">
                    <span className="text-ink/80">
                      <span className="font-medium text-ink">{it.qty}×</span> {it.name}
                    </span>
                    <span className="font-medium">{formatPrice(it.price * it.qty)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
