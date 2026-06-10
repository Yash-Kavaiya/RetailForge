import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/types";

export function ProductRail({
  title,
  products,
  viewAllHref,
}: {
  title: string;
  products: Product[];
  viewAllHref?: string;
}) {
  if (!products.length) return null;
  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-2xl font-bold text-ink">{title}</h2>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-sm font-semibold text-brand-600 hover:underline">
            Shop all ›
          </Link>
        )}
      </div>
      <div className="no-scrollbar -mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
        {products.map((p) => (
          <div key={p.sku} className="w-44 shrink-0 sm:w-52">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
