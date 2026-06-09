"""Shared MongoDB access helpers.

Used by the seed script and the storefront read API. The *agents* never import
this module — they reach MongoDB only through the MCP Toolbox.
"""

from __future__ import annotations

from functools import lru_cache

from pymongo import MongoClient
from pymongo.database import Database

from app.config import settings


@lru_cache
def get_mongo_client() -> MongoClient:
    """Return a cached MongoClient for the configured Atlas cluster."""
    return MongoClient(settings.mongodb_uri, appname="retailforge")


def get_db() -> Database:
    """Return the configured RetailForge database handle."""
    return get_mongo_client()[settings.mongodb_database]
