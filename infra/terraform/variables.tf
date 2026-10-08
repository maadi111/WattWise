variable "aws_region" {
  type        = string
  default     = "me-south-1"
  description = "AWS Bahrain region for data sovereignty"
}

variable "vpc_cidr" {
  type        = string
  default     = "10.0.0.0/16"
  description = "CIDR block for production VPC"
}

variable "db_password" {
  type        = string
  sensitive   = true
  description = "PostgreSQL administrator password"
}

variable "domain_name" {
  type        = string
  default     = "api.wattwise.pk"
  description = "Production API domain name for TLS termination"
}

variable "ecr_repository_url" {
  type        = string
  default     = "123456789012.dkr.ecr.me-south-1.amazonaws.com/wattwise-api"
  description = "ECR image repository URL"
}
