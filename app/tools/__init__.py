"""Agent tools.

Two flavors:
  * Toolbox tools (loaded from the MCP Toolbox via toolbox-core) — used directly
    by the agents for reads and simple writes.
  * Native FunctionTools (this package) — thin orchestrators that still perform
    every DB operation *through* the MCP Toolbox, but add logic the model
    shouldn't do itself: query embedding, line-item math, discount calculation.
"""
