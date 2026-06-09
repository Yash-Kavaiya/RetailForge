"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { CartProvider } from "@/lib/cart";
import { StoreCopilot } from "./StoreCopilot";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <CopilotKit runtimeUrl="/api/copilotkit" agent="retailforge">
        {children}
        <StoreCopilot />
      </CopilotKit>
    </CartProvider>
  );
}
