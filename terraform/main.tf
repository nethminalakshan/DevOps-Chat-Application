terraform {
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

# VPC
resource "aws_vpc" "chat_app_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = {
    Name = "chat-app-vpc"
  }
}

# Subnets (need 2 public subnets for ALB)
resource "aws_subnet" "public_subnet_a" {
  vpc_id                  = aws_vpc.chat_app_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true
  tags = {
    Name = "chat-app-public-subnet-a"
  }
}

resource "aws_subnet" "public_subnet_b" {
  vpc_id                  = aws_vpc.chat_app_vpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "${var.aws_region}b"
  map_public_ip_on_launch = true
  tags = {
    Name = "chat-app-public-subnet-b"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.chat_app_vpc.id
  tags = {
    Name = "chat-app-igw"
  }
}

# Route Table
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.chat_app_vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
  tags = {
    Name = "chat-app-public-rt"
  }
}

resource "aws_route_table_association" "public_rta_a" {
  subnet_id      = aws_subnet.public_subnet_a.id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_route_table_association" "public_rta_b" {
  subnet_id      = aws_subnet.public_subnet_b.id
  route_table_id = aws_route_table.public_rt.id
}

# Security Group
resource "aws_security_group" "alb_sg" {
  name        = "chat-app-alb-sg"
  description = "ALB security group"
  vpc_id      = aws_vpc.chat_app_vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 5000
    to_port     = 5000
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

resource "aws_security_group" "chat_app_sg" {
  vpc_id = aws_vpc.chat_app_vpc.id
  # Only allow traffic from ALB to containers
  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }
  ingress {
    from_port       = 5000
    to_port         = 5000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = {
    Name = "chat-app-sg"
  }
}

# Application Load Balancer and Target Groups
resource "aws_lb" "chat_app_alb" {
  name               = "chat-app-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = [aws_subnet.public_subnet_a.id, aws_subnet.public_subnet_b.id]
}

resource "aws_lb_target_group" "frontend_tg" {
  name        = "chat-frontend-tg"
  port        = 80
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.chat_app_vpc.id
  health_check {
    path                = "/"
    protocol            = "HTTP"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }
}

resource "aws_lb_target_group" "backend_tg" {
  name        = "chat-backend-tg"
  port        = 5000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.chat_app_vpc.id
  health_check {
    path                = "/api/health"
    protocol            = "HTTP"
    matcher             = "200,404"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }
}

resource "aws_lb_listener" "frontend_listener" {
  load_balancer_arn = aws_lb.chat_app_alb.arn
  port              = 80
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend_tg.arn
  }
}

resource "aws_lb_listener" "backend_listener" {
  load_balancer_arn = aws_lb.chat_app_alb.arn
  port              = 5000
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend_tg.arn
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "chat_app_cluster" {
  name = "chat-app-cluster"
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "chat_app_logs" {
  name              = "/ecs/chat-app"
  retention_in_days = 7
}

# Task Definition
resource "aws_ecs_task_definition" "chat_app_task" {
  family                   = "chat-app-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn

  container_definitions = jsonencode([
    {
      name  = "backend"
      image = "${var.docker_hub_username}/chat-app-backend:${var.image_tag}"
      portMappings = [
        {
          containerPort = 5000
          hostPort      = 5000
        }
      ]
      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "MONGODB_URI"
          value = var.mongodb_uri
        },
        {
          name  = "JWT_SECRET"
          value = var.jwt_secret
        },
        {
          name  = "SESSION_SECRET"
          value = var.jwt_secret
        },
        {
          name  = "CLIENT_URL"
          value = "http://${aws_lb.chat_app_alb.dns_name}"
        },
        {
          name  = "GOOGLE_CLIENT_ID"
          value = var.google_client_id
        },
        {
          name  = "GOOGLE_CLIENT_SECRET"
          value = var.google_client_secret
        },
        {
          name  = "GOOGLE_CALLBACK_URL"
          value = "http://${aws_lb.chat_app_alb.dns_name}:5000/api/auth/google/callback"
        },
        {
          name  = "GITHUB_CLIENT_ID"
          value = var.github_client_id
        },
        {
          name  = "GITHUB_CLIENT_SECRET"
          value = var.github_client_secret
        },
        {
          name  = "GITHUB_CALLBACK_URL"
          value = "http://${aws_lb.chat_app_alb.dns_name}:5000/api/auth/github/callback"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/chat-app"
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "backend"
        }
      }
    },
    {
      name  = "frontend"
      image = "${var.docker_hub_username}/chat-app-frontend:${var.image_tag}"
      portMappings = [
        {
          containerPort = 80
          hostPort      = 80
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/chat-app"
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "frontend"
        }
      }
    }
  ])
}

# Service
resource "aws_ecs_service" "chat_app_service" {
  name            = "chat-app-service"
  cluster         = aws_ecs_cluster.chat_app_cluster.id
  task_definition = aws_ecs_task_definition.chat_app_task.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.public_subnet_a.id, aws_subnet.public_subnet_b.id]
    security_groups  = [aws_security_group.chat_app_sg.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.frontend_tg.arn
    container_name   = "frontend"
    container_port   = 80
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend_tg.arn
    container_name   = "backend"
    container_port   = 5000
  }

  depends_on = [aws_iam_role_policy_attachment.ecs_execution_role_policy]
}

# Helpful outputs
output "alb_dns_name" {
  description = "DNS name of the ALB"
  value       = aws_lb.chat_app_alb.dns_name
}

output "frontend_url" {
  value = "http://${aws_lb.chat_app_alb.dns_name}"
}

output "google_callback_url" {
  value = "http://${aws_lb.chat_app_alb.dns_name}:5000/api/auth/google/callback"
}

output "github_callback_url" {
  value = "http://${aws_lb.chat_app_alb.dns_name}:5000/api/auth/github/callback"
}

# IAM Role for ECS
resource "aws_iam_role" "ecs_execution_role" {
  name = "ecs_execution_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_execution_role_policy" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}