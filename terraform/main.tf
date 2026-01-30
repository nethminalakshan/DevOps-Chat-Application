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
  cidr_block = "10.0.0.0/16"
  tags = {
    Name = "chat-app-vpc"
  }
}

# Subnets
resource "aws_subnet" "public_subnet" {
  vpc_id     = aws_vpc.chat_app_vpc.id
  cidr_block = "10.0.1.0/24"
  availability_zone = "${var.aws_region}a"
  map_public_ip_on_launch = true
  tags = {
    Name = "chat-app-public-subnet"
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

resource "aws_route_table_association" "public_rta" {
  subnet_id      = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.public_rt.id
}

# Security Group
resource "aws_security_group" "chat_app_sg" {
  vpc_id = aws_vpc.chat_app_vpc.id
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # Frontend port
  }
  ingress {
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # Backend port
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
          value = "http://localhost:3000" 
        },
        {
          name  = "GOOGLE_CLIENT_ID"
          value = "dummy-google-client-id"
        },
        {
          name  = "GOOGLE_CLIENT_SECRET"
          value = "dummy-google-secret"
        },
        {
          name  = "GOOGLE_CALLBACK_URL"
          value = "http://localhost:5000/api/auth/google/callback"
        },
        {
          name  = "GITHUB_CLIENT_ID"
          value = "dummy-github-client-id"
        },
        {
          name  = "GITHUB_CLIENT_SECRET"
          value = "dummy-github-secret"
        },
        {
          name  = "GITHUB_CALLBACK_URL"
          value = "http://localhost:5000/api/auth/github/callback"
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
          containerPort = 3000
          hostPort      = 3000
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
    subnets          = [aws_subnet.public_subnet.id]
    security_groups  = [aws_security_group.chat_app_sg.id]
    assign_public_ip = true
  }

  depends_on = [aws_iam_role_policy_attachment.ecs_execution_role_policy]
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