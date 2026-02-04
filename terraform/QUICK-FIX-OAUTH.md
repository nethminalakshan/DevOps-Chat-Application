# Quick Fix: OAuth & Database Issues

## Problem
- ❌ Google/GitHub authentication not working
- ❌ Database not fetching data
- ❌ Old IP addresses in configuration

## Solution

### Step 1: Wait for Terraform to Complete
```bash
# Currently running... wait for it to finish
# This takes 5-10 minutes
```

### Step 2: Get Your New ALB DNS Name
```bash
cd terraform
wsl bash update-oauth-urls.sh
```

This will:
- Extract the new ALB DNS name
- Update `terraform.tfvars` with correct URLs
- Show you what needs to be updated in Google/GitHub consoles

### Step 3: Update Google OAuth (REQUIRED!)

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID (563521387761-s6008ucnkmnq9hst7799kp0is89n56b6.apps.googleusercontent.com)
3. **Update Authorized JavaScript origins**:
   - Add: `http://YOUR-ALB-DNS`
   - Add: `http://YOUR-ALB-DNS:5000`
4. **Update Authorized redirect URIs**:
   - Add: `http://YOUR-ALB-DNS:5000/api/auth/google/callback`
5. Click **Save**

### Step 4: Update GitHub OAuth (REQUIRED!)

1. Go to: https://github.com/settings/developers
2. Find your OAuth App
3. **Update Homepage URL**: `http://YOUR-ALB-DNS`
4. **Update Authorization callback URL**: `http://YOUR-ALB-DNS:5000/api/auth/github/callback`
5. Click **Update application**

### Step 5: Redeploy with New URLs
```bash
cd /mnt/d/Projects/Academic\ Project/Semester\ 5/DevOps-Chat-Application/DevOps-Chat-Application/terraform
terraform apply -auto-approve
```

Wait 3-5 minutes for deployment.

### Step 6: Test Your Application

```bash
# Get the URL
terraform output frontend_url

# Access in browser
http://YOUR-ALB-DNS
```

## Database Issue

Your MongoDB connection is correctly configured:
```
mongodb+srv://nethminalakshan:nethminalakshan@cluster0.otpfy.mongodb.net/chat-app
```

If database still not working:
1. Check MongoDB Atlas network access allows `0.0.0.0/0`
2. Check CloudWatch logs for connection errors:
   ```bash
   wsl aws logs tail /ecs/chat-app --region us-east-1 --follow
   ```

## Troubleshooting

### Check ECS Service Status
```bash
wsl aws ecs describe-services \
  --cluster chat-app-cluster \
  --services chat-app-service \
  --region us-east-1
```

### View Container Logs
```bash
# Backend logs
wsl aws logs tail /ecs/chat-app --region us-east-1 --filter-pattern backend --follow

# Frontend logs
wsl aws logs tail /ecs/chat-app --region us-east-1 --filter-pattern frontend --follow
```

### Check ALB Health
```bash
wsl aws elbv2 describe-target-health \
  --target-group-arn $(aws elbv2 describe-target-groups --region us-east-1 --query 'TargetGroups[?contains(TargetGroupName, `chat`)].TargetGroupArn' --output text) \
  --region us-east-1
```

## Quick Commands Reference

```bash
# Get all outputs
wsl terraform output

# Get just the frontend URL
wsl terraform output frontend_url

# Restart ECS service (if needed)
wsl aws ecs update-service \
  --cluster chat-app-cluster \
  --service chat-app-service \
  --force-new-deployment \
  --region us-east-1
```
