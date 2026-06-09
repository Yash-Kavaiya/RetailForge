import Link from "next/link";
import { fetchCategories, fetchProducts } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  let products: Product[] = [];
  let categories: string[] = [];
  let error = false;
  try {
    [products, categories] = await Promise.all([fetchProducts(category), fetchCategories()]);
  } catch {
    error = true;
  }

  return (
    <div>
      <section className="mb-8 rounded-2xl bg-gradient-to-br from-forge-700 to-forge-500 p-8 text-white">
        <h1 className="text-3xl font-bold tracking-tight">Gear up for the outdoors</h1>
        <p className="mt-2 max-w-xl text-forge-50/90">
          Browse the catalog, or open the <strong>RetailForge Concierge</strong> (bottom-right) to
          search by description, get recommendations, build a discounted kit, or check an order.
        </p>
      </section>

      {error ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          Couldn't reach the storefront API. Make sure it's running (<code>make read-api</code>) and
          that the database is seeded (<code>make seed</code>).
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap gap-2">
            <CategoryPill label="All" href="/" active={!category} />
            {categories.map((c) => (
              <CategoryPill
                key={c}
                label={c}
                href={`/?category=${encodeURIComponent(c)}`}
                active={category === c}
              />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.sku} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CategoryPill({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
        active
          ? "bg-forge-600 text-white"
          : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
      }`}
    >
      {label}
    </Link>
  );
}
