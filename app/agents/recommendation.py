"""Recommendation agent — personalized, social, and trending suggestions."""

from __future__ import annotations

from google.adk.agents import LlmAgent

from app.config import settings
from app.prompts import RECOMMENDATION_INSTRUCTION
from app.tools.catalog import recommend_products, search_products
from app.tools.toolbox import load_tool

recommendation_agent = LlmAgent(
    name="RecommendationAgent",
    model=settings.sub_agent_model,
    description=(
        "Recommends products using co-purchase signals ('customers who bought X "
        "also bought Y'), trending best-sellers, similarity search, and order history."
    ),
    instruction=RECOMMENDATION_INSTRUCTION,
    tools=[
        recommend_products,
        search_products,
        load_tool("get-user-orders"),
        load_tool("get-product"),
    ],
)
