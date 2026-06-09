"""FastAPI backend exposing the RetailForge root agent over the AG-UI protocol.

The Next.js / CopilotKit storefront connects to this service. `ADKAgent` wraps the
ADK root orchestrator and `add_adk_fastapi_endpoint` mounts the AG-UI event stream.

Run:  uv run uvicorn app.server:app --reload --port 8000
Note: the MCP Toolbox server must be running first (agents load their tools from it).
"""

from __future__ import annotations

from ag_ui_adk import ADKAgent, add_adk_fastapi_endpoint
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.agents.root_agent import root_agent
from app.config import settings

# Wrap the ADK root agent as an AG-UI agent.
adk_agent = ADKAgent(
    adk_agent=root_agent,
    app_name="retailforge",
    user_id="USER-1001",  # demo shopper; a real app would derive this per session
    session_timeout_seconds=3600,
    use_in_memory_services=True,
)

app = FastAPI(title="RetailForge AG-UI Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    """Liveness probe used by Cloud Run / docker-compose."""
    return {"status": "ok", "service": "retailforge-agui"}


# Mount the AG-UI endpoint (POST /) that the CopilotKit runtime talks to.
add_adk_fastapi_endpoint(app, adk_agent, path="/")
