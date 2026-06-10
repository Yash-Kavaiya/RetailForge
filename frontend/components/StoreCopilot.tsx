"use client";

import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useCart } from "@/lib/cart";
import { ProductGrid } from "./genui/ProductGrid";
import { RecoCarousel } from "./genui/RecoCarousel";
import { OrderStatusCard } from "./genui/OrderStatusCard";
import { RefundCard } from "./genui/RefundCard";
import { KitBuilder } from "./genui/KitBuilder";
import { OrderConfirmation } from "./genui/OrderConfirmation";
import { DiscountCard } from "./genui/DiscountCard";

// Tool results arrive as either a parsed object or a JSON string depending on
// the transport; normalize to an object.
function parse<T = any>(result: unknown): T | undefined {
  if (result == null) return undefined;
  if (typeof result === "string") {
    try {
      return JSON.parse(result) as T;
    } catch {
      return undefined;
    }
  }
  return result as T;
}

function Working({ label }: { label: string }) {
  return (
    <div className="my-2 flex items-center gap-2 rounded-lg bg-surface-muted px-3 py-2 text-sm text-ink/60">
      <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" />
      {label}
    </div>
  );
}

/**
 * Registers generative-UI renderers for every agent tool that produces something
 * worth showing, plus the chat sidebar. The agents EXECUTE these tools on the
 * backend (over AG-UI); here we only render their results as rich cards.
 */
export function StoreCopilot() {
  const { lines, subtotal } = useCart();

  // Share the cart with the agents so "check out my cart" works.
  useCopilotReadable({
    description: "The shopper's current shopping cart and the demo user id",
    value: { user_id: "USER-1001", subtotal, items: lines },
  });

  useCopilotAction({
    name: "search_products",
    available: "disabled",
    render: ({ status, result }) => {
      if (status !== "complete") return <Working label="Searching the catalog…" />;
      const data = parse(result);
      return <ProductGrid products={data?.products ?? []} query={data?.query} />;
    },
  });

  useCopilotAction({
    name: "recommend_products",
    available: "disabled",
    render: ({ status, result }) => {
      if (status !== "complete") return <Working label="Finding recommendations…" />;
      const data = parse(result);
      return <RecoCarousel products={data?.products ?? []} strategy={data?.strategy} />;
    },
  });

  useCopilotAction({
    name: "get_order_status",
    available: "disabled",
    render: ({ status, result }) => {
      if (status !== "complete") return <Working label="Looking up your order…" />;
      const data = parse(result);
      return <OrderStatusCard order={data?.order} notFound={data?.status === "not_found"} />;
    },
  });

  useCopilotAction({
    name: "process_refund",
    available: "disabled",
    render: ({ status, result }) => {
      if (status !== "complete") return <Working label="Processing the refund…" />;
      return <RefundCard refund={parse(result)} />;
    },
  });

  useCopilotAction({
    name: "build_kit",
    available: "disabled",
    render: ({ status, result }) => {
      if (status !== "complete") return <Working label="Building your kit…" />;
      return <KitBuilder kit={parse(result)} />;
    },
  });

  useCopilotAction({
    name: "create_order",
    available: "disabled",
    render: ({ status, result }) => {
      if (status !== "complete") return <Working label="Placing your order…" />;
      const data = parse(result);
      return <OrderConfirmation order={data?.order} />;
    },
  });

  useCopilotAction({
    name: "apply_discount",
    available: "disabled",
    render: ({ status, result }) => {
      if (status !== "complete") return <Working label="Checking the promo code…" />;
      return <DiscountCard discount={parse(result)} />;
    },
  });

  return (
    <CopilotSidebar
      defaultOpen={false}
      clickOutsideToClose={false}
      labels={{
        title: "Personal Shopper",
        initial:
          "Hi, I'm your RetailForge Personal Shopper. I can help you find styles, suggest pairings, check orders, start returns, and build discounted bundles. Try: \"Find a waterproof jacket under $100\" or \"Build me a weekend kit with a discount.\"",
      }}
    />
  );
}
