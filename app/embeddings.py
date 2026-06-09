"""Gemini embedding helpers shared by the seed script and the vector-search tool.

Produces dense vectors with `gemini-embedding-001` (3072-d by default) for both
indexing (seed time) and querying (agent time), so the index and query spaces match.
"""

from __future__ import annotations

from functools import lru_cache

from google import genai
from google.genai import types

from app.config import settings


@lru_cache
def get_genai_client() -> genai.Client:
    """Return a cached GenAI client configured for AI Studio or Vertex AI."""
    if settings.use_vertexai:
        return genai.Client(
            vertexai=True,
            project=settings.google_cloud_project,
            location=settings.google_cloud_location,
        )
    return genai.Client(api_key=settings.google_api_key)


def embed_text(text: str, *, task_type: str = "RETRIEVAL_QUERY") -> list[float]:
    """Embed a single string and return its vector.

    Args:
        text: The text to embed.
        task_type: Gemini embedding task type. Use ``RETRIEVAL_DOCUMENT`` when
            indexing stored documents and ``RETRIEVAL_QUERY`` for user queries.
    """
    client = get_genai_client()
    response = client.models.embed_content(
        model=settings.embedding_model,
        contents=text,
        config=types.EmbedContentConfig(
            task_type=task_type,
            output_dimensionality=settings.embedding_dimensions,
        ),
    )
    return list(response.embeddings[0].values)
