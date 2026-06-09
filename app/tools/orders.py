"""Native order tools: status lookup, refunds, and order creation.

All persistence goes through MCP Toolbox tools (get-order, process-refund,
insert-order, decrement-inventory). These wrappers add the logic the model
shouldn't do itself: computing refund amounts, building line items with correct
prices, totalling the order, and decrementing stock.
"""

from __future__ import annotations

import json
import uuid
from datetime import UTC, datetime
from typing import Any

from app.tools.toolbox import call_one, exec_tool


def get_order_status(order_id: str) -> dict[str, Any]:
    """Look up the current status and details of an order by its id.

    Args:
        order_id: The order id, e.g. "ORD-5001".

    Returns:
        A dict with `status` ("success"/"not_found") and the `order` document
        (items, total, status, shipping_address, refund).
    """
    order = call_one("get-order", order_id=order_id)
    if not order or not order.get("order_id"):
        return {"status": "not_found", "order_id": order_id, "order": None}
    order.pop("_id", None)
    return {"status": "success", "order_id": order_id, "order": order}


def process_refund(order_id: str, reason: str, amount: float | None = None) -> dict[str, Any]:
    """Refund an order. Confirm with the shopper before calling this — it writes to the database.

    If `amount` is not provided, the full order total is refunded.

    Args:
        order_id: The order id to refund, e.g. "ORD-5002".
        reason: The reason for the refund (kept on the order record).
        amount: Optional refund amount; defaults to the full order total.

    Returns:
        A dict describing the refund result for display to the shopper.
    """
    order = call_one("get-order", order_id=order_id)
    if not order or not order.get("order_id"):
        return {"status": "not_found", "order_id": order_id}

    refund_amount = float(amount) if amount is not None else float(order.get("total", 0.0))
    exec_tool("process-refund", order_id=order_id, amount=refund_amount, reason=reason)

    return {
        "status": "refunded",
        "order_id": order_id,
        "amount": refund_amount,
        "reason": reason,
    }


def create_order(
    user_id: str,
    skus: list[str],
    quantities: list[int] | None = None,
    discount_code: str | None = None,
) -> dict[str, Any]:
    """Create a new order from a list of product SKUs and decrement inventory.

    Confirm the items and total with the shopper before calling this — it writes
    to the database. Prices and product names are looked up server-side, so the
    model only needs to supply SKUs and quantities.

    Args:
        user_id: The shopper's user id, e.g. "USER-1001".
        skus: The product SKUs to include in the order.
        quantities: Quantity for each SKU (defaults to 1 per SKU). Must match the
            length of `skus` when provided.
        discount_code: Optional promotion code already applied to the order.

    Returns:
        A dict with `status` and the created `order` document (order_id, items,
        subtotal, discount, total).
    """
    if not skus:
        return {"status": "error", "error_message": "no SKUs provided"}
    qtys = quantities or [1] * len(skus)
    if len(qtys) != len(skus):
        return {"status": "error", "error_message": "skus and quantities length mismatch"}

    items: list[dict[str, Any]] = []
    subtotal = 0.0
    for sku, qty in zip(skus, qtys, strict=False):
        product = call_one("get-product", sku=sku)
        if not product or not product.get("sku"):
            return {"status": "error", "error_message": f"unknown SKU: {sku}"}
        price = float(product.get("price", 0.0))
        line = {"sku": sku, "name": product.get("name"), "qty": int(qty), "price": price}
        items.append(line)
        subtotal += price * int(qty)

    discount = _resolve_discount(discount_code, subtotal) if discount_code else 0.0
    total = round(max(subtotal - discount, 0.0), 2)

    order_doc = {
        "order_id": f"ORD-{uuid.uuid4().hex[:8].upper()}",
        "user_id": user_id,
        "status": "processing",
        "created_at": datetime.now(UTC).isoformat(),
        "items": items,
        "subtotal": round(subtotal, 2),
        "discount": round(discount, 2),
        "discount_code": discount_code,
        "total": total,
        "refund": None,
    }

    exec_tool("insert-order", data=json.dumps(order_doc))
    for line in items:
        exec_tool("decrement-inventory", sku=line["sku"], delta=-int(line["qty"]))

    return {"status": "created", "order": order_doc}


def _resolve_discount(code: str, subtotal: float) -> float:
    """Compute a discount amount for a promo code against a subtotal (best effort)."""
    promo = call_one("get-promotion", code=code)
    if not promo or not promo.get("active"):
        return 0.0
    if subtotal < float(promo.get("min_subtotal", 0)):
        return 0.0
    if promo.get("type") == "percent":
        return round(subtotal * float(promo.get("value", 0)) / 100.0, 2)
    if promo.get("type") == "fixed":
        return float(promo.get("value", 0))
    return 0.0
