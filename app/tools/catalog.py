"""Native catalog tools: semantic product search and recommendations.

These wrap MCP Toolbox tools but add logic the model should not do itself:
generating the query embedding and enriching recommendation results with full
product details. Return values are structured dicts so the storefront can render
generative UI (product grids, recommendation carousels).
"""

from __future__ import annotations

from typing import Any

from app.embeddings import embed_text
from app.tools.toolbox import call_one, call_tool


def search_products(query: str, limit: int = 5) -> dict[str, Any]:
    """Find products by natural-language description using semantic vector search.

    Use this for any product discovery request where the shopper describes what
    they want in their own words (e.g. "a lightweight waterproof jacket for
    rainy hikes", "something to keep me warm while winter camping").

    Args:
        query: The shopper's natural-language description of the desired product.
        limit: Maximum number of products to return (default 5).

    Returns:
        A dict with `status`, the `query`, a `count`, and a `products` list. Each
        product includes sku, name, description, category, brand, price,
        attributes, tags, image_url and a relevance `score`.
    """
    query = (query or "").strip()
    if not query:
        return {"status": "error", "error_message": "query must not be empty", "products": []}

    vector = embed_text(query, task_type="RETRIEVAL_QUERY")
    products = call_tool(
        "find-similar-products",
        queryVector=vector,
        num_candidates=max(100, limit * 20),
        limit=limit,
    )
    return {"status": "success", "query": query, "count": len(products), "products": products}


def _enrich(skus: list[str]) -> dict[str, dict]:
    """Fetch full product docs for a list of SKUs, keyed by sku."""
    out: dict[str, dict] = {}
    for sku in skus:
        doc = call_one("get-product", sku=sku)
        if doc and doc.get("sku"):
            out[sku] = doc
    return out


def recommend_products(
    sku: str | None = None,
    user_id: str | None = None,
    limit: int = 5,
) -> dict[str, Any]:
    """Recommend products for a shopper.

    Strategy:
      * If `sku` is given, return "customers who bought this also bought" items.
      * Otherwise return the best-selling / trending products overall.
    Results are enriched with full product details (price, image, etc.) so they
    can be rendered as cards.

    Args:
        sku: Optional anchor product SKU to base "also bought" recommendations on.
        user_id: Optional shopper id (reserved for personalization).
        limit: Maximum number of recommendations to return (default 5).

    Returns:
        A dict with `status`, `strategy`, `count`, and a `products` list.
    """
    if sku:
        strategy = "also_bought"
        rows = call_tool("also-bought", sku=sku, limit=limit)
    else:
        strategy = "trending"
        rows = call_tool("get-trending-products", limit=limit)

    skus = [r["_id"] for r in rows if r.get("_id")]
    details = _enrich(skus)

    products = []
    for r in rows:
        s = r.get("_id")
        signal = r.get("co_purchases") or r.get("units_sold")
        product = details.get(s, {"sku": s, "name": r.get("name")})
        product = {**product, "signal": signal}
        products.append(product)

    return {
        "status": "success",
        "strategy": strategy,
        "anchor_sku": sku,
        "count": len(products),
        "products": products,
    }
