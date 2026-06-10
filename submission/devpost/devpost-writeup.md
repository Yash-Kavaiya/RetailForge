# RetailForge — Devpost Submission

> **Your AI Personal Shopper — that actually shops.**
> A production-grade multi-agent retail intelligence system: a department-store
> storefront with a concierge that searches, recommends, builds discounted kits,
> places orders, and issues refunds — with safe, gated access to live data.

**Live demo:** https://retailforge-frontend-awghszkm2a-uc.a.run.app

---

## Inspiration

Retail "AI assistants" today mostly *talk*. You ask for a waterproof jacket, you get a
paragraph back — and then you still do all the work: hunt through the catalog, compare
prices, check whether it's in stock, find a promo code, and check out yourself.

We wanted to build a concierge that takes **real, correct actions** on a live store:
find products by meaning (not keywords), assemble a multi-item kit for an activity,
apply the best valid discount, place the order, and handle returns — the things a great
in-store personal shopper actually does.

The catch: the moment you let an LLM touch your production database, you're one
hallucination away from a destructive write, and you have no clean way to audit what the
model did. So the second half of the inspiration was just as important as the first:
**how do you give agents real power over data without giving them the keys to the
kingdom?**

## What it does

RetailForge is a full department-store storefront with an embedded **Personal Shopper**.
A shopper chats once; behind the scenes a team of specialist agents do the work end to end:

- **Find** — natural-language semantic search over the catalog using vector embeddings.
- **Recommend** — "customers also bought", trending items, and history-aware picks.
- **Support** — order status, cancellations, and refunds.
- **Build a kit** — assemble a multi-category bundle for an activity (e.g. a weekend
  camping trip), check live inventory, and **auto-apply the best valid promotion**.
- **Check out** — actually place the order and decrement inventory.

Every answer comes back as **generative UI** — product grids, a kit-builder card, an order
confirmation — with live "Add to Bag" actions wired to the same state as the storefront.

## How we built it

**Frontend.** Next.js 15 + React 19 + Tailwind, with CopilotKit driving the concierge over
the **AG-UI** protocol (server-sent events). A separate read-only API serves the catalog,
product detail, reviews, and order history.

**Agents.** A root **RetailForgeConcierge** built on **Google ADK** classifies shopper
intent and hands off (`transfer_to_agent`) to one of four specialists: ProductAdvisor,
RecommendationAgent, CustomerSupport, and BillingAgent. The LLM does the *strategy*;
deterministic money math (pricing, discount validation, inventory) stays in native Python —
not left to the model.

**The key design decision — MCP Toolbox as a safety boundary.** Agents never open a
database connection. Every data operation is a **declared tool** in `tools.yaml` (24 tools,
grouped into four toolsets, one per agent), served by Google's **MCP Toolbox for Databases**
running as a distroless binary on Cloud Run. An agent can only call what's declared — no
ad-hoc queries, no `DROP`. Every write is a named, logged, auditable tool call.

**Data & AI.** MongoDB Atlas with **Atlas Vector Search**. Products are embedded at seed
time with `gemini-embedding-001` (3072-d, cosine); queries are embedded at run time and
matched with `$vectorSearch` plus metadata filters (category, brand, price). Agents reason
with **Gemini 2.5 Flash**.

**Infrastructure & CI/CD.** Four Cloud Run services (frontend, backend, read-api, toolbox)
provisioned by **Terraform**, with secrets in Secret Manager and images in Artifact
Registry. **GitHub Actions** runs the pipeline — test (ruff + pytest on mongomock) → Cloud
Build (three images, commit-SHA tagged) → `terraform apply` — authenticating to GCP with
**Workload Identity Federation**, so there are no service-account JSON keys in the repo.

## Challenges we ran into

- **Keeping agents away from the database.** Solved cleanly by routing 100% of data access
  through the MCP Toolbox tool layer instead of giving agents a driver.
