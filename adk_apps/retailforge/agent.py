"""ADK entry module. Exposes `root_agent` for the ADK dev UI / CLI.

`adk web adk_apps` and `adk run adk_apps/retailforge` look for `root_agent` here.
We ensure the repository root is importable so `app.*` resolves regardless of how
the ADK CLI sets up sys.path.
"""

from __future__ import annotations

import pathlib
import sys

_REPO_ROOT = pathlib.Path(__file__).resolve().parents[2]
if str(_REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(_REPO_ROOT))

from app.agents.root_agent import root_agent  # noqa: E402

__all__ = ["root_agent"]
