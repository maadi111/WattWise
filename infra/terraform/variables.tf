variable "aws_region" {
  type        = string
  default     = "me-south-1"
  description = "AWS Bahrain region for data sovereignty"
}

variable "db_password" {
  type        = string
  sensitive   = true
  description = "PostgreSQL administrator password"
}

variable "vpc_id" {
  type        = string
  default     = "vpc-0123456789abcdef0"
  description = "VPC ID for WattWise infrastructure"
}

variable "public_subnet_ids" {
  type        = list(string)
  default     = ["subnet-0123456789abcdef0", "subnet-0123456789abcdef1"]
  description = "Public subnet IDs for ALB"
}

variable "domain_name" {
  type        = string
  default     = "api.wattwise.pk"
  description = "Production API domain name for TLS termination"
}

