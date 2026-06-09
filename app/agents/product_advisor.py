"""Product Advisor agent — inventory-aware natural-language product search."""

from __future__ import annotations

from google.adk.agents import LlmAgent

from app.config import settings
from app.prompts import PRODUCT_ADVISOR_INSTRUCTION
from app.tools.catalog import search_products
from app.tools.toolbox import load_tool

product_advisor_agent = LlmAgent(
    name="ProductAdvisor",
    model=settings.sub_agent_model,
    description=(
        "Finds and explains products via semantic search, returns product details, "
        "and reports real-time store inventory/availability."
    ),
    instruction=PRODUCT_ADVISOR_INSTRUCTION,
    tools=[
        search_products,
        load_tool("get-product"),
        load_tool("check-inventory"),
        load_tool("list-products-by-category"),
    ],
)
