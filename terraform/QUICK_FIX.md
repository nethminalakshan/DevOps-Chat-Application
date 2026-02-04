# AWS Deployment Quick Reference

## ✅ PROBLEM CONFIRMED

Your diagnostic results show:
- ✅ **ECS Service**: ACTIVE (1 task running)
- ❌ **Load Balancer**: MISSING
- ❌ **Target Groups**: MISSING  
- ❌ **No Public Access**: Application not accessible from internet

**Root Cause**: Infrastructure incomplete - ALB and networking components were never created or were destroyed.

---

## 🚀 QUICK FIX (Recommended)

### Run the automated fix script:

```bash
cd "/mnt/d/Projects/Academic Project/Semester 5/DevOps-Chat-Application/DevOps-Chat-Application/terraform"
bash fix-deployment.sh
```

This will:
1. Destroy incomplete infrastructure
2. Rebuild everything correctly
3. Deploy your application with public access

**Time**: ~10 minutes

---

## 🛠️ MANUAL FIX (Alternative)

If you prefer manual control:

### Step 1: Destroy Current Resources

```bash
cd "/mnt/d/Projects/Academic Project/Semester 5/DevOps-Chat-Application/DevOps-Chat-Application/terraform"
wsl terraform destroy -auto-approve
```

### Step 2: Rebuild Infrastructure

```bash
wsl terraform apply -auto-approve
```

### Step 3: Get Your Application URL

```bash
wsl terraform output frontend_url
```

### Step 4: Update OAuth Callbacks

Update these with your new ALB DNS:

**Google OAuth**:
- Go to: https://console.cloud.google.com/apis/credentials
- Client ID: `563521387761-s6008ucnkmnq9hst7799kp0is89n56b6.apps.googleusercontent.com`
- Add authorized origins and redirect URIs with new ALB DNS

**GitHub OAuth**:
- Go to: https://github.com/settings/developers
- Update homepage URL and callback URL with new ALB DNS

### Step 5: Update terraform.tfvars

Replace old URLs with new ALB DNS in `terraform.tfvars`

### Step 6: Apply Updated Config

```bash
wsl terraform apply -auto-approve
```

---

## 📊 MONITORING

### Check ECS Service Status

```bash
wsl aws ecs describe-services --cluster chat-app-cluster --services chat-app-service --region us-east-1
```

### View Application Logs

```bash
# Backend logs
wsl aws logs tail /ecs/chat-app --region us-east-1 --follow --filter-pattern backend

# Frontend logs  
wsl aws logs tail /ecs/chat-app --region us-east-1 --follow --filter-pattern frontend
```

### Check ALB Health

```bash
wsl aws elbv2 describe-load-balancers --region us-east-1
```

### Check Target Health

```bash
wsl aws elbv2 describe-target-groups --region us-east-1
```

---

## 🔍 TROUBLESHOOTING

### If Tasks Keep Restarting

Check logs for errors:
```bash
wsl aws logs tail /ecs/chat-app --region us-east-1 --follow
```

Common causes:
- MongoDB connection failed
- Docker images not found
- Missing environment variables

### If Targets Unhealthy

Check health check configuration in main.tf:
- Frontend: Health check on `/` expecting HTTP 200
- Backend: Health check on `/api/health` expecting HTTP 200 or 404

### If Can't Access Application

Wait 2-3 minutes after deployment for:
- DNS propagation
- Tasks to start and pass health checks
- ALB to register targets

---

## 💰 COST MANAGEMENT

Current deployment costs ~$40-50/month:
- ECS Fargate: ~$1/day
- ALB: ~$18-20/month
- Data transfer: Minimal

**To minimize costs:**
```bash
# Destroy when not in use
wsl terraform destroy -auto-approve

# Recreate when needed
wsl terraform apply -auto-approve
```

---

## 📦 VERIFY PREREQUISITES

### Check Docker Images Exist

Visit Docker Hub and ensure these exist:
- https://hub.docker.com/r/nlh29060/chat-app-frontend
- https://hub.docker.com/r/nlh29060/chat-app-backend

Tag should be: `latest`

### Check MongoDB Access

Ensure MongoDB Atlas allows connections from `0.0.0.0/0`:
- Go to: https://cloud.mongodb.com
- Network Access → Add IP Address → Allow Access from Anywhere

### Verify AWS Credentials

```bash
wsl aws sts get-caller-identity
```

Should show your AWS account info.

---

## 🎯 EXPECTED OUTCOME

After successful rebuild, you'll have:

✅ **VPC** with 2 public subnets  
✅ **Application Load Balancer** (public-facing)  
✅ **Target Groups** for frontend (port 80) and backend (port 5000)  
✅ **ECS Cluster** with Fargate tasks  
✅ **ECS Service** connected to ALB  
✅ **Public URL** accessible from browser

**Access:**
- Frontend: `http://chat-app-alb-XXXXXXXXX.us-east-1.elb.amazonaws.com`
- Backend API: `http://chat-app-alb-XXXXXXXXX.us-east-1.elb.amazonaws.com:5000`

---

## 🆘 STILL HAVING ISSUES?

Run diagnostics again:
```bash
bash diagnose.sh
```

Check for:
- All resources created (no empty arrays)
- ECS service running (desired = running)
- Tasks healthy and passing health checks
- Terraform outputs showing valid URLs

For detailed help, see: `AWS_TROUBLESHOOTING_GUIDE.md`

---

**Good luck! 🚀**
