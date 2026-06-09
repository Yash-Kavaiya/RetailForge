"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

export function Navbar() {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-forge-600 font-bold text-white">
            RF
          </span>
          <span className="text-lg font-semibold tracking-tight">
            RetailForge<span className="text-forge-600">.</span>
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-forge-700">
            Shop
          </Link>
          <Link href="/orders" className="hover:text-forge-700">
            Orders
          </Link>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
            Cart · {count}
          </span>
        </nav>
      </div>
    </header>
  );
}
