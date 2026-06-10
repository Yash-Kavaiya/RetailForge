"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "FREE SHIPPING on orders $25+ — every day",
  "Extra 20% off with code FORGE20 — limited time",
  "Earn rewards on every order with RetailForge Star Pass",
  "Buy online, pick up in store in 1 hour",
];

export function TopBar() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % MESSAGES.length), 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="bg-ink text-white">
      <div className="container-store flex h-9 items-center justify-center text-center text-xs font-medium tracking-wide">
        <span className="animate-[fadeIn_.4s_ease]" key={i}>
          {MESSAGES[i]}
        </span>
      </div>
    </div>
  );
}
