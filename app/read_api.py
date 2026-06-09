"""Read-only storefront API.

Serves the product catalog, categories, inventory, and orders to the Next.js
storefront for rendering pages (grid, product detail, orders). This is a plain
data API — the conversational features go through the AG-UI agent backend instead.

Run:  uv run uvicorn app.read_api:app --reload --port 8001
"""

from __future__ import annotations

from typing import Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db import get_db

app = FastAPI(title="RetailForge Storefront API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Always hide the Mongo _id and the large embedding vector from API responses.
_HIDE = {"_id": 0, settings.vector_field: 0}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "retailforge-read-api"}


@app.get("/api/products")
def list_products(
    category: str | None = Query(default=None),
    q: str | None = Query(default=None, description="Case-insensitive name/description filter"),
    limit: int = Query(default=100, le=200),
) -> dict[str, Any]:
    query: dict[str, Any] = {}
    if category:
        query["category"] = category
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
            {"tags": {"$regex": q, "$options": "i"}},
        ]
    products = list(get_db()[settings.products_collection].find(query, _HIDE).limit(limit))
    return {"count": len(products), "products": products}


@app.get("/api/products/{sku}")
def get_product(sku: str) -> dict[str, Any]:
    product = get_db()[settings.products_collection].find_one({"sku": sku}, _HIDE)
    if not product:
        raise HTTPException(status_code=404, detail=f"Product {sku} not found")
    inventory = get_db()[settings.inventory_collection].find_one({"sku": sku}, {"_id": 0})
    product["inventory"] = inventory
    return product


@app.get("/api/categories")
def list_categories() -> dict[str, Any]:
    categories = sorted(get_db()[settings.products_collection].distinct("category"))
    return {"categories": categories}


@app.get("/api/orders")
def list_orders(user_id: str = Query(default="USER-1001")) -> dict[str, Any]:
    orders = list(
        get_db()[settings.orders_collection]
        .find({"user_id": user_id}, {"_id": 0})
        .sort("created_at", -1)
    )
    return {"count": len(orders), "orders": orders}


@app.get("/api/orders/{order_id}")
def get_order(order_id: str) -> dict[str, Any]:
    order = get_db()[settings.orders_collection].find_one({"order_id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail=f"Order {order_id} not found")
    return order
