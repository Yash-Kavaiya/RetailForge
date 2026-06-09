import { fetchOrders } from "@/lib/api";
import { OrderStatusCard } from "@/components/genui/OrderStatusCard";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  let orders: Order[] = [];
  let error = false;
  try {
    orders = await fetchOrders("USER-1001");
  } catch {
    error = true;
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Your orders</h1>
      <p className="mb-6 text-sm text-slate-500">
        Demo shopper · USER-1001. Ask the concierge to check status or process a refund.
      </p>

      {error ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          Couldn't reach the storefront API. Start it with <code>make read-api</code>.
        </div>
      ) : orders.length === 0 ? (
        <p className="text-slate-500">No orders yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {orders.map((o) => (
            <OrderStatusCard key={o.order_id} order={o} />
          ))}
        </div>
      )}
    </div>
  );
}
