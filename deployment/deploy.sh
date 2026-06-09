#!/usr/bin/env bash
# One-shot deploy: build & push images, then provision Cloud Run with Terraform.
#
# Prereqs: gcloud (authenticated), terraform, a GCP project, and a MongoDB Atlas URI.
# Usage:
#   export PROJECT_ID=my-project REGION=us-central1
#   export MONGODB_URI='mongodb+srv://...'  GOOGLE_API_KEY='...'
#   bash deployment/deploy.sh
set -euo pipefail

: "${PROJECT_ID:?set PROJECT_ID}"
: "${REGION:=us-central1}"
: "${MONGODB_URI:?set MONGODB_URI}"
: "${GOOGLE_API_KEY:?set GOOGLE_API_KEY}"

REPO="retailforge"
IMAGE_PREFIX="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Enabling Artifact Registry + creating repo (idempotent)"
gcloud services enable artifactregistry.googleapis.com cloudbuild.googleapis.com run.googleapis.com --project "$PROJECT_ID"
gcloud artifacts repositories create "$REPO" \
  --repository-format=docker --location="$REGION" --project "$PROJECT_ID" 2>/dev/null || true

echo "==> Building & pushing images via Cloud Build"
gcloud builds submit "$ROOT" \
  --project "$PROJECT_ID" \
  --config "$ROOT/deployment/cloudbuild.yaml" \
  --substitutions "_IMAGE_PREFIX=${IMAGE_PREFIX}"

echo "==> Terraform apply"
cd "$ROOT/deployment/terraform"
terraform init -input=false
terraform apply -input=false -auto-approve \
  -var "project_id=${PROJECT_ID}" \
  -var "region=${REGION}" \
  -var "mongodb_uri=${MONGODB_URI}" \
  -var "google_api_key=${GOOGLE_API_KEY}" \
  -var "toolbox_image=${IMAGE_PREFIX}/toolbox:latest" \
  -var "backend_image=${IMAGE_PREFIX}/backend:latest" \
  -var "frontend_image=${IMAGE_PREFIX}/frontend:latest"

echo "==> Done. Storefront URL:"
terraform output -raw frontend_url
echo
