"""Native billing tools: dynamic kit/bundle building and discount calculation.

DB access (product lookup, inventory, promotions) goes through MCP Toolbox tools;
the math and assembly logic lives here so the model gets clean, structured results
to render (kit builder, discount summary) and to feed into create_order.
"""

from __future__ import annotations

from typing import Any

from app.tools.catalog import search_products
from app.tools.toolbox import call_one, call_tool


def build_kit(activity: str, size: int = 5) -> dict[str, Any]:
    """Assemble a complete product kit/bundle for an activity, with pricing and a discount.

    Picks a diverse set of relevant, in-stock products (one per category where
    possible), totals them, and applies the best-fit "build a kit" promotion.
    Use for requests like "build me a full weekend camping kit" or
    "put together a starter day-hiking bundle".

    Args:
        activity: A description of the activity/use case, e.g. "weekend backpacking trip".
        size: Target number of items in the kit (default 5).

    Returns:
        A dict with the assembled `items`, `subtotal`, applied `promotion`,
        `discount`, `total`, and the list of `skus` (to pass to create_order).
    """
    activity = (activity or "").strip() or "camping trip"
    candidates = search_products(activity, limit=max(size * 3, 9)).get("products", [])

    # Build a diverse kit: prefer one item per category, then fill remaining slots.
    chosen: list[dict] = []
    seen_categories: set[str] = set()
    for p in candidates:
        cat = p.get("category")
        if cat not in seen_categories:
            chosen.append(p)
            seen_categories.add(cat)
        if len(chosen) >= size:
            break
    for p in candidates:
        if len(chosen) >= size:
            break
        if p not in chosen:
            chosen.append(p)

    items = []
    subtotal = 0.0
    for p in chosen:
        inv = call_one("check-inventory", sku=p.get("sku"))
        in_stock = bool(inv and inv.get("qty_on_hand", 0) > 0)
        price = float(p.get("price", 0.0))
        subtotal += price
        items.append(
            {
                "sku": p.get("sku"),
                "name": p.get("name"),
                "category": p.get("category"),
                "price": price,
                "image_url": p.get("image_url"),
                "in_stock": in_stock,
            }
        )

    promo = _best_kit_promotion(item_count=len(items), subtotal=subtotal)
    discount = _discount_amount(promo, subtotal) if promo else 0.0
    total = round(max(subtotal - discount, 0.0), 2)

    return {
        "status": "success",
        "activity": activity,
        "items": items,
        "skus": [i["sku"] for i in items],
        "subtotal": round(subtotal, 2),
        "promotion": promo,
        "discount": round(discount, 2),
        "total": total,
    }


def apply_discount(code: str, subtotal: float) -> dict[str, Any]:
    """Validate a promotion code against a subtotal and compute the discount.

    Args:
        code: The promotion code, e.g. "KIT15".
        subtotal: The order subtotal in dollars.

    Returns:
        A dict with `valid`, the `promotion` details, the `discount` amount, and
        the resulting `total`.
    """
    promo = call_one("get-promotion", code=code)
    if not promo or not promo.get("active"):
        return {"valid": False, "reason": "Unknown or inactive code", "code": code}
    if subtotal < float(promo.get("min_subtotal", 0)):
        return {
            "valid": False,
            "reason": f"Requires a subtotal of at least ${promo.get('min_subtotal')}",
            "code": code,
            "promotion": _clean(promo),
        }
    discount = _discount_amount(promo, subtotal)
    return {
        "valid": True,
        "code": code,
        "promotion": _clean(promo),
        "discount": round(discount, 2),
        "total": round(max(subtotal - discount, 0.0), 2),
    }


def _best_kit_promotion(item_count: int, subtotal: float) -> dict | None:
    """Pick the active promotion that gives the largest valid discount for a kit."""
    best: dict | None = None
    best_value = 0.0
    for promo in call_tool("list-active-promotions"):
        if item_count < int(promo.get("min_items", 0)):
            continue
        if subtotal < float(promo.get("min_subtotal", 0)):
            continue
        if promo.get("loyalty_tier"):
            continue  # tier-gated promos are out of scope for an anonymous kit
        value = _discount_amount(promo, subtotal)
        if value > best_value:
            best, best_value = promo, value
    return _clean(best) if best else None


def _discount_amount(promo: dict, subtotal: float) -> float:
    if promo.get("type") == "percent":
        return round(subtotal * float(promo.get("value", 0)) / 100.0, 2)
    if promo.get("type") == "fixed":
        return float(promo.get("value", 0))
    return 0.0


def _clean(promo: dict | None) -> dict | None:
    if not promo:
        return None
    promo = dict(promo)
    promo.pop("_id", None)
    return promo
