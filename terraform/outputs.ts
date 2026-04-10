output "backend_url" {
  value = google_cloud_run_v2_service.backend.uri
}

output "frontend_url" {
  value = google_cloud_run_v2_service.frontend.uri
}

output "db_ip" {
  value = google_sql_database_instance.recipes_db.public_ip_address
}

output "github_actions_sa_email" {
  value = google_service_account.github_actions.email
}
