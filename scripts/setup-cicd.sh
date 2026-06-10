#!/usr/bin/env bash
# One-time setup for RetailForge GitHub Actions CI/CD.
#
# Creates (idempotently):
#   - Workload Identity Federation pool + provider trusting this GitHub repo
#   - A deployer service account with the roles Terraform/Cloud Build need
#   - A versioned GCS bucket for Terraform remote state
#
# Then prints the exact values to paste into GitHub repo secrets.
#
# Usage:
#   PROJECT_ID=genaiguruyoutube REGION=us-central1 \
#   GITHUB_REPO=Yash-Kavaiya/RetailForge bash scripts/setup-cicd.sh
set -euo pipefail

PROJECT_ID="${PROJECT_ID:?set PROJECT_ID}"
REGION="${REGION:=us-central1}"
GITHUB_REPO="${GITHUB_REPO:?set GITHUB_REPO (owner/name)}"

POOL_ID="github-pool"
PROVIDER_ID="github-provider"
SA_NAME="retailforge-cicd"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
STATE_BUCKET="gs://${PROJECT_ID}-retailforge-tfstate"

PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"

echo "==> Enabling required APIs"
gcloud services enable \
  iamcredentials.googleapis.com \
  iam.googleapis.com \
  sts.googleapis.com \
  cloudresourcemanager.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  secretmanager.googleapis.com \
  storage.googleapis.com \
  serviceusage.googleapis.com \
  --project "$PROJECT_ID"

echo "==> Artifact Registry repo 'retailforge' (idempotent)"
gcloud artifacts repositories create retailforge \
  --repository-format=docker --location="$REGION" --project "$PROJECT_ID" 2>/dev/null \
  || echo "    (already exists)"

echo "==> Terraform state bucket: ${STATE_BUCKET}"
if ! gcloud storage buckets describe "$STATE_BUCKET" --project "$PROJECT_ID" >/dev/null 2>&1; then
  gcloud storage buckets create "$STATE_BUCKET" \
    --project "$PROJECT_ID" --location="$REGION" --uniform-bucket-level-access
  gcloud storage buckets update "$STATE_BUCKET" --versioning
else
  echo "    (already exists)"
fi

echo "==> Deployer service account: ${SA_EMAIL}"
gcloud iam service-accounts create "$SA_NAME" \
  --project "$PROJECT_ID" --display-name "RetailForge CI/CD deployer" 2>/dev/null \
  || echo "    (already exists)"

echo "==> Granting roles to ${SA_EMAIL}"
for ROLE in \
  roles/run.admin \
  roles/cloudbuild.builds.editor \
  roles/artifactregistry.writer \
  roles/secretmanager.admin \
  roles/iam.serviceAccountUser \
  roles/storage.admin \
  roles/serviceusage.serviceUsageAdmin \
  roles/logging.viewer ; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member "serviceAccount:${SA_EMAIL}" --role "$ROLE" \
    --condition=None --quiet >/dev/null
  echo "    + ${ROLE}"
done

echo "==> Workload Identity Pool: ${POOL_ID}"
gcloud iam workload-identity-pools create "$POOL_ID" \
  --project "$PROJECT_ID" --location=global --display-name "GitHub Actions pool" 2>/dev/null \
  || echo "    (already exists)"

echo "==> WIF Provider: ${PROVIDER_ID} (restricted to repo ${GITHUB_REPO})"
gcloud iam workload-identity-pools providers create-oidc "$PROVIDER_ID" \
  --project "$PROJECT_ID" --location=global --workload-identity-pool="$POOL_ID" \
  --display-name "GitHub provider" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository == '${GITHUB_REPO}'" 2>/dev/null \
  || echo "    (already exists)"

echo "==> Allowing the GitHub repo to impersonate ${SA_EMAIL}"
gcloud iam service-accounts add-iam-policy-binding "$SA_EMAIL" \
  --project "$PROJECT_ID" \
  --role roles/iam.workloadIdentityUser \
  --member "principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/attribute.repository/${GITHUB_REPO}" \
  --quiet >/dev/null

WIF_PROVIDER="projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/providers/${PROVIDER_ID}"

cat <<EOF

============================================================
 Setup complete. Set these GitHub repo secrets:
   gh secret set GCP_PROJECT_ID      --body "${PROJECT_ID}"
   gh secret set GCP_REGION          --body "${REGION}"
   gh secret set WIF_PROVIDER        --body "${WIF_PROVIDER}"
   gh secret set WIF_SERVICE_ACCOUNT --body "${SA_EMAIL}"
   gh secret set MONGODB_URI         --body '<your atlas uri>'
   gh secret set GOOGLE_API_KEY      --body '<your gemini key>'

 Terraform state bucket: ${STATE_BUCKET}
============================================================
EOF
