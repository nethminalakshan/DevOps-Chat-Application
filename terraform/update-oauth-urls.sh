#!/bin/bash

# Get ALB DNS name from Terraform output
ALB_DNS=$(terraform output -raw alb_dns_name 2>/dev/null)

if [ -z "$ALB_DNS" ]; then
    echo "❌ Error: Could not get ALB DNS name from Terraform"
    echo "Make sure Terraform has been applied successfully"
    exit 1
fi

echo "✅ Found ALB DNS: $ALB_DNS"

# Update terraform.tfvars
echo ""
echo "Updating terraform.tfvars with new URLs..."

# Backup original file
cp terraform.tfvars terraform.tfvars.backup

# Update client_url
sed -i "s|client_url.*=.*|client_url = \"http://$ALB_DNS\"|g" terraform.tfvars

# Update OAuth callback URLs
sed -i "s|google_callback_url.*=.*|google_callback_url  = \"http://$ALB_DNS:5000/api/auth/google/callback\"|g" terraform.tfvars
sed -i "s|github_callback_url.*=.*|github_callback_url  = \"http://$ALB_DNS:5000/api/auth/github/callback\"|g" terraform.tfvars

echo "✅ terraform.tfvars updated!"
echo ""
echo "📋 New URLs:"
echo "   Frontend URL: http://$ALB_DNS"
echo "   Backend URL:  http://$ALB_DNS:5000"
echo "   Google Callback: http://$ALB_DNS:5000/api/auth/google/callback"
echo "   GitHub Callback: http://$ALB_DNS:5000/api/auth/github/callback"
echo ""
echo "⚠️  IMPORTANT: You must update these callback URLs in:"
echo "   1. Google Cloud Console (https://console.cloud.google.com/apis/credentials)"
echo "   2. GitHub OAuth Apps (https://github.com/settings/developers)"
echo ""
echo "Then run: terraform apply -auto-approve"
