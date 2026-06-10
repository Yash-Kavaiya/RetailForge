"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function AccountMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-sm text-ink hover:text-brand-600"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="8" r="3.2" />
          <path d="M5 20c1.5-3.6 4-5 7-5s5.5 1.4 7 5" />
        </svg>
        <span className="hidden sm:inline">Sign In</span>
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-60 rounded-lg border border-line bg-white p-4 shadow-pop">
          <p className="text-sm font-semibold text-ink">Welcome back</p>
          <p className="mt-0.5 text-xs text-ink/50">Demo shopper · USER-1001</p>
          <button className="mt-3 w-full rounded-full bg-brand-500 py-2 text-sm font-semibold text-white hover:bg-brand-600">
            Sign In
          </button>
          <button className="mt-2 w-full rounded-full border border-line py-2 text-sm font-medium text-ink hover:bg-surface-muted">
            Create Account
          </button>
          <div className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
            <Link href="/orders" className="block py-1 text-ink/70 hover:text-brand-600">
              My Orders
            </Link>
            <Link href="/wishlist" className="block py-1 text-ink/70 hover:text-brand-600">
              My Wishlist
            </Link>
            <span className="block py-1 text-ink/70">Star Rewards</span>
          </div>
        </div>
      )}
    </div>
  );
}
