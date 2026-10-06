# Terraform AWS Infrastructure Definition
# Region: me-south-1 (Bahrain) for Pakistani Data Sovereignty
# From WattWise Production Guide (Sprint 6, Page 21, 23)

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# 1. S3 Immutable Bucket for Sensor Snapshots
resource "aws_s3_bucket" "sensor_archive" {
  bucket = "wattwise-telemetry-archive-bahrain"
}

resource "aws_s3_bucket_lifecycle_configuration" "glacier_archive" {
  bucket = aws_s3_bucket.sensor_archive.id

  rule {
    id     = "archive-to-glacier-after-90d"
    status = "Enabled"

    transition {
      days          = 90
      storage_class = "GLACIER"
    }
  }
}

# 2. RDS Aurora PostgreSQL 16 Multi-AZ
resource "aws_db_instance" "postgres" {
  identifier          = "wattwise-prod-db"
  allocated_storage   = 50
  engine              = "postgres"
  engine_version      = "16.1"
  instance_class      = "db.t4g.small"
  db_name             = "wattwise"
  username            = "ww"
  password            = var.db_password
  multi_az            = true
  skip_final_snapshot = true
  storage_encrypted   = true
}

# 3. ElastiCache Redis for Sessions and Rate Limiting
resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "wattwise-cache"
  engine               = "redis"
  node_type            = "cache.t4g.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
}

# 4. ECS Fargate Cluster for Go API & ML Service
resource "aws_ecs_cluster" "main" {
  name = "wattwise-cluster"
}
