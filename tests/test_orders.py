"""Tests for order creation and refunds with the toolbox mocked."""

from __future__ import annotations

import json

import app.tools.orders as orders


def test_create_order_computes_totals_and_writes(monkeypatch, fake_catalog):
    writes: list[tuple[str, dict]] = []

    monkeypatch.setattr(orders, "call_one", lambda name, **kw: fake_catalog.get(kw.get("sku")))
    monkeypatch.setattr(orders, "exec_tool", lambda name, **kw: writes.append((name, kw)))

    result = orders.create_order("USER-1001", ["RF-CMP-001", "RF-ACC-001"], [1, 2])
    assert result["status"] == "created"
    order = result["order"]
    # 1*229 + 2*39 = 307
    assert order["subtotal"] == 307.0
    assert order["total"] == 307.0
    assert len(order["items"]) == 2
    assert order["order_id"].startswith("ORD-")

    # The order was inserted and inventory decremented for each line via the toolbox.
    inserted = [json.loads(kw["data"]) for n, kw in writes if n == "insert-order"]
    assert inserted and inserted[0]["total"] == 307.0
    decrements = [kw for n, kw in writes if n == "decrement-inventory"]
    assert {d["sku"]: d["delta"] for d in decrements} == {"RF-CMP-001": -1, "RF-ACC-001": -2}


def test_create_order_with_discount(monkeypatch, fake_catalog, fake_promotions):
    def fake_one(name, **kw):
        if name == "get-product":
            return fake_catalog.get(kw["sku"])
        if name == "get-promotion":
            return fake_promotions.get(kw["code"])
        return None

    monkeypatch.setattr(orders, "call_one", fake_one)
    monkeypatch.setattr(orders, "exec_tool", lambda name, **kw: None)
    result = orders.create_order("USER-1001", ["RF-CMP-001"], [1], discount_code="GEARUP25")
    order = result["order"]
    assert order["subtotal"] == 229.0
    assert order["discount"] == 25.0
    assert order["total"] == 204.0


def test_create_order_unknown_sku(monkeypatch):
    monkeypatch.setattr(orders, "call_one", lambda name, **kw: None)
    monkeypatch.setattr(orders, "exec_tool", lambda name, **kw: None)
    result = orders.create_order("USER-1001", ["BAD"], [1])
    assert result["status"] == "error"


def test_process_refund_full_total(monkeypatch):
    captured: dict = {}

    monkeypatch.setattr(
        orders, "call_one", lambda name, **kw: {"order_id": "ORD-5002", "total": 123.0}
    )
    monkeypatch.setattr(orders, "exec_tool", lambda name, **kw: captured.update(kw))

    result = orders.process_refund("ORD-5002", "Changed my mind")
    assert result["status"] == "refunded"
    assert result["amount"] == 123.0
    assert captured["amount"] == 123.0


def test_process_refund_order_not_found(monkeypatch):
    monkeypatch.setattr(orders, "call_one", lambda name, **kw: None)
    monkeypatch.setattr(orders, "exec_tool", lambda name, **kw: None)
    result = orders.process_refund("ORD-9999", "n/a")
    assert result["status"] == "not_found"
