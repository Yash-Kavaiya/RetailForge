"use client";

import Link from "next/link";

const COLUMNS: { title: string; links: string[] }[] = [
  { title: "Customer Service", links: ["Help & FAQs", "Track an Order", "Shipping & Delivery", "Returns & Exchanges", "Contact Us"] },
  { title: "About RetailForge", links: ["Our Story", "Careers", "Sustainability", "Press", "Store Locations"] },
  { title: "Services", links: ["Buy Online, Pick Up In Store", "Personal Shopper", "Gift Cards", "Star Rewards", "Registry"] },
];

export function Footer({ categories }: { categories: string[] }) {
  return (
    <footer className="mt-16 border-t border-line bg-surface-muted">
      {/* Newsletter */}
      <div className="border-b border-line">
        <div className="container-store flex flex-col items-center gap-4 py-8 text-center">
          <h3 className="font-display text-2xl font-bold text-ink">Get 20% off your next order</h3>
          <p className="text-sm text-ink/60">
            Sign up for emails and be the first to know about sales, new arrivals & more.
          </p>
          <form className="flex w-full max-w-md items-center gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-full border border-line bg-white px-5 py-2.5 text-sm outline-none focus:border-ink"
            />
            <button className="rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">
              Sign Up
            </button>
          </form>
        </div>
      </div>

      {/* Link columns */}
      <div className="container-store grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink">Shop</h4>
          <ul className="space-y-2">
            {categories.map((c) => (
              <li key={c}>
                <Link
                  href={`/?category=${encodeURIComponent(c)}`}
                  className="text-sm text-ink/60 hover:text-brand-600"
                >
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l}>
                  <span className="cursor-pointer text-sm text-ink/60 hover:text-brand-600">{l}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Legal */}
      <div className="border-t border-line">
        <div className="container-store flex flex-col items-center justify-between gap-3 py-5 text-xs text-ink/50 sm:flex-row">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" className="text-brand-500">
              <path fill="currentColor" d="M12 1.6l2.95 5.98 6.6.96-4.77 4.65 1.13 6.57L12 17.6l-5.9 3.16 1.13-6.57L2.46 9.54l6.6-.96z" />
            </svg>
            <span>© {new Date().getFullYear()} RetailForge. A multi-agent retail intelligence demo.</span>
          </div>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-ink">Privacy</span>
            <span className="cursor-pointer hover:text-ink">Terms</span>
            <span className="cursor-pointer hover:text-ink">Accessibility</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
