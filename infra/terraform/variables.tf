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
