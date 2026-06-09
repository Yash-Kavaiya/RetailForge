"""Billing agent — dynamic kit building, discounts, and order placement."""

from __future__ import annotations

from google.adk.agents import LlmAgent

from app.config import settings
from app.prompts import BILLING_INSTRUCTION
from app.tools.billing import apply_discount, build_kit
from app.tools.orders import create_order
from app.tools.toolbox import load_tool

billing_agent = LlmAgent(
    name="BillingAgent",
    model=settings.sub_agent_model,
    description=(
        "Builds product kits/bundles, validates and applies discount codes, and "
        "places orders (writing to the database and decrementing inventory)."
    ),
    instruction=BILLING_INSTRUCTION,
    tools=[
        build_kit,
        apply_discount,
        create_order,
        load_tool("list-active-promotions"),
        load_tool("check-inventory"),
    ],
)