- **Vector search relevance.** Getting good results meant tuning embedding task-types
  (document vs. query), metadata filters, and top-k.
- **Distroless toolbox on Cloud Run.** The Toolbox image has no shell, so we invoke the
  binary directly on port 8080 — and had to make the Toolbox service publicly invokable
  *before* the backend boots and tries to load its tools.
- **Multi-service boot ordering** under Terraform, so dependencies come up in the right order.

## Accomplishments that we're proud of

- A concierge that performs **real transactions** — orders, inventory writes, refunds —
  not a scripted demo.
- A genuinely **safe** agent-to-data architecture: every action is auditable by construction.
- A polished, **production-grade** retail UX with generative UI, not just a chat box.
- **One-command, keyless deploys**: `terraform apply` brings up the whole stack; CI/CD ships
  it on every push with no secrets in the repo.

## What we learned

- Let the **LLM strategize**, but keep correctness-critical math in deterministic code.
- A **declared-tool layer** (MCP Toolbox) is the cleanest way to make LLM data access both
  powerful and safe — it doubles as the API contract between model and system of record.
- **Generative UI** beats plain chat: putting the action where the answer is changes the
  whole experience.
- **Keyless WIF + Terraform** makes cloud deploys repeatable and secret-free.

## What's next

- Tighten IAM to authenticated service-to-service calls and add a VPC connector for static
  egress IPs to Atlas.
- Personalization driven by real session and purchase history.
- Payment + fulfillment integration, and A/B testing of agent strategies.
- Full observability: trace every agent hand-off and tool call.

## Built With

`next.js` · `react` · `typescript` · `tailwind-css` · `copilotkit` · `ag-ui` ·
`google-adk` · `gemini` · `mongodb-atlas` · `vector-search` · `fastapi` · `python` ·
`mcp` · `mcp-toolbox` · `terraform` · `google-cloud-run` · `secret-manager` ·
`artifact-registry` · `cloud-build` · `github-actions` · `workload-identity-federation`

---

## Live Demo & Links

| | |
|---|---|
| **Storefront (try it)** | https://retailforge-frontend-awghszkm2a-uc.a.run.app |
| Agent backend (AG-UI) | https://retailforge-backend-awghszkm2a-uc.a.run.app |
| Read API (catalog/orders) | https://retailforge-read-api-awghszkm2a-uc.a.run.app |
| MCP Toolbox | https://retailforge-toolbox-awghszkm2a-uc.a.run.app |

**Try in the concierge:** *"Find a waterproof jacket under $100"* or
*"Build me a weekend camping kit under $300 with a discount."*

---

## Gallery — upload these with captions

Screenshots (`submission/screenshots/`):

- `home-hero.png` — **Department-store storefront, live on Cloud Run.** Red-star branding,
  hero sale banner, shop-by-department tiles.
- `home-desktop.png` — **Full home page** with product rails across every category.
- `concierge-chat.png` — **The Personal Shopper in action** — the root agent's live
  `transfer_to_agent` hand-off and a generative kit being built.
- `concierge-search.png` — **Multi-agent routing** to the ProductAdvisor on a search query.
- `product-detail.png` — **Rich product page** with reviews, live stock by aisle, size/color.
- `orders.png` — **Order history** with color-coded status badges.
- `home-mobile.png` — **Fully responsive** mobile storefront.

Diagrams (`submission/diagrams/`):

- `architecture.png` — **System architecture**: four Cloud Run services + MongoDB Atlas.
- `agents.png` — **Multi-agent orchestration**: root concierge + four specialists.
- `dataflow.png` — **Semantic search & action data-flow**: query → embed → vector search →
  Toolbox → Atlas.
- `cicd.png` — **CI/CD pipeline**: GitHub Actions → Cloud Build → Terraform → Cloud Run.

Presentation: `submission/deck/retailforge.pdf` (16 slides, 16:9).
