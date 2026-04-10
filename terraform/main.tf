terraform {
  backend "gcs" {
    bucket = "sandbox-project-443508-max-terraform-state"
    prefix = "terraform/state"
  }

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

resource "google_artifact_registry_repository" "app_repo" {
  location      = var.region
  repository_id = "${var.app_name}-repo"
  format        = "DOCKER"
  description   = "Docker images for ${var.app_name}"
}

resource "google_sql_database_instance" "app_db" {
  name             = "${var.app_name}-db"
  database_version = "POSTGRES_16"
  region           = var.region

  settings {
    tier = "db-f1-micro"

    ip_configuration {
      authorized_networks {
        value = "0.0.0.0/0"
        name  = "all"
      }
    }
  }

  deletion_protection = false
}

resource "google_sql_database" "app_database" {
  name     = "${var.app_name}_db"
  instance = google_sql_database_instance.app_db.name
}

resource "google_sql_user" "postgres" {
  name     = "postgres"
  instance = google_sql_database_instance.app_db.name
  password = var.db_password
}

resource "google_cloud_run_v2_service" "backend" {
  name     = "${var.app_name}-api"
  location = var.region

  template {
    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${var.app_name}-repo/${var.app_name}-api:latest"

      env {
        name  = "DB_HOST"
        value = google_sql_database_instance.app_db.public_ip_address
      }
      env {
        name  = "DB_PORT"
        value = "5432"
      }
      env {
        name  = "DB_NAME"
        value = "${var.app_name}_db"
      }
      env {
        name  = "DB_USER"
        value = "postgres"
      }
      env {
        name  = "DB_PASS"
        value = var.db_password
      }
      env {
        name  = "DB_DIALECT"
        value = "postgres"
      }
      env {
        name  = "JWT_SECRET"
        value = var.jwt_secret
      }
      env {
        name  = "TMDB_BEARER_TOKEN"
        value = var.api_key
      }
      env {
        name  = "NODE_ENV"
        value = "production"
      }
    }
  }

  depends_on = [google_artifact_registry_repository.app_repo]
}

resource "google_cloud_run_v2_service" "frontend" {
  name     = "${var.app_name}-frontend"
  location = var.region

  template {
    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${var.app_name}-repo/${var.app_name}-frontend:latest"

    }
  }

  depends_on = [google_artifact_registry_repository.app_repo]
}
