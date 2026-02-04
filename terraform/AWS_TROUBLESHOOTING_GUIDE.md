# 🚨 AWS Deployment Troubleshooting Guide

## Current Status Analysis

Based on Terraform state analysis, your deployment has **critical infrastructure issues**:

### ❌ **Problems Identified**

1. **Load Balancer Missing**: ALB resources were destroyed or never created
   - No `aws_lb` (Application Load Balancer) in state
   - No `aws_lb_target_group` resources
   - No `aws_lb_listener` resources

2. **ECS Service Not Connected**: 
   - Service exists but `load_balancer` configuration is empty `[]`
   - Containers are running but not receiving traffic

3. **Infrastructure Drift**:
   - Only 1 subnet created (should be 2 for ALB)
   - Missing route table associations
   - Incomplete networking setup

4. **No Public Access**:
   - Without ALB, there's no way to access your application
   - Containers don't have direct public IPs for HTTP traffic

---

## 🔧 **SOLUTION: Complete Infrastructure Rebuild**

### **Option 1: Clean Rebuild (RECOMMENDED)**

This will destroy everything and rebuild correctly.

#### Step 1: Destroy Current Infrastructure

```bash
# Navigate to terraform directory
cd "d:\Projects\Academic Project\Semester 5\DevOps-Chat-Application\DevOps-Chat-Application\terraform"

# Install Terraform if not already installed
# Download from: https://www.terraform.io/downloads
# Add to PATH

# Destroy existing resources
terraform destroy -auto-approve
```

**What this destroys:**
- ECS cluster and service
- VPC and networking
- Security groups
- IAM roles
- CloudWatch logs

