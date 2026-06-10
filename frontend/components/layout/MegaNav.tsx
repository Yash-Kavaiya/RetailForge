"use client";

import Link from "next/link";

// Illustrative subcategories per department for the dropdown panels.
const SUBS: Record<string, string[]> = {
  Outerwear: ["Rain Jackets", "Down & Insulated", "Base Layers", "Fleece", "Vests"],
  Footwear: ["Hiking Boots", "Trail Runners", "Waterproof", "Socks", "Sandals"],
  Backpacks: ["Daypacks", "Backpacking Packs", "Hydration", "Travel", "Kids"],
  Accessories: ["Headlamps", "Water Filters", "Trekking Poles", "First Aid", "Navigation"],
  Electronics: ["Power Banks", "Solar Chargers", "GPS", "Cables", "Wearables"],
  Camping: ["Tents", "Sleeping Bags", "Sleeping Pads", "Stoves", "Cookware"],
};

function Dropdown({ dept }: { dept: string }) {
  const subs = SUBS[dept] ?? [];
  const href = `/?category=${encodeURIComponent(dept)}`;
  return (
    <div className="invisible absolute left-0 top-full z-40 w-[640px] -translate-y-1 rounded-b-xl border border-line bg-white p-6 opacity-0 shadow-pop transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 grid grid-cols-2 gap-x-6 gap-y-2">
          <Link href={href} className="text-sm font-bold text-ink hover:text-brand-600">
            Shop All {dept}
          </Link>
          <span />
          {subs.map((s) => (
            <Link key={s} href={href} className="text-sm text-ink/70 hover:text-brand-600">
              {s}
            </Link>
          ))}
        </div>
        <Link
          href={href}
          className="flex flex-col justify-end rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 p-4 text-white"
        >
          <span className="text-xs uppercase tracking-widest">Limited time</span>
          <span className="font-display text-xl font-bold leading-tight">
            Up to 40% off {dept}
          </span>
          <span className="mt-1 text-xs underline">Shop the event ›</span>
        </Link>
      </div>
    </div>
  );
}

export function MegaNav({ categories }: { categories: string[] }) {
  return (
    <nav className="hidden border-t border-line bg-white md:block">
      <ul className="container-store flex items-center gap-7">
        <li>
          <Link
            href="/"
            className="flex h-11 items-center text-sm font-bold uppercase tracking-wide text-brand-600"
          >
            Sale
          </Link>
        </li>
        {categories.map((c) => (
          <li key={c} className="group relative">
            <Link
              href={`/?category=${encodeURIComponent(c)}`}
              className="flex h-11 items-center text-sm font-semibold uppercase tracking-wide text-ink hover:text-brand-600"
            >
              {c}
            </Link>
            <Dropdown dept={c} />
          </li>
        ))}
        <li>
          <Link
            href="/"
            className="flex h-11 items-center text-sm font-semibold uppercase tracking-wide text-ink hover:text-brand-600"
          >
            New Arrivals
          </Link>
        </li>
      </ul>
    </nav>
  );
}
