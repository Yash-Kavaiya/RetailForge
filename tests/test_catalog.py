"""Tests for catalog search/recommendation logic with embeddings + toolbox mocked."""

from __future__ import annotations

import app.tools.catalog as catalog


def test_search_products_embeds_then_queries(monkeypatch, fake_catalog):
    calls = {}

    monkeypatch.setattr(catalog, "embed_text", lambda text, task_type="RETRIEVAL_QUERY": [0.1, 0.2])

    def fake_call(name, **kw):
        calls["name"] = name
        calls["kw"] = kw
        return list(fake_catalog.values())[:3]

    monkeypatch.setattr(catalog, "call_tool", fake_call)

    result = catalog.search_products("warm sleeping bag", limit=3)
    assert result["status"] == "success"
    assert result["count"] == 3
    assert calls["name"] == "find-similar-products"
    assert calls["kw"]["queryVector"] == [0.1, 0.2]
    assert calls["kw"]["limit"] == 3


def test_search_products_rejects_empty_query():
    result = catalog.search_products("   ")
    assert result["status"] == "error"


def test_recommend_products_also_bought(monkeypatch, fake_catalog):
    monkeypatch.setattr(
        catalog,
        "call_tool",
        lambda name, **kw: [
            {"_id": "RF-CMP-002", "name": "Sleeping Bag", "co_purchases": 3},
            {"_id": "RF-ACC-001", "name": "Headlamp", "co_purchases": 2},
        ],
    )
    monkeypatch.setattr(catalog, "call_one", lambda name, **kw: fake_catalog.get(kw["sku"]))

    result = catalog.recommend_products(sku="RF-CMP-001", limit=5)
    assert result["strategy"] == "also_bought"
    assert result["count"] == 2
    assert result["products"][0]["sku"] == "RF-CMP-002"
    assert result["products"][0]["signal"] == 3
    assert result["products"][0]["price"] == 119.0  # enriched from catalog


def test_recommend_products_trending(monkeypatch, fake_catalog):
    monkeypatch.setattr(
        catalog,
        "call_tool",
        lambda name, **kw: [{"_id": "RF-CMP-001", "name": "Tent", "units_sold": 10}],
    )
    monkeypatch.setattr(catalog, "call_one", lambda name, **kw: fake_catalog.get(kw["sku"]))

    result = catalog.recommend_products(limit=5)
    assert result["strategy"] == "trending"
    assert result["products"][0]["signal"] == 10
