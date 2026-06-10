"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { AccountMenu } from "./AccountMenu";
import { MegaNav } from "./MegaNav";

function StarLogo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <svg width="34" height="34" viewBox="0 0 24 24" className="text-brand-500">
        <path
          fill="currentColor"
          d="M12 1.6l2.95 5.98 6.6.96-4.77 4.65 1.13 6.57L12 17.6l-5.9 3.16 1.13-6.57L2.46 9.54l6.6-.96z"
        />
      </svg>
      <span className="font-display text-2xl font-bold tracking-tight text-ink">
        RetailForge
      </span>
    </Link>
  );
}

function IconButton({
  href,
  label,
  count,
  children,
}: {
  href: string;
  label: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="relative flex items-center gap-1.5 text-ink hover:text-brand-600"
    >
      {children}
      {count !== undefined && count > 0 && (
        <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}

export function Header({ categories }: { categories: string[] }) {
  const router = useRouter();
  const { count: bag } = useCart();
  const { count: wish } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);

  function onSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q")?.toString().trim();
    router.push(q ? `/?q=${encodeURIComponent(q)}` : "/");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white">
      <div className="container-store flex h-16 items-center gap-4">
        <button
          className="md:hidden"
          aria-label="Menu"
          onClick={() => setMobileOpen((o) => !o)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>

        <StarLogo />

        <form onSubmit={onSearch} className="ml-2 hidden flex-1 md:block">
          <div className="flex items-center rounded-full bg-surface-muted ring-1 ring-line focus-within:ring-2 focus-within:ring-ink">
            <input
              name="q"
              placeholder="Search for products, brands & more"
              className="w-full bg-transparent px-5 py-2.5 text-sm outline-none placeholder:text-ink/40"
            />
            <button type="submit" className="px-4 text-ink/60 hover:text-brand-600" aria-label="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4-4" />
              </svg>
            </button>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-5">
          <AccountMenu />
          <IconButton href="/wishlist" label="Wishlist" count={wish}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
            </svg>
          </IconButton>
          <IconButton href="/cart" label="Bag" count={bag}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 7h12l-1 13H7L6 7z" />
              <path d="M9 7a3 3 0 0 1 6 0" />
            </svg>
          </IconButton>
        </div>
      </div>

      {/* Mobile search */}
      <form onSubmit={onSearch} className="container-store pb-3 md:hidden">
        <div className="flex items-center rounded-full bg-surface-muted ring-1 ring-line">
          <input
            name="q"
            placeholder="Search"
            className="w-full bg-transparent px-4 py-2 text-sm outline-none"
          />
          <button type="submit" className="px-3 text-ink/60" aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4-4" />
            </svg>
          </button>
        </div>
      </form>

      <MegaNav categories={categories} />

      {/* Mobile department drawer */}
      {mobileOpen && (
        <div className="border-t border-line bg-white md:hidden">
          <nav className="container-store flex flex-col py-2">
            <Link href="/" className="py-2 text-sm font-semibold text-brand-600" onClick={() => setMobileOpen(false)}>
              Sale
            </Link>
            {categories.map((c) => (
              <Link
                key={c}
                href={`/?category=${encodeURIComponent(c)}`}
                className="py-2 text-sm text-ink/80"
                onClick={() => setMobileOpen(false)}
              >
                {c}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
