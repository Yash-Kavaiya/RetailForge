# CI/CD — GitHub Actions → Cloud Run

RetailForge ships to Cloud Run automatically via `.github/workflows/deploy.yml`.

| Event | Jobs |
|---|---|
| Pull request → `main` | `test` (ruff + pytest) |
| Push → `main` | `test` → `build` → `deploy` |
| Manual `workflow_dispatch` | `test` → `build` → `deploy` |

Auth uses **Workload Identity Federation** — no service-account JSON keys.

## One-time setup

```bash
PROJECT_ID=genaiguruyoutube REGION=us-central1 \
GITHUB_REPO=Yash-Kavaiya/RetailForge \
bash scripts/setup-cicd.sh
```

This creates the WIF pool/provider, the `retailforge-cicd` deployer service
account (with the required roles), and the `genaiguruyoutube-retailforge-tfstate`
state bucket. It prints the `gh secret set` commands to run next.

### Repo secrets

| Secret | Value |
|---|---|
| `GCP_PROJECT_ID` | `genaiguruyoutube` |
| `GCP_REGION` | `us-central1` |
| `WIF_PROVIDER` | `projects/<num>/locations/global/workloadIdentityPools/github-pool/providers/github-provider` |
| `WIF_SERVICE_ACCOUNT` | `retailforge-cicd@genaiguruyoutube.iam.gserviceaccount.com` |
| `MONGODB_URI` | Atlas connection string |
| `GOOGLE_API_KEY` | Gemini API key |

`MONGODB_URI` and `GOOGLE_API_KEY` are written into Secret Manager by Terraform;
the Cloud Run services read them at runtime.

> **Note:** pushing workflow files over HTTPS needs the `workflow` token scope.
> If `git push` is rejected, run `gh auth refresh -s workflow` once.

## Trigger a deploy

Push to `main`, or run **Actions → CI/CD — Cloud Run → Run workflow**.
The `deploy` job prints the storefront + backend URLs in the run summary.

After the first deploy, seed Atlas once against the same cluster:

```bash
make seed
```

## Rollback

Images are tagged with the commit SHA, so any past build is redeployable.

- **Fast (traffic shift):**
  ```bash
  gcloud run services update-traffic retailforge-frontend \
    --region us-central1 --to-revisions <PREVIOUS_REVISION>=100
  ```
- **Full (re-apply a known SHA):** re-run the workflow from an older commit, or
  locally `terraform apply` with `*_image=...:<OLD_SHA>`.

## Local / manual deploy

`deployment/deploy.sh` still works for manual, non-CI deploys (it builds with the
default `latest` tag).
