import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchProduct, fetchProducts, fetchReviews } from "@/lib/api";
import { RatingStars } from "@/components/RatingStars";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductBuyBox } from "@/components/product/ProductBuyBox";
import { ProductRail } from "@/components/home/ProductRail";
import type { Product, Review } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ sku: string }> }) {
  const { sku } = await params;

  let product: Product;
  try {
    product = await fetchProduct(sku);
  } catch {
    notFound();
  }

  let reviews: Review[] = [];
  let related: Product[] = [];
  try {
    [{ reviews }, related] = await Promise.all([
      fetchReviews(sku),
      fetchProducts(product!.category),
    ]);
  } catch {
    /* non-fatal */
  }
  related = related.filter((p) => p.sku !== sku).slice(0, 8);

  return (
    <div className="container-store py-6">
      <nav className="mb-5 text-xs text-ink/50">
        <Link href="/" className="hover:text-brand-600">
          Home
        </Link>{" "}
        /{" "}
        <Link href={`/?category=${encodeURIComponent(product!.category)}`} className="hover:text-brand-600">
          {product!.category}
        </Link>{" "}
        / <span className="text-ink/70">{product!.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery image={product!.image_url} alt={product!.name} />
        <ProductBuyBox product={product!} />
      </div>

      {product!.tags && product!.tags.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-ink">Why you&apos;ll love it</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {product!.tags.map((t) => (
              <span key={t} className="rounded-full bg-surface-muted px-3 py-1 text-xs text-ink/70">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      <section id="reviews" className="mt-12 border-t border-line pt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-ink">Customer Reviews</h2>
          <RatingStars rating={product!.rating} count={product!.review_count} size="md" />
        </div>
        {reviews.length === 0 ? (
          <p className="mt-4 text-sm text-ink/50">No reviews yet. Be the first to review this item.</p>
        ) : (
          <ul className="mt-6 space-y-5">
            {reviews.map((r, i) => (
              <li key={i} className="border-b border-line pb-5">
                <RatingStars rating={r.rating} showCount={false} />
                <p className="mt-2 text-sm text-ink/80">“{r.text}”</p>
                <p className="mt-1 text-xs text-ink/40">Verified buyer · {r.user_id}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {related.length > 0 && (
        <div className="mt-14">
          <ProductRail title="You may also like" products={related} />
        </div>
      )}
    </div>
  );
}
