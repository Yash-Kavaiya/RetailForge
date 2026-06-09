"""MCP Toolbox (genai-toolbox) client helpers.

Every database operation in RetailForge flows through the Toolbox server defined
by `toolbox/tools.yaml`. There are two access paths, both pointing at the same
Toolbox server:

  * `load_toolset(name)` / `load_tool(name)` use the `toolbox-core` SDK to return
    ADK-compatible tools for an agent's `tools=[...]` list. The agents only use
    tools with string/integer params, which the SDK handles cleanly.

  * `call_tool` / `call_one` / `exec_tool` invoke a tool *programmatically* (from
    the native FunctionTools) via the Toolbox's native HTTP `/api/tool/<name>/invoke`
    endpoint. We use the native API here rather than `toolbox-core` because the
    SDK's MCP schema parser rejects float/`number`-typed params (e.g. the vector
    search `queryVector`), while the native endpoint handles them fine.
"""

from __future__ import annotations

import json
import urllib.error
import urllib.request
from functools import lru_cache
from typing import Any

from toolbox_core import ToolboxSyncClient

from app.config import settings


@lru_cache
def get_toolbox_client() -> ToolboxSyncClient:
    """Return a cached, process-wide Toolbox client (used for agent tools)."""
    return ToolboxSyncClient(settings.toolbox_url)


def load_toolset(name: str) -> list[Any]:
    """Load every tool in a named toolset for use by an ADK agent."""
    try:
        return get_toolbox_client().load_toolset(name)
    except Exception as exc:  # noqa: BLE001
        raise RuntimeError(
            f"Could not load toolset '{name}' from the MCP Toolbox at "
            f"{settings.toolbox_url}. Is the toolbox server running? "
            f"Start it with `make toolbox`. Original error: {exc}"
        ) from exc


def load_tool(name: str) -> Any:
    """Load a single Toolbox tool as an ADK agent tool."""
    try:
        return get_toolbox_client().load_tool(name)
    except Exception as exc:  # noqa: BLE001
        raise RuntimeError(
            f"Could not load tool '{name}' from the MCP Toolbox at "
            f"{settings.toolbox_url}. Is the toolbox server running? "
            f"Original error: {exc}"
        ) from exc


# --- Programmatic invocation via the native HTTP API -------------------------


def _invoke(name: str, params: dict[str, Any]) -> Any:
    """POST to the Toolbox native invoke endpoint and return the parsed result."""
    url = f"{settings.toolbox_url.rstrip('/')}/api/tool/{name}/invoke"
    data = json.dumps(params).encode("utf-8")
    req = urllib.request.Request(
        url, data=data, headers={"Content-Type": "application/json"}, method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", "ignore")
        raise RuntimeError(f"Toolbox tool '{name}' failed ({exc.code}): {detail}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(
            f"Could not reach the MCP Toolbox at {settings.toolbox_url}. "
            f"Is it running (`make toolbox`)? Original error: {exc}"
        ) from exc
    return _parse(payload.get("result"))


def call_tool(name: str, **params: Any) -> list[dict]:
    """Invoke a find/aggregate tool and return its rows as a list of documents."""
    return as_list(_invoke(name, params))


def call_one(name: str, **params: Any) -> dict | None:
    """Invoke a find-one tool and return the single document (or None)."""
    rows = as_list(_invoke(name, params))
    return rows[0] if rows else None


def exec_tool(name: str, **params: Any) -> None:
    """Invoke a write tool (insert/update), ignoring the result."""
    _invoke(name, params)


def _parse(raw: Any) -> Any:
    """Normalize a Toolbox tool result into Python objects."""
    if isinstance(raw, (dict, list)):
        return raw
    if isinstance(raw, (bytes, bytearray)):
        raw = raw.decode("utf-8")
    if isinstance(raw, str):
        raw = raw.strip()
        if not raw:
            return []
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return raw
    return raw


def as_list(result: Any) -> list[dict]:
    """Coerce a parsed Toolbox result into a list of documents."""
    if result is None:
        return []
    if isinstance(result, list):
        return [d for d in result if isinstance(d, dict)]
    if isinstance(result, dict):
        for key in ("documents", "results", "rows"):
            if key in result and isinstance(result[key], list):
                return result[key]
        return [result]
    return []
