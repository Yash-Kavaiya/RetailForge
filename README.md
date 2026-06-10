# RetailForge

**Multi-Agent Retail Intelligence System** — from product discovery to checkout and support, one intelligent system that *actually does things* for brick-and-mortar retail.

RetailForge is a production-grade reference app for the **MongoDB** + **Google Cloud** stack:

- 🧠 **MongoDB Atlas** is the shared brain — operational data **and** vector store.
- 🔌 **MCP Toolbox for Databases** is the single, meaningful integration layer: every read/write the agents perform goes through it.
- 🤖 **Google ADK** powers a real **multi-agent** system: a root orchestrator that delegates to four specialists.
- 🔎 **Atlas Vector Search** (`gemini-embedding-001`, 3072-d, cosine) drives semantic discovery and recommendations.
- 🖥️ A **Next.js + CopilotKit** storefront talks to the agents over the **AG-UI protocol**, with **generative UI** (product grids, recommendation carousels, order/refund cards, kit builder).
- ☁️ Ships to **Cloud Run** via Terraform + Cloud Build.

These agents take **real actions** — checking live inventory, creating orders, decrementing stock, issuing refunds, and assembling discounted kits — not just chatting.

---

## 🚀 Live demo

Deployed to Google Cloud Run (project `genaiguruyoutube`, region `us-central1`) automatically by the [CI/CD pipeline](#cicd-github-actions).

| Service | URL |
|---|---|
| 🛍️ **Storefront** (start here) | https://retailforge-frontend-awghszkm2a-uc.a.run.app |
| 🤖 Agent backend (AG-UI) | https://retailforge-backend-awghszkm2a-uc.a.run.app |
| 📦 Storefront read API | https://retailforge-read-api-awghszkm2a-uc.a.run.app |
| 🔌 MCP Toolbox | https://retailforge-toolbox-awghszkm2a-uc.a.run.app |

Open the storefront and click the **RetailForge Concierge** (bottom-right) to talk to the agents.

---

## Architecture

```
 Browser
   │  (chat + storefront)
   ▼
 Next.js storefront  ──/api/copilotkit──►  CopilotRuntime + @ag-ui/client HttpAgent
   │  (read API for catalog/orders)                     │  AG-UI events (SSE)
   ▼                                                     ▼
 Storefront Read API (FastAPI)            AG-UI Backend (FastAPI + ag_ui_adk)
   │                                                     │
   │                                        ADK Root Agent (orchestrator)
   │                          ┌──────────────┬───────────┴───────┬──────────────┐
   │                     ProductAdvisor  Recommendation     CustomerSupport   Billing
   │                          └──────────────┴── toolbox-core (load_toolset) ──┘
   │                                                     │
   │                                   MCP Toolbox (genai-toolbox) + tools.yaml
   ▼                                                     ▼
 MongoDB Atlas  ◄───────────────────────────────────────┘
   products · inventory · users · orders · reviews · promotions · carts
   + Atlas Vector Search index on products.embedding (3072-d, cosine)
```

**Agents & responsibilities**

| Agent | Does | MongoDB (via MCP Toolbox) |
|---|---|---|
| **Product Advisor** | NL product search, details, live stock | `find-similar-products` (vector), `get-product`, `check-inventory`, `list-products-by-category` |
| **Recommendation** | "Also bought", trending, history-aware | `also-bought`, `get-trending-products`, `get-user-orders` (+ vector) |
| **Customer Support** | Order status, cancellations, refunds | `get-order`, `get-user-orders`, `update-order-status`, `process-refund` |
| **Billing** | Build kits, discounts, place orders | `list-active-promotions`, `get-promotion`, `insert-order`, `decrement-inventory` |

> **Design note — embeddings & writes:** the Toolbox doesn't generate embeddings, so semantic search is a thin native ADK `FunctionTool` (`search_products`) that embeds the query with Gemini, then calls the Toolbox `$vectorSearch` tool. Computed writes (kit assembly, order totals, discount math) are likewise native tools that still perform **all** persistence through Toolbox tools — keeping the LLM interface clean while every DB op flows through MCP.

---

## Prerequisites

- **Python 3.11+** and [`uv`](https://docs.astral.sh/uv/)
- **Node 20+**
- A **MongoDB Atlas** cluster (free M0 works) with a connection string — Vector Search is created automatically by the seed script.
- A **Gemini API key** ([AI Studio](https://aistudio.google.com/apikey)) — or Vertex AI.
- The **MCP Toolbox** binary (`make toolbox-download`) or Docker.

---

## Quickstart (local)

```bash
# 1. Configure
cp .env.example .env            # fill in MONGODB_URI and GOOGLE_API_KEY
cd frontend && cp .env.local.example .env.local && cd ..

# 2. Install
make install            # Python deps (uv)
make install-frontend   # Node deps

# 3. Seed Atlas: loads sample gear, generates embeddings, builds the vector index
make seed

# 4. Run the four pieces (separate terminals)
make toolbox-download   # one-time: fetch the genai-toolbox binary
make toolbox            # MCP Toolbox        :5000
make backend            # AG-UI agent server :8000
make read-api           # storefront API     :8001
make frontend           # Next.js storefront :3000
```

Open **http://localhost:3000**, then click the **RetailForge Concierge** (bottom-right).

### Or with Docker

```bash
cp .env.example .env     # set MONGODB_URI + GOOGLE_API_KEY
make seed                # seed once (needs uv) — or run data.seed however you like
docker compose up --build
# open http://localhost:3000
```

### Test the agents without a UI

```bash
make dev-web            # ADK dev UI at http://localhost:8000 (needs the toolbox running)
```

---

## Demo script

Open the concierge and try:

1. **Discovery** — *"Find me a lightweight waterproof jacket for rainy hikes under $100."* → semantic search → product cards.
2. **Recommendations** — *"What do people usually buy with the Horizon tent?"* → co-purchase carousel.
3. **Inventory** — *"Is the 65L backpack in stock?"* → live `qty_on_hand` + aisle.
4. **Support** — *"Where's my order ORD-5002?"* then *"Refund it — it arrived damaged."* → order card → refund card (writes to Atlas).
5. **Dynamic bundling** — *"Build me a full weekend camping kit and apply the best discount."* → kit builder with `KIT15` applied.
6. **Checkout** — *"Place that order for me."* → order confirmation; inventory decremented in Atlas.

Verify writes landed by refreshing **/orders** or inspecting the `orders` / `inventory` collections in Atlas.

---

## Project structure

```
app/                  ADK backend
  agents/             root orchestrator + 4 specialists
  tools/              toolbox client + native tools (catalog, orders, billing)
  embeddings.py       Gemini embedding helper (index + query)
  server.py           FastAPI + ag_ui_adk endpoint (AG-UI)
  read_api.py         storefront catalog/orders API
adk_apps/retailforge/ ADK dev-UI entry (adk web)
toolbox/tools.yaml    MCP Toolbox: mongodb source + tools + 4 toolsets
data/                 sample retail data + seed.py (embeddings + Atlas indexes)
frontend/             Next.js + CopilotKit storefront (generative UI)
deployment/           Dockerfiles, Terraform (Cloud Run x4), Cloud Build
  terraform/          main.tf + GCS remote-state backend.tf
scripts/setup-cicd.sh one-time WIF + deployer SA + state-bucket setup
.github/workflows/    deploy.yml — test → build → deploy CI/CD
docs/cicd.md          CI/CD setup + operations runbook
tests/                pytest logic tests (toolbox/embeddings mocked)
```

---

## Deployment (Cloud Run)

Two paths: a one-shot **manual** deploy, or the **automated CI/CD pipeline** (recommended).

Either way, Terraform provisions four Cloud Run services — **toolbox**, **agent backend**, **read API**, and **storefront** — with `MONGODB_URI` / `GOOGLE_API_KEY` stored in **Secret Manager**. Images are built by **Cloud Build** and pushed to **Artifact Registry** (`<region>-docker.pkg.dev/<project>/retailforge`). Run `make seed` against the same Atlas cluster once.

> **MongoDB Atlas network access:** Cloud Run egresses from dynamic Google IPs, so the Atlas cluster's **Network Access** list must allow them. For a demo, add `0.0.0.0/0`; for production, give Cloud Run a static egress IP (VPC connector + Cloud NAT) and allowlist just that IP.

> **Security note:** the Terraform makes all services public (`allUsers` invoker) for demo simplicity — tighten IAM/ingress for production (see `deployment/terraform/main.tf`).

### Manual one-shot

```bash
export PROJECT_ID=your-project REGION=us-central1
export MONGODB_URI='mongodb+srv://...'  GOOGLE_API_KEY='...'
bash deployment/deploy.sh        # builds 3 images, provisions 4 Cloud Run services
```

### CI/CD (GitHub Actions)

`.github/workflows/deploy.yml` runs on every push:

| Event | Jobs |
|---|---|
| Pull request → `main` | `test` (ruff + pytest) |
| Push → `main` / manual dispatch | `test` → `build` → `deploy` |

- **Keyless auth** to GCP via **Workload Identity Federation** — no service-account JSON keys.
- **Images tagged with the commit SHA** (plus `latest`) for traceable rollbacks.
- **Terraform state** lives in a GCS bucket so applies are repeatable across runs.

One-time setup creates the WIF pool/provider, a deployer service account, and the state bucket:

```bash
PROJECT_ID=your-project REGION=us-central1 \
GITHUB_REPO=owner/RetailForge \
bash scripts/setup-cicd.sh        # prints the `gh secret set` commands to run next
```

Required repo secrets: `GCP_PROJECT_ID`, `GCP_REGION`, `WIF_PROVIDER`, `WIF_SERVICE_ACCOUNT`, `MONGODB_URI`, `GOOGLE_API_KEY`.

Full setup, secrets, trigger, and rollback runbook: [`docs/cicd.md`](docs/cicd.md).

---

## Testing

```bash
make test     # 14 logic tests (search, kit math, order totals, discounts, refunds) — fully mocked
make lint     # ruff
```

Agent routing and the AG-UI stream require live services and are verified via `make dev-web` and the demo script above.

---

## Notes

- **Scaffolding:** the layout mirrors Google's [agent-starter-pack](https://github.com/GoogleCloudPlatform/agent-starter-pack) ADK + Cloud Run template (now in maintenance mode; its successor is `agents-cli`). It's framework-agnostic, so `agent-starter-pack enhance` or `agents-cli` can be layered on.
- **Models:** `gemini-2.5-flash` for agents, `gemini-embedding-001` (3072-d) for vectors — configurable in `.env`.
- **MongoDB:** the demo uses an outdoor/camping catalog; swap the JSON in `data/sample/` and re-run `make seed` for any retail vertical.
