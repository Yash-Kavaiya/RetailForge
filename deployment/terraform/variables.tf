variable "project_id" {
  type        = string
  description = "Google Cloud project id."
}

variable "region" {
  type        = string
  description = "Cloud Run region."
  default     = "us-central1"
}

variable "mongodb_uri" {
  type        = string
  description = "MongoDB Atlas connection string (stored in Secret Manager)."
  sensitive   = true
}

variable "google_api_key" {
  type        = string
  description = "Gemini API key for embeddings + models (stored in Secret Manager)."
  sensitive   = true
}

variable "toolbox_image" {
  type        = string
  description = "Container image for the MCP Toolbox service (built from Dockerfile.toolbox)."
}

variable "backend_image" {
  type        = string
  description = "Container image for the agent + read API (built from Dockerfile.backend)."
}

variable "frontend_image" {
  type        = string
  description = "Container image for the Next.js storefront (built from Dockerfile.frontend)."
}

variable "sub_agent_model" {
  type    = string
  default = "gemini-2.5-flash"
}

variable "root_agent_model" {
  type    = string
  default = "gemini-2.5-flash"
}
