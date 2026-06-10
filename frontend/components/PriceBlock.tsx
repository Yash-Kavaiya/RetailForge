import { formatPrice } from "@/lib/api";
import { originalPrice, percentOff } from "@/lib/pricing";

interface Props {
  sku: string;
  price: number;
  size?: "sm" | "md" | "lg";
}

/**
 * Department-store price treatment: a bold red sale price, a struck-through
 * "Orig." price, and a percent-off callout (synthesized deterministically).
 */
export function PriceBlock({ sku, price, size = "sm" }: Props) {
  const orig = originalPrice(sku, price);
  const off = percentOff(sku);
  const sale =
    size === "lg" ? "text-2xl" : size === "md" ? "text-lg" : "text-base";

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span className={`font-semibold text-brand-600 ${sale}`}>{formatPrice(price)}</span>
      <span className="text-xs text-ink/40 line-through">{formatPrice(orig)}</span>
      <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">
        ({off}% off)
      </span>
    </div>
  );
}
