# RetailForge CI/CD → Cloud Run — Design

**Date:** 2026-06-10
**Status:** Approved (design phase)
**Scope:** Author a GitHub Actions CI/CD pipeline that tests, builds, and deploys RetailForge to Cloud Run. Author-only: this session produces config + docs + a one-time setup script. The user runs the one-time setup and triggers the first deploy.

## Goal

On every push to `main`, automatically run the test suite, build the three container images, push them to Artifact Registry, and deploy the four Cloud Run services via Terraform. Pull requests run the test gate only. The pipeline authenticates to GCP without long-lived keys.

## Context (existing assets)

- Repo: `github.com/Yash-Kavaiya/RetailForge`, branch `main`.
- GCP project: `genaiguruyoutube`, region `us-central1`.
- `deployment/cloudbuild.yaml` — builds 3 images (toolbox, backend, frontend) via Cloud Build.
- `deployment/Dockerfile.{toolbox,backend,frontend}` — image definitions.
- `deployment/terraform/` — provisions 4 Cloud Run services (`retailforge-toolbox`, `retailforge-backend`, `retailforge-read-api`, `retailforge-frontend`), 2 Secret Manager secrets (`retailforge-mongodb-uri`, `retailforge-google-api-key`), Artifact Registry usage, public IAM. State is **local**.
- `deployment/deploy.sh` — manual one-shot build+apply (kept as-is for local/manual use).
- Tests: `pytest -q` (asyncio auto, `tests/`), lint: `ruff check .`. Deps via `uv sync --extra dev`.
- Terraform vars required by apply: `project_id`, `region`, `mongodb_uri`, `google_api_key`, `toolbox_image`, `backend_image`, `frontend_image` (+ optional model vars with defaults).

## Architecture

### Authentication: Workload Identity Federation (keyless)

GitHub Actions presents an OIDC token; a GCP Workload Identity Pool + Provider trusts tokens from this specific repo and lets them impersonate a deployer service account. No JSON keys stored in GitHub.

- Workload Identity Pool: `github-pool`
- Provider: `github-provider` (issuer `https://token.actions.githubusercontent.com`), attribute condition restricting `assertion.repository == "Yash-Kavaiya/RetailForge"`.
- Service account: `retailforge-cicd@genaiguruyoutube.iam.gserviceaccount.com` with roles:
  - `roles/run.admin` (deploy Cloud Run)
  - `roles/cloudbuild.builds.editor` (submit builds)
  - `roles/artifactregistry.writer` (push images)
  - `roles/secretmanager.admin` (Terraform manages the 2 secrets)
  - `roles/iam.serviceAccountUser` (act as runtime SA / Cloud Build SA)
  - `roles/storage.admin` (Terraform GCS state + Cloud Build staging bucket)
  - `roles/serviceusage.serviceUsageAdmin` (Terraform enables APIs)

### Terraform remote state (GCS backend)

A GCS bucket (`gs://genaiguruyoutube-retailforge-tfstate`, versioned, uniform access) holds Terraform state so CI applies are repeatable and track existing resources. Added as `deployment/terraform/backend.tf` with `prefix = "cloud-run"`. The setup script creates the bucket; the first CI/local `terraform init` migrates/initializes state.

### Pipeline: single workflow `.github/workflows/deploy.yml`

Three jobs, gated by event:

```
            ┌─────────┐
 PR → main  │  test   │  (ruff + pytest)               ← runs, then stops
            └─────────┘
            ┌─────────┐   ┌─────────┐   ┌─────────┐
push → main │  test   │→ │  build  │→ │ deploy  │
            └─────────┘   └─────────┘   └─────────┘
 (also via workflow_dispatch)
```

1. **test** — checkout; install `uv`; `uv sync --extra dev`; `ruff check .`; `pytest -q`. Runs on PR + push + dispatch.
2. **build** — `needs: test`; runs only on push/dispatch. Auth via `google-github-actions/auth` (WIF) + `setup-gcloud`. Runs `gcloud builds submit --config deployment/cloudbuild.yaml --substitutions=_IMAGE_PREFIX=<ar-prefix>,_TAG=${GITHUB_SHA}`. Produces images tagged with both the commit SHA and `latest`.
3. **deploy** — `needs: build`; runs only on push/dispatch. Auth via WIF. `cd deployment/terraform`; `terraform init`; `terraform apply -auto-approve` with images pinned to the SHA tag and `mongodb_uri`/`google_api_key` from GitHub secrets. Prints the storefront URL from `terraform output`.

Concurrency group `deploy-main` with `cancel-in-progress: false` so deploys don't overlap.

### cloudbuild.yaml change

Add a `_TAG` substitution (default `latest`). Each image is tagged `${_IMAGE_PREFIX}/<svc>:${_TAG}` **and** `:latest`, and both tags are listed under `images:` so both get pushed. Backward compatible: existing `deploy.sh` invocation (no `_TAG`) still works via the default.

## GitHub repository secrets

| Secret | Purpose |
|---|---|
| `GCP_PROJECT_ID` | `genaiguruyoutube` |
| `GCP_REGION` | `us-central1` |
| `WIF_PROVIDER` | Full provider resource name |
| `WIF_SERVICE_ACCOUNT` | `retailforge-cicd@...iam.gserviceaccount.com` |
| `MONGODB_URI` | Atlas connection string → Secret Manager via TF |
| `GOOGLE_API_KEY` | Gemini key → Secret Manager via TF |

## Files

| File | Action |
|---|---|
| `.github/workflows/deploy.yml` | **new** — test/build/deploy jobs |
| `scripts/setup-cicd.sh` | **new** — one-time: WIF pool/provider, deployer SA + roles, state bucket. Idempotent. Prints the secret values to set in GitHub. |
| `deployment/terraform/backend.tf` | **new** — GCS backend block |
| `deployment/cloudbuild.yaml` | **modify** — add `_TAG` substitution + dual tags |
| `docs/cicd.md` | **new** — setup + operations runbook (how to run setup, set secrets, trigger, roll back) |

## Error handling & operations

- **Failed tests** block build/deploy (job `needs`).
- **Rollback:** images are SHA-tagged; re-run deploy pointing Terraform at a previous SHA, or `gcloud run services update-traffic` to a prior revision (documented in `docs/cicd.md`).
- **First run:** `terraform init` migrates local state to GCS (run once locally, or the bucket starts empty and CI initializes fresh — documented).
- **Secret rotation:** update GitHub secret → next deploy writes a new Secret Manager version.

## Out of scope (YAGNI)

- Multi-environment (staging/prod) promotion — single `main`→prod for now.
- Running `make seed` in CI — seeding stays a manual one-time step against Atlas.
- Tightening Cloud Run IAM (still public for demo) — noted but unchanged.
- Frontend lint/build in the test job — covered by the Docker build of the frontend image.

## Success criteria

1. Opening a PR runs ruff + pytest and reports status; no cloud changes.
2. Merging to `main` builds 3 SHA-tagged images, pushes them, and applies Terraform.
3. The workflow surfaces the deployed storefront URL.
4. No service-account JSON keys exist anywhere in the repo or GitHub secrets.
5. Terraform state persists in GCS across runs.
