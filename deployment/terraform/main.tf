terraform {
  required_version = ">= 1.5"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 6.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

data "google_project" "this" {}

locals {
  # Default compute service account used by Cloud Run services.
  run_sa = "serviceAccount:${data.google_project.this.number}-compute@developer.gserviceaccount.com"
}

# --- Enable required APIs ------------------------------------------------------
resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com",
    "secretmanager.googleapis.com",
    "artifactregistry.googleapis.com",
    "cloudbuild.googleapis.com",
  ])
  service            = each.value
  disable_on_destroy = false
}

# --- Secrets ------------------------------------------------------------------
resource "google_secret_manager_secret" "mongodb_uri" {
  secret_id = "retailforge-mongodb-uri"
  replication { auto {} }
  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "mongodb_uri" {
  secret      = google_secret_manager_secret.mongodb_uri.id
  secret_data = var.mongodb_uri
}

resource "google_secret_manager_secret" "google_api_key" {
  secret_id = "retailforge-google-api-key"
  replication { auto {} }
  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "google_api_key" {
  secret      = google_secret_manager_secret.google_api_key.id
  secret_data = var.google_api_key
}

resource "google_secret_manager_secret_iam_member" "mongodb_uri_access" {
  secret_id = google_secret_manager_secret.mongodb_uri.id
  role      = "roles/secretmanager.secretAccessor"
  member    = local.run_sa
}

resource "google_secret_manager_secret_iam_member" "google_api_key_access" {
  secret_id = google_secret_manager_secret.google_api_key.id
  role      = "roles/secretmanager.secretAccessor"
  member    = local.run_sa
}

# --- MCP Toolbox service ------------------------------------------------------
resource "google_cloud_run_v2_service" "toolbox" {
  name     = "retailforge-toolbox"
  location = var.region
  deletion_protection = false

  template {
    containers {
      image = var.toolbox_image
      env {
        name = "MONGODB_URI"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.mongodb_uri.secret_id
            version = "latest"
          }
        }
      }
    }
  }
  depends_on = [google_secret_manager_secret_version.mongodb_uri]
}

# --- Agent (AG-UI) backend ----------------------------------------------------
resource "google_cloud_run_v2_service" "backend" {
  name     = "retailforge-backend"
  location = var.region
  deletion_protection = false

  template {
    containers {
      image = var.backend_image
      env {
        name  = "TOOLBOX_URL"
        value = google_cloud_run_v2_service.toolbox.uri
      }
      env {
        name  = "ROOT_AGENT_MODEL"
        value = var.root_agent_model
      }
      env {
        name  = "SUB_AGENT_MODEL"
        value = var.sub_agent_model
      }
      env {
        name = "GOOGLE_API_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.google_api_key.secret_id
            version = "latest"
          }
        }
      }
    }
  }
  depends_on = [google_secret_manager_secret_version.google_api_key]
}

# --- Storefront read API ------------------------------------------------------
resource "google_cloud_run_v2_service" "read_api" {
  name     = "retailforge-read-api"
  location = var.region
  deletion_protection = false

  template {
    containers {
      image   = var.backend_image
      command = ["sh", "-c", "uvicorn app.read_api:app --host 0.0.0.0 --port $${PORT:-8080}"]
      env {
        name = "MONGODB_URI"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.mongodb_uri.secret_id
            version = "latest"
          }
        }
      }
    }
  }
  depends_on = [google_secret_manager_secret_version.mongodb_uri]
}

# --- Next.js storefront -------------------------------------------------------
resource "google_cloud_run_v2_service" "frontend" {
  name     = "retailforge-frontend"
  location = var.region
  deletion_protection = false

  template {
    containers {
      image = var.frontend_image
      env {
        name  = "AGUI_BACKEND_URL"
        value = "${google_cloud_run_v2_service.backend.uri}/"
      }
      env {
        name  = "READ_API_URL"
        value = google_cloud_run_v2_service.read_api.uri
      }
    }
  }
}

# --- Public access (demo). Tighten these for production. ----------------------
resource "google_cloud_run_v2_service_iam_member" "public" {
  for_each = {
    toolbox  = google_cloud_run_v2_service.toolbox.name
    backend  = google_cloud_run_v2_service.backend.name
    read_api = google_cloud_run_v2_service.read_api.name
    frontend = google_cloud_run_v2_service.frontend.name
  }
  name     = each.value
  location = var.region
  role     = "roles/run.invoker"
  member   = "allUsers"
}