**What is NOT destroyed:**
- Docker images in Docker Hub
- MongoDB data (it's external)
- Your code and Terraform files

#### Step 2: Verify Clean State

```bash
# Check state is empty
terraform state list

# Should return nothing or very few resources
```

#### Step 3: Rebuild Everything

```bash
# Initialize Terraform (if needed)
terraform init

# Preview what will be created
terraform plan

# Create all resources
terraform apply -auto-approve
```

**This will create:**
✅ VPC with DNS support
✅ 2 Public subnets in different AZs
✅ Internet Gateway
✅ Route tables and associations
✅ Security groups (ALB + ECS)
✅ Application Load Balancer
✅ Target groups (frontend + backend)
✅ ALB listeners (port 80 + 5000)
✅ ECS cluster
✅ ECS task definition
✅ ECS service with ALB integration
✅ IAM roles for ECS
✅ CloudWatch log groups

**Time required:** 5-10 minutes

#### Step 4: Get Your Application URL

```bash
# Get the ALB DNS name
terraform output alb_dns_name

# Get the complete frontend URL
terraform output frontend_url
```

You'll get something like:
```
http://chat-app-alb-1234567890.us-east-1.elb.amazonaws.com
```

#### Step 5: Update OAuth Callback URLs

Your application uses OAuth, so you MUST update the callback URLs:

##### **Google OAuth**
1. Go to: https://console.cloud.google.com/apis/credentials
2. Find client ID: `563521387761-s6008ucnkmnq9hst7799kp0is89n56b6.apps.googleusercontent.com`
3. Add to **Authorized JavaScript origins**:
   ```
   http://chat-app-alb-XXXXXXXXXX.us-east-1.elb.amazonaws.com
   http://chat-app-alb-XXXXXXXXXX.us-east-1.elb.amazonaws.com:5000
   ```
4. Add to **Authorized redirect URIs**:
   ```
   http://chat-app-alb-XXXXXXXXXX.us-east-1.elb.amazonaws.com:5000/api/auth/google/callback
   ```

##### **GitHub OAuth**
1. Go to: https://github.com/settings/developers
2. Update **Homepage URL**:
   ```
   http://chat-app-alb-XXXXXXXXXX.us-east-1.elb.amazonaws.com
   ```
3. Update **Authorization callback URL**:
   ```
   http://chat-app-alb-XXXXXXXXXX.us-east-1.elb.amazonaws.com:5000/api/auth/github/callback
   ```

#### Step 6: Update terraform.tfvars with New URLs

Replace the old IP addresses in `terraform.tfvars` with your new ALB DNS:

```hcl
client_url = "http://YOUR-NEW-ALB-DNS"
google_callback_url = "http://YOUR-NEW-ALB-DNS:5000/api/auth/google/callback"
github_callback_url = "http://YOUR-NEW-ALB-DNS:5000/api/auth/github/callback"
```

#### Step 7: Apply Updated Configuration

```bash
terraform apply -auto-approve
```

This will update the environment variables in your containers with the correct URLs.

#### Step 8: Wait for Deployment

```bash
# Check ECS service status
# You'll need AWS CLI installed and configured
aws ecs describe-services --cluster chat-app-cluster --services chat-app-service --region us-east-1 --query 'services[0].deployments'

# Wait until desiredCount = runningCount
```

#### Step 9: Test Your Application

```bash
# Open in browser
terraform output frontend_url | clip  # Copies URL to clipboard
```

Then paste in browser and test!

---

### **Option 2: Targeted Fix (If You Want to Keep Data)**

If you absolutely need to keep CloudWatch logs or want to try to fix without destroying:

#### Step 1: Import Missing Resources

First, check what exists in AWS:

```bash
# List all load balancers
aws elbv2 describe-load-balancers --region us-east-1

# List target groups
aws elbv2 describe-target-groups --region us-east-1
```

If they exist, import them:

```bash
# Import ALB
terraform import aws_lb.chat_app_alb <ALB_ARN>

# Import target groups
terraform import aws_lb_target_group.frontend_tg <FRONTEND_TG_ARN>
terraform import aws_lb_target_group.backend_tg <BACKEND_TG_ARN>
```

#### Step 2: Fix ECS Service

```bash
# Force new deployment with correct configuration
terraform taint aws_ecs_service.chat_app_service
terraform apply -auto-approve
```

---

## 🔍 **Diagnostics & Monitoring**

### Check ECS Task Status

```powershell
# Using PowerShell (Windows)
aws ecs list-tasks --cluster chat-app-cluster --region us-east-1

# Get task details
aws ecs describe-tasks --cluster chat-app-cluster --tasks <TASK_ARN> --region us-east-1
```

### View Container Logs

```powershell
# Backend logs
aws logs tail /ecs/chat-app --region us-east-1 --follow --filter-pattern "backend"

# Frontend logs
aws logs tail /ecs/chat-app --region us-east-1 --follow --filter-pattern "frontend"
```

### Check ALB Health

```powershell
# Get target group ARN
aws elbv2 describe-target-groups --region us-east-1 --query 'TargetGroups[?contains(TargetGroupName, `chat`)].TargetGroupArn' --output text

# Check target health
aws elbv2 describe-target-health --target-group-arn <TARGET_GROUP_ARN> --region us-east-1
```

### Common Health Check Failures

**Backend Target Unhealthy:**
- Health check path: `/api/health`
- Make sure your backend responds with HTTP 200 on this endpoint
- Check if port 5000 is accessible
- Review backend logs for errors

**Frontend Target Unhealthy:**
- Health check path: `/`
- Make sure nginx is serving the built React app
- Check for nginx configuration errors
- Review frontend logs

---

## 📋 **Pre-Deployment Checklist**

Before running `terraform apply`, verify:

- [ ] AWS credentials configured (`aws configure`)
- [ ] Terraform installed (v1.0+)
- [ ] Docker images exist:
  - [ ] `nlh29060/chat-app-frontend:latest`
  - [ ] `nlh29060/chat-app-backend:latest`
- [ ] MongoDB Atlas accessible from AWS (network access: `0.0.0.0/0`)
- [ ] OAuth credentials are valid
- [ ] `terraform.tfvars` has all required variables

### Verify Docker Images

```powershell
# Check if images exist on Docker Hub
# Visit: https://hub.docker.com/u/nlh29060

# Or manually
# https://hub.docker.com/r/nlh29060/chat-app-frontend
# https://hub.docker.com/r/nlh29060/chat-app-backend
```

---

## 🐛 **Common Errors & Solutions**

### Error: "Container failed to start"

**Check:**
```bash
aws logs tail /ecs/chat-app --region us-east-1 --follow
```

**Common causes:**
- Docker image doesn't exist or wrong tag
- Missing environment variables
- Application crashes on startup
- MongoDB connection failed

### Error: "No healthy targets"

**Causes:**
- Health check failing
- Security groups blocking traffic
- Application not listening on correct port

**Fix:**
```bash
# Check security groups allow:
# - Port 80 (frontend)
# - Port 5000 (backend)

# Update security groups if needed
terraform apply
```

### Error: "DNS name not resolving"

**Wait:** ALB DNS can take 2-3 minutes to propagate

**Verify:**
```bash
nslookup <YOUR-ALB-DNS>
```

---

## 📊 **Architecture Overview**

Your deployed infrastructure:

```
Internet
    ↓
Application Load Balancer (ALB)
    ↓ (Port 80)        ↓ (Port 5000)
    ↓                  ↓
Frontend TG         Backend TG
    ↓                  ↓
[ECS Fargate Task]
    ├─ Frontend Container (nginx:80)
    └─ Backend Container (node:5000)
         ↓
    MongoDB Atlas (External)
```

**Network Flow:**
1. User → ALB (port 80) → Frontend container
2. Frontend → ALB (port 5000) → Backend container (via proxy)
3. Backend → MongoDB Atlas (external)
4. Backend → Socket.io (WebSocket on port 5000)

---

## 💰 **Cost Considerations**

Your deployment costs (approximate):

- **ECS Fargate**: ~$0.04/hour × 24 = ~$1/day
- **Application Load Balancer**: ~$0.025/hour + data = ~$18-20/month
- **Data Transfer**: Variable (minimal for development)
- **CloudWatch Logs**: ~$0.50/GB

**Total estimate:** ~$40-50/month

**To minimize costs:**
- Run only when needed
- Delete when not in use: `terraform destroy`
- Use AWS Free Tier (12 months)

---

## 🎯 **Next Steps After Deployment**

1. **Test all features:**
   - [ ] User registration/login
   - [ ] Google OAuth
   - [ ] GitHub OAuth
   - [ ] Real-time messaging
   - [ ] File uploads

2. **Monitor:**
   - Check CloudWatch logs regularly
   - Monitor ECS service health
   - Track ALB metrics

3. **Optimize:**
   - Consider using HTTPS (ACM + Route53)
   - Enable Container Insights
   - Set up CloudWatch alarms

4. **Document:**
   - Save your ALB DNS name
   - Document OAuth callback URLs
   - Note down any custom configurations

---

## 🆘 **Still Not Working?**

If after following this guide your app still doesn't work:

1. **Collect diagnostics:**
```bash
# Save outputs
terraform output > deployment-outputs.txt

# Save service status
aws ecs describe-services --cluster chat-app-cluster --services chat-app-service --region us-east-1 > service-status.json

# Save recent logs
aws logs tail /ecs/chat-app --region us-east-1 --since 30m > app-logs.txt
```

2. **Check each layer:**
   - [ ] Terraform applied successfully
   - [ ] ECS service running (desired = running)
   - [ ] Tasks running and healthy
   - [ ] ALB targets healthy
   - [ ] Docker images exist and correct
   - [ ] Environment variables correct
   - [ ] MongoDB accessible
   - [ ] OAuth configured

3. **Common final checks:**
   - Clear browser cache
   - Try incognito/private window
   - Check browser console for errors
   - Verify network tab in DevTools

---

**Good luck! Your app should be running after these steps.** 🚀
