"""Tests for billing logic (discounts and kit assembly) with the toolbox mocked."""

from __future__ import annotations

import app.tools.billing as billing


def test_discount_amount_percent_and_fixed():
    assert billing._discount_amount({"type": "percent", "value": 15}, 200.0) == 30.0
    assert billing._discount_amount({"type": "fixed", "value": 25}, 200.0) == 25.0
    assert billing._discount_amount({"type": "unknown"}, 200.0) == 0.0


def test_apply_discount_valid(monkeypatch, fake_promotions):
    monkeypatch.setattr(billing, "call_one", lambda name, **kw: fake_promotions.get(kw.get("code")))
    result = billing.apply_discount("GEARUP25", 250.0)
    assert result["valid"] is True
    assert result["discount"] == 25.0
    assert result["total"] == 225.0


def test_apply_discount_below_minimum(monkeypatch, fake_promotions):
    monkeypatch.setattr(billing, "call_one", lambda name, **kw: fake_promotions.get(kw.get("code")))
    result = billing.apply_discount("GEARUP25", 100.0)
    assert result["valid"] is False


def test_apply_discount_unknown_code(monkeypatch):
    monkeypatch.setattr(billing, "call_one", lambda name, **kw: None)
    result = billing.apply_discount("NOPE", 100.0)
    assert result["valid"] is False


def test_build_kit_assembles_diverse_in_stock_items(monkeypatch, fake_catalog, fake_promotions):
    products = list(fake_catalog.values())

    monkeypatch.setattr(billing, "search_products", lambda query, limit=5: {"products": products})
    monkeypatch.setattr(
        billing, "call_one", lambda name, **kw: {"sku": kw["sku"], "qty_on_hand": 5}
    )
    monkeypatch.setattr(billing, "call_tool", lambda name, **kw: list(fake_promotions.values()))

    kit = billing.build_kit("weekend camping trip", size=5)
    assert kit["status"] == "success"
    assert len(kit["items"]) == 5
    assert all(i["in_stock"] for i in kit["items"])
    # 5 items, subtotal > $200 -> KIT15 (15%) is the best applicable promo.
    assert kit["promotion"]["code"] == "KIT15"
    assert kit["discount"] > 0
    assert kit["total"] == round(kit["subtotal"] - kit["discount"], 2)
