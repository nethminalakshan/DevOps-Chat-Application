#!/bin/bash

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   AWS Chat Application - Infrastructure Fix Script        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

cd "/mnt/d/Projects/Academic Project/Semester 5/DevOps-Chat-Application/DevOps-Chat-Application/terraform"

echo "📋 CURRENT STATUS:"
echo "=================="
echo "✅ ECS Service: ACTIVE (1/1 tasks running)"
echo "❌ Load Balancer: MISSING"
echo "❌ Target Groups: MISSING"
echo "❌ Public Access: NO (application not accessible)"
echo ""

echo "🔧 RECOMMENDED FIX: Complete Infrastructure Rebuild"
echo "======================================================"
echo ""
echo "This will:"
echo "  1. Destroy all existing resources"
echo "  2. Rebuild complete infrastructure with ALB"
echo "  3. Deploy your application with public access"
echo ""

read -p "Do you want to proceed? (yes/no): " answer

if [[ "$answer" != "yes" ]]; then
    echo "❌ Operation cancelled"
    exit 0
fi

echo ""
echo "⚠️  IMPORTANT: This will temporarily take your application offline"
echo "   Estimated time: 5-10 minutes"
echo ""

read -p "Type 'CONFIRM' to continue: " confirm

if [[ "$confirm" != "CONFIRM" ]]; then
    echo "❌ Operation cancelled"
    exit 0
fi

echo ""
echo "🚀 Starting infrastructure rebuild..."
echo "======================================"
echo ""

# Step 1: Destroy existing resources
echo "Step 1/3: Destroying existing resources..."
echo "⏳ This may take 3-5 minutes..."
terraform destroy -auto-approve

if [ $? -ne 0 ]; then
    echo "❌ Destroy failed. Please check errors above."
    exit 1
fi

echo "✅ Resources destroyed successfully"
echo ""

# Step 2: Re-initialize Terraform
echo "Step 2/3: Initializing Terraform..."
terraform init

if [ $? -ne 0 ]; then
    echo "❌ Terraform init failed. Please check errors above."
    exit 1
fi

echo "✅ Terraform initialized"
echo ""

# Step 3: Create new infrastructure
echo "Step 3/3: Creating new infrastructure..."
echo "⏳ This may take 5-10 minutes..."
terraform apply -auto-approve

if [ $? -ne 0 ]; then
    echo "❌ Terraform apply failed. Please check errors above."
    echo ""
    echo "Common issues:"
    echo "  - Docker images not found (check Docker Hub)"
    echo "  - AWS credentials expired"
    echo "  - Missing environment variables in terraform.tfvars"
    exit 1
fi

echo ""
echo "✅ Infrastructure created successfully!"
echo ""

# Get outputs
echo "📊 DEPLOYMENT DETAILS:"
echo "======================"
terraform output

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================="
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1. Get your application URL:"
echo "   terraform output frontend_url"
echo ""
echo "2. Copy the ALB DNS name (will look like: chat-app-alb-XXXXXXXXX.us-east-1.elb.amazonaws.com)"
echo ""
echo "3. Update OAuth callback URLs:"
echo "   - Google: https://console.cloud.google.com/apis/credentials"
echo "   - GitHub: https://github.com/settings/developers"
echo ""
echo "4. Update terraform.tfvars with the new ALB DNS"
echo ""
echo "5. Run 'terraform apply' again to update environment variables"
echo ""
echo "⏳ Wait 2-3 minutes for the application to fully deploy, then test!"
echo ""
