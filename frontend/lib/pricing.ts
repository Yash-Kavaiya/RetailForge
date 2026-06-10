// Cosmetic "department-store" sale framing: a stable, deterministic "original"
// price per SKU so cards can show `Sale $X  Orig. $Y  (-N%)`. Purely visual —
// the real catalog price is always the selling price.

function hash(sku: string): number {
  let h = 0;
  for (let i = 0; i < sku.length; i++) {
    h = (h * 31 + sku.charCodeAt(i)) % 100000;
  }
  return h;
}

/** A stable discount fraction in [0.15, 0.40] derived from the SKU. */
export function discountFraction(sku: string): number {
  const pct = 15 + (hash(sku) % 26); // 15..40
  return pct / 100;
}

/** The synthesized pre-sale "original" price (always >= price). */
export function originalPrice(sku: string, price: number): number {
  const f = discountFraction(sku);
  return Math.round((price / (1 - f)) * 100) / 100;
}

/** Whole-number percent off, for the "-N%" / badge. */
export function percentOff(sku: string): number {
  return Math.round(discountFraction(sku) * 100);
}

/** True for a subset of SKUs, used to flag a louder "BONUS BUY" badge. */
export function isBonusBuy(sku: string): boolean {
  return hash(sku) % 3 === 0;
}
