"""Pytest fixtures: a fake product catalog and helpers to stub the MCP Toolbox.

These tests exercise the native tools' *logic* (search, kit math, order totals,
discounts) without a database, embedding API, or running toolbox — every external
call is mocked. The agents and AG-UI layer require live services and are verified
manually (see README).
"""

from __future__ import annotations

import pytest

PRODUCTS = {
    "RF-CMP-001": {"sku": "RF-CMP-001", "name": "Tent", "category": "Camping", "price": 229.0},
    "RF-CMP-002": {"sku": "RF-CMP-002", "name": "Sleeping Bag", "category": "Camping", "price": 119.0},
    "RF-CMP-004": {"sku": "RF-CMP-004", "name": "Stove", "category": "Camping", "price": 44.0},
    "RF-ACC-001": {"sku": "RF-ACC-001", "name": "Headlamp", "category": "Accessories", "price": 39.0},
    "RF-ACC-002": {"sku": "RF-ACC-002", "name": "Water Filter", "category": "Accessories", "price": 34.0},
}

PROMOTIONS = {
    "KIT15": {"code": "KIT15", "type": "percent", "value": 15, "min_items": 4, "active": True},
    "GEARUP25": {"code": "GEARUP25", "type": "fixed", "value": 25, "min_subtotal": 200, "active": True},
}


@pytest.fixture
def fake_catalog():
    return PRODUCTS


@pytest.fixture
def fake_promotions():
    return PROMOTIONS
