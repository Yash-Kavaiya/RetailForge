output "frontend_url" {
  description = "Public URL of the RetailForge storefront."
  value       = google_cloud_run_v2_service.frontend.uri
}

output "backend_url" {
  description = "AG-UI agent backend URL."
  value       = google_cloud_run_v2_service.backend.uri
}

output "read_api_url" {
  description = "Storefront read API URL."
  value       = google_cloud_run_v2_service.read_api.uri
}

output "toolbox_url" {
  description = "MCP Toolbox URL."
  value       = google_cloud_run_v2_service.toolbox.uri
}
