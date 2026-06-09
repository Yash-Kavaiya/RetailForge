"""Seed MongoDB Atlas with sample retail data and build the search indexes.

Run:  uv run python -m data.seed            # drop + reseed everything
      uv run python -m data.seed --no-drop  # keep existing docs
      uv run python -m data.seed --skip-embeddings   # skip Gemini calls (no vector search)

Steps:
  1. Load the sample JSON files in data/sample/.
  2. Generate Gemini embeddings for every product (skippable).
  3. Insert documents into the configured Atlas database.
  4. Create standard indexes + the Atlas Vector Search index on products.embedding.
  5. Poll until the vector index is queryable.
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

from pymongo.operations import SearchIndexModel

from app.config import settings
from app.db import get_db

SAMPLE_DIR = Path(__file__).parent / "sample"


def _load(name: str) -> list[dict]:
    return json.loads((SAMPLE_DIR / name).read_text(encoding="utf-8"))


def _product_embedding_text(product: dict) -> str:
    """Build the text that represents a product in the vector space."""
    tags = ", ".join(product.get("tags", []))
    return (
        f"{product['name']}. {product['description']} "
        f"Category: {product['category']}. Brand: {product['brand']}. "
        f"Keywords: {tags}."
    )


def embed_products(products: list[dict]) -> None:
    """Attach a `embedding` field to each product in place."""
    from app.embeddings import embed_text  # imported lazily so --skip-embeddings needs no key

    total = len(products)
    for i, product in enumerate(products, start=1):
        text = _product_embedding_text(product)
        product[settings.vector_field] = embed_text(text, task_type="RETRIEVAL_DOCUMENT")
        print(f"  embedded {i}/{total}: {product['sku']}", flush=True)


def insert_collection(name: str, docs: list[dict], drop: bool) -> None:
    db = get_db()
    coll = db[name]
    if drop:
        coll.drop()
    if docs:
        coll.insert_many(docs)
    print(f"  inserted {len(docs):>3} docs into '{name}'", flush=True)


def create_standard_indexes() -> None:
    db = get_db()
    db[settings.products_collection].create_index("sku", unique=True)
    db[settings.products_collection].create_index("category")
    db[settings.inventory_collection].create_index("sku")
    db[settings.users_collection].create_index("user_id", unique=True)
    db[settings.orders_collection].create_index("order_id", unique=True)
    db[settings.orders_collection].create_index("user_id")
    db[settings.reviews_collection].create_index("sku")
    db[settings.promotions_collection].create_index("code", unique=True)
    db[settings.carts_collection].create_index("user_id")
    print("  created standard indexes", flush=True)


def create_vector_index() -> None:
    """Create (or confirm) the Atlas Vector Search index on products.embedding."""
    coll = get_db()[settings.products_collection]
    existing = {idx["name"] for idx in coll.list_search_indexes()}
    if settings.vector_index_name in existing:
        print(f"  vector index '{settings.vector_index_name}' already exists", flush=True)
        return

    model = SearchIndexModel(
        definition={
            "fields": [
                {
                    "type": "vector",
                    "path": settings.vector_field,
                    "numDimensions": settings.embedding_dimensions,
                    "similarity": "cosine",
                },
                {"type": "filter", "path": "category"},
                {"type": "filter", "path": "brand"},
                {"type": "filter", "path": "price"},
            ]
        },
        name=settings.vector_index_name,
        type="vectorSearch",
    )
    coll.create_search_index(model=model)
    print(f"  created vector index '{settings.vector_index_name}' (building...)", flush=True)


def wait_for_vector_index(timeout_s: int = 300) -> None:
    coll = get_db()[settings.products_collection]
    deadline = time.time() + timeout_s
    while time.time() < deadline:
        for idx in coll.list_search_indexes(settings.vector_index_name):
            if idx.get("queryable"):
                print(f"  vector index '{settings.vector_index_name}' is READY", flush=True)
                return
        print("  waiting for vector index to become queryable...", flush=True)
        time.sleep(5)
    print("  WARNING: timed out waiting for the vector index to build", flush=True)


def main() -> int:
    parser = argparse.ArgumentParser(description="Seed RetailForge MongoDB Atlas data.")
    parser.add_argument("--no-drop", action="store_true", help="Do not drop existing collections")
    parser.add_argument(
        "--skip-embeddings",
        action="store_true",
        help="Skip Gemini embedding generation (vector search will not work)",
    )
    args = parser.parse_args()
    drop = not args.no_drop

    print(f"Seeding database '{settings.mongodb_database}' ...", flush=True)

    products = _load("products.json")
    if args.skip_embeddings:
        print("  skipping embeddings (--skip-embeddings)", flush=True)
    else:
        print("  generating product embeddings with Gemini ...", flush=True)
        embed_products(products)

    insert_collection(settings.products_collection, products, drop)
    insert_collection(settings.inventory_collection, _load("inventory.json"), drop)
    insert_collection(settings.users_collection, _load("users.json"), drop)
    insert_collection(settings.orders_collection, _load("orders.json"), drop)
    insert_collection(settings.reviews_collection, _load("reviews.json"), drop)
    insert_collection(settings.promotions_collection, _load("promotions.json"), drop)
    insert_collection(settings.carts_collection, [], drop)

    create_standard_indexes()

    if not args.skip_embeddings:
        try:
            create_vector_index()
            wait_for_vector_index()
        except Exception as exc:  # noqa: BLE001 - surface a friendly message
            print(
                f"  ERROR creating the vector index: {exc}\n"
                "  Vector search requires a MongoDB Atlas cluster (or Atlas Local) "
                "with Search enabled.",
                flush=True,
            )
            return 1

    print("Done. RetailForge data is seeded.", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
