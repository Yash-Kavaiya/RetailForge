"""Customer Support agent — order status, cancellations, and refunds."""

from __future__ import annotations

from google.adk.agents import LlmAgent

from app.config import settings
from app.prompts import CUSTOMER_SUPPORT_INSTRUCTION
from app.tools.orders import get_order_status, process_refund
from app.tools.toolbox import load_tool

customer_support_agent = LlmAgent(
    name="CustomerSupport",
    model=settings.sub_agent_model,
    description=(
        "Handles post-purchase support: order status lookups, listing a shopper's "
        "orders, status changes/cancellations, and issuing refunds."
    ),
    instruction=CUSTOMER_SUPPORT_INSTRUCTION,
    tools=[
        get_order_status,
        process_refund,
        load_tool("get-user-orders"),
        load_tool("update-order-status"),
    ],
)
