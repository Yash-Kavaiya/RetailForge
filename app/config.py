"""Centralized configuration loaded from environment variables / .env.

Every other module imports `settings` from here so configuration lives in exactly
one place (database names, model ids, toolbox URL, CORS origins, ...).
"""

from __future__ import annotations

from functools import lru_cache

from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

# Load .env into the real process environment so that libraries which read
# os.environ directly (google-genai / ADK looking for GOOGLE_API_KEY,
# GOOGLE_GENAI_USE_VERTEXAI, ...) see the same values pydantic-settings does.
load_dotenv()


class Settings(BaseSettings):
    """Application settings sourced from the environment / `.env`."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # --- MongoDB -------------------------------------------------------------
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_database: str = "retailforge"

    # --- Gemini / GenAI ------------------------------------------------------
    google_api_key: str | None = None
    google_genai_use_vertexai: str = "FALSE"
    google_cloud_project: str | None = None
    google_cloud_location: str = "us-central1"

    # --- Models --------------------------------------------------------------
    root_agent_model: str = "gemini-2.5-flash"
    sub_agent_model: str = "gemini-2.5-flash"
    embedding_model: str = "gemini-embedding-001"
    embedding_dimensions: int = 3072

    # --- MCP Toolbox ---------------------------------------------------------
    toolbox_url: str = "http://127.0.0.1:5000"

    # --- AG-UI backend -------------------------------------------------------
    frontend_origins: str = "http://localhost:3000"

    # --- Collections (fixed names; keep in sync with toolbox/tools.yaml) ------
    products_collection: str = "products"
    inventory_collection: str = "inventory"
    users_collection: str = "users"
    orders_collection: str = "orders"
    reviews_collection: str = "reviews"
    promotions_collection: str = "promotions"
    carts_collection: str = "carts"

    # --- Vector index --------------------------------------------------------
    vector_index_name: str = "products_vector_index"
    vector_field: str = "embedding"

    @property
    def use_vertexai(self) -> bool:
        return self.google_genai_use_vertexai.strip().upper() == "TRUE"

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.frontend_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance."""
    return Settings()


settings = get_settings()
