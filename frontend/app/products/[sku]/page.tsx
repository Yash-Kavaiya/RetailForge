import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchProduct, formatPrice } from "@/lib/api";
import { AddToCartButton } from "@/components/AddToCartButton";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ sku: string }> }) {
  const { sku } = await params;

  let product: Product;
  try {
    product = await fetchProduct(sku);
  } catch {
    notFound();
  }

  const inv = product!.inventory;
  const inStock = (inv?.qty_on_hand ?? 0) > 0;

  return (
    <div>
      <Link href="/" className="text-sm text-forge-700 hover:underline">
        ← Back to shop
      </Link>
      <div className="mt-4 grid gap-8 md:grid-cols-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product!.image_url}
          alt={product!.name}
          className="aspect-square w-full rounded-2xl object-cover"
        />
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-forge-600">
            {product!.category} · {product!.brand}
          </span>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{product!.name}</h1>
          <p className="mt-3 text-slate-600">{product!.description}</p>
          <p className="mt-4 text-3xl font-bold text-slate-900">{formatPrice(product!.price)}</p>

          <p className="mt-2 text-sm">
            {inStock ? (
              <span className="font-medium text-emerald-600">
                In stock{inv?.aisle ? ` · aisle ${inv.aisle}` : ""} ({inv?.qty_on_hand} available)
              </span>
            ) : (
              <span className="font-medium text-rose-600">Out of stock</span>
            )}
          </p>

          <div className="mt-6">
            <AddToCartButton product={product!} />
          </div>

          {product!.tags && (
            <div className="mt-6 flex flex-wrap gap-2">
              {product!.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
