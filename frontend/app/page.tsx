import Link from "next/link";
import { fetchCategories, fetchProducts } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { CategoryTiles } from "@/components/home/CategoryTiles";
import { DealStrip } from "@/components/home/DealStrip";
import { ProductRail } from "@/components/home/ProductRail";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;

  let products: Product[] = [];
  let categories: string[] = [];
  let error = false;
  try {
    [products, categories] = await Promise.all([
      fetchProducts(category, q),
      fetchCategories(),
    ]);
  } catch {
    error = true;
  }

  if (error) {
    return (
      <div className="container-store py-10">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          Couldn&apos;t reach the storefront API. Start it with <code>make read-api</code> and seed
          with <code>make seed</code>.
        </div>
      </div>
    );
  }

  // Filtered browse view (category click or search).
  if (category || q) {
    return (
      <div className="container-store py-8">
        <BrowseHeader category={category} q={q} count={products.length} />
        <CategoryPills active={category} categories={categories} />
        {products.length === 0 ? (
          <p className="py-16 text-center text-ink/50">No matching products.</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.sku} product={p} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Merchandised home view.
  const byCategory = new Map<string, Product[]>();
  for (const p of products) {
    if (!byCategory.has(p.category)) byCategory.set(p.category, []);
    byCategory.get(p.category)!.push(p);
  }
  const topRated = [...products]
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 10);

  return (
    <div className="container-store space-y-14 py-8">
      <HeroCarousel />
      <CategoryTiles categories={categories} />
      <DealStrip />
      <ProductRail title="Top Rated" products={topRated} viewAllHref="/" />
      {[...byCategory.entries()].map(([cat, items]) => (
        <ProductRail
          key={cat}
          title={cat}
          products={items}
          viewAllHref={`/?category=${encodeURIComponent(cat)}`}
        />
      ))}
    </div>
  );
}

function BrowseHeader({ category, q, count }: { category?: string; q?: string; count: number }) {
  return (
    <div className="mb-5">
      <nav className="text-xs text-ink/50">
        <Link href="/" className="hover:text-brand-600">
          Home
        </Link>{" "}
        / <span className="text-ink/70">{q ? "Search" : category}</span>
      </nav>
      <h1 className="mt-1 font-display text-3xl font-bold text-ink">
        {q ? `Results for “${q}”` : category}
      </h1>
      <p className="mt-1 text-sm text-ink/50">{count} items</p>
    </div>
  );
}

function CategoryPills({ active, categories }: { active?: string; categories: string[] }) {
  return (
    <div className="mb-8 flex flex-wrap gap-2">
      <Pill label="All" href="/" active={!active} />
      {categories.map((c) => (
        <Pill key={c} label={c} href={`/?category=${encodeURIComponent(c)}`} active={active === c} />
      ))}
    </div>
  );
}

function Pill({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
        active ? "bg-ink text-white" : "bg-white text-ink/70 ring-1 ring-line hover:bg-surface-muted"
      }`}
    >
      {label}
    </Link>
  );
}
