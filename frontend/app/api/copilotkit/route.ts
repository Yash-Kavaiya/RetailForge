import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { HttpAgent } from "@ag-ui/client";
import { NextRequest } from "next/server";

// The RetailForge ADK agent is the brain — it runs the LLM itself — so the
// CopilotKit runtime needs no model adapter; it just proxies AG-UI events to it.
const runtime = new CopilotRuntime({
  agents: {
    retailforge: new HttpAgent({
      url: process.env.AGUI_BACKEND_URL || "http://localhost:8000/",
    }),
  },
});

const serviceAdapter = new ExperimentalEmptyAdapter();

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });
  return handleRequest(req);
};
