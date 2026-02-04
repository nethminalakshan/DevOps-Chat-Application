#!/bin/bash
# Import existing AWS resources into Terraform state

echo "Importing existing AWS resources into Terraform state..."

# Import VPC
echo "Importing VPC..."
terraform import aws_vpc.chat_app_vpc vpc-086b18acc0478df79 || true

# Import Subnets
echo "Importing subnets..."
terraform import aws_subnet.public_subnet_a subnet-09488308289cc8156 || true
terraform import aws_subnet.public_subnet_b subnet-008d28b5dd4479b0e || true

# Import Internet Gateway
echo "Importing internet gateway..."
terraform import aws_internet_gateway.igw igw-0562d34daa78a21b9 || true

# Import Route Table
echo "Importing route table..."
terraform import aws_route_table.public_rt rtb-08bb10a7670e4a741 || true
terraform import aws_route_table_association.public_rta_a rtbassoc-0e313c86ed15c4d39 || true
terraform import aws_route_table_association.public_rta_b rtbassoc-02d054a94f6f486c6 || true

# Import Security Groups
echo "Importing security groups..."
terraform import aws_security_group.alb_sg sg-0a21bba967aa0fb52 || true
terraform import aws_security_group.chat_app_sg sg-0e7f5d82e6fc93aef || true

# Import Load Balancer and Target Groups
echo "Importing ALB..."
terraform import aws_lb.chat_app_alb arn:aws:elasticloadbalancing:us-east-1:524485341592:loadbalancer/app/chat-app-alb/29b439760d485c8a || true
terraform import aws_lb_target_group.frontend_tg arn:aws:elasticloadbalancing:us-east-1:524485341592:targetgroup/chat-frontend-tg/12cb5370d485c8a || true
terraform import aws_lb_target_group.backend_tg arn:aws:elasticloadbalancing:us-east-1:524485341592:targetgroup/chat-backend-tg/db6528b53a1eaa05 || true
terraform import aws_lb_listener.frontend_listener arn:aws:elasticloadbalancing:us-east-1:524485341592:listener/app/chat-app-alb/29b439760d485c8a/00c08ef4d3fc2f01 || true
terraform import aws_lb_listener.backend_listener arn:aws:elasticloadbalancing:us-east-1:524485341592:listener/app/chat-app-alb/29b439760d485c8a/8e3f3a8536a418db || true

# Import ECS Resources
echo "Importing ECS cluster..."
terraform import aws_ecs_cluster.chat_app_cluster arn:aws:ecs:us-east-1:524485341592:cluster/chat-app-cluster || true
terraform import aws_ecs_task_definition.chat_app_task chat-app-task || true
terraform import aws_ecs_service.chat_app_service arn:aws:ecs:us-east-1:524485341592:service/chat-app-cluster/chat-app-service || true

# Import IAM Role
echo "Importing IAM role..."
terraform import aws_iam_role.ecs_execution_role ecs_execution_role || true
terraform import aws_iam_role_policy_attachment.ecs_execution_role_policy ecs_execution_role-20260204070446904600000001 || true

# Import CloudWatch Log Group
echo "Importing CloudWatch log group..."
terraform import aws_cloudwatch_log_group.chat_app_logs /ecs/chat-app || true

echo "Import complete!"
echo "Run 'terraform plan' to verify state"
