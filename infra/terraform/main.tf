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

  backend "s3" {
    bucket         = "wattwise-terraform-state-bahrain"
    key            = "prod/terraform.tfstate"
    region         = "me-south-1"
    dynamodb_table = "wattwise-terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
}

# 1. S3 Immutable Bucket for Sensor Snapshots & Telemetry
resource "aws_s3_bucket" "sensor_archive" {
  bucket = "wattwise-telemetry-archive-bahrain"
}

resource "aws_s3_bucket_versioning" "sensor_archive_versioning" {
  bucket = aws_s3_bucket.sensor_archive.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "sensor_archive_crypto" {
  bucket = aws_s3_bucket.sensor_archive.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
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

# 2. RDS Aurora PostgreSQL 16 Multi-AZ (Production Hardened)
resource "aws_db_instance" "postgres" {
  identifier                = "wattwise-prod-db"
  allocated_storage         = 50
  max_allocated_storage     = 500
  engine                    = "postgres"
  engine_version            = "16.1"
  instance_class            = "db.t4g.small"
  db_name                   = "wattwise"
  username                  = "ww"
  password                  = var.db_password
  multi_az                  = true
  storage_encrypted         = true
  
  # Protection & Snapshot Policies
  deletion_protection       = true
  skip_final_snapshot       = false
  final_snapshot_identifier = "wattwise-prod-db-final-snapshot"

  # Backup Configuration (30-day retention)
  backup_retention_period   = 30
  backup_window             = "03:00-05:00"
  maintenance_window        = "Sun:05:00-Sun:07:00"

  # Structured Logs Export
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
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

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# 5. Structured Logging: CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "api_logs" {
  name              = "/ecs/wattwise-api"
  retention_in_days = 90
}

resource "aws_cloudwatch_log_group" "ingest_logs" {
  name              = "/ecs/wattwise-ingest"
  retention_in_days = 90
}

# 6. TLS Certificate & HTTPS Load Balancer
resource "aws_acm_certificate" "tls" {
  domain_name       = var.domain_name
  validation_method = "DNS"

  tags = {
    Environment = "production"
    ManagedBy   = "Terraform"
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_security_group" "alb" {
  name        = "wattwise-alb-sg"
  description = "Allow inbound HTTPS/HTTP to ALB"
  vpc_id      = var.vpc_id

  ingress {
    description = "Allow HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Allow HTTP for redirect to HTTPS"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_lb" "main" {
  name               = "wattwise-prod-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = var.public_subnet_ids

  enable_deletion_protection = true

  tags = {
    Environment = "production"
  }
}

resource "aws_lb_target_group" "api" {
  name        = "wattwise-api-tg"
  port        = 8080
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    path                = "/healthz"
    port                = "8080"
    protocol            = "HTTP"
    matcher             = "200"
    interval            = 15
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = aws_acm_certificate.tls.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }
}

resource "aws_lb_listener" "http_redirect" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# 7. Production Observability: CloudWatch Metric Alarms
resource "aws_cloudwatch_metric_alarm" "db_cpu_high" {
  alarm_name          = "wattwise-rds-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Triggers if RDS CPU exceeds 80% for 10 minutes"
  dimensions = {
    DBInstanceIdentifier = aws_db_instance.postgres.identifier
  }
}

resource "aws_cloudwatch_metric_alarm" "alb_5xx_errors" {
  alarm_name          = "wattwise-alb-5xx-spike"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "Triggers if ALB detects >10 HTTP 5XX responses in 1 minute"
  dimensions = {
    LoadBalancer = aws_lb.main.arn_suffix
  }
}

