"""Root orchestrator — routes shopper intent to the right specialist agent."""

from __future__ import annotations

from google.adk.agents import LlmAgent

from app.agents.billing import billing_agent
from app.agents.customer_support import customer_support_agent
from app.agents.product_advisor import product_advisor_agent
from app.agents.recommendation import recommendation_agent
from app.config import settings
from app.prompts import ROOT_INSTRUCTION

root_agent = LlmAgent(
    name="RetailForgeConcierge",
    model=settings.root_agent_model,
    description="RetailForge shopping concierge that orchestrates retail specialist agents.",
    instruction=ROOT_INSTRUCTION,
    sub_agents=[
        product_advisor_agent,
        recommendation_agent,
        customer_support_agent,
        billing_agent,
    ],
)
