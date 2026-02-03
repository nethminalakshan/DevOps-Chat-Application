variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "docker_hub_username" {
  description = "Docker Hub username"
  type        = string
  default     = "nlh29060"
}

variable "image_tag" {
  description = "Docker image tag to deploy"
  type        = string
  default     = "latest"
}

variable "mongodb_uri" {
  description = "MongoDB Connection URI"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT Secret Key"
  type        = string
  sensitive   = true
}

variable "client_url" {
  description = "Frontend client URL (use AWS public IP)"
  type        = string
  default     = "http://localhost:3000"
}

variable "google_client_id" {
  description = "Google OAuth Client ID"
  type        = string
  default     = ""
}

variable "google_client_secret" {
  description = "Google OAuth Client Secret"
  type        = string
  sensitive   = true
  default     = ""
}

variable "google_callback_url" {
  description = "Google OAuth Callback URL"
  type        = string
  default     = "http://localhost:5000/api/auth/google/callback"
}

variable "github_client_id" {
  description = "GitHub OAuth Client ID"
  type        = string
  default     = ""
}

variable "github_client_secret" {
  description = "GitHub OAuth Client Secret"
  type        = string
  sensitive   = true
  default     = ""
}

variable "github_callback_url" {
  description = "GitHub OAuth Callback URL"
  type        = string
  default     = "http://localhost:5000/api/auth/github/callback"
}