#!/bin/bash

echo "=== AWS DEPLOYMENT DIAGNOSTICS ==="
echo ""

cd "/mnt/d/Projects/Academic Project/Semester 5/DevOps-Chat-Application/DevOps-Chat-Application/terraform"

echo "1. Checking ECS Service Status..."
echo "=================================="
aws ecs describe-services \
  --cluster chat-app-cluster \
  --services chat-app-service \
  --region us-east-1 \
  --query 'services[0].{Status:status,Running:runningCount,Desired:desiredCount,LoadBalancers:loadBalancers}' \
  --output json

echo ""
echo "2. Checking Load Balancers..."
echo "=================================="
aws elbv2 describe-load-balancers \
  --region us-east-1 \
  --query 'LoadBalancers[?contains(LoadBalancerName,`chat`)].{Name:LoadBalancerName,DNS:DNSName,State:State.Code}' \
  --output json

echo ""
echo "3. Checking Terraform Outputs..."
echo "=================================="
terraform output

echo ""
echo "4. Checking ECS Tasks..."
echo "=================================="
aws ecs list-tasks \
  --cluster chat-app-cluster \
  --region us-east-1 \
  --output json

echo ""
echo "5. Checking Target Groups..."
echo "=================================="
aws elbv2 describe-target-groups \
  --region us-east-1 \
  --query 'TargetGroups[?contains(TargetGroupName,`chat`)].{Name:TargetGroupName,Port:Port,Health:HealthCheckPath}' \
  --output json

echo ""
echo "=== DIAGNOSIS COMPLETE ==="
