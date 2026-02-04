# 🚀 Full CI/CD Automation Setup Guide

## 🎯 Goal: Fully Automated Workflow

**Target Workflow:**
```
Git Push → Jenkins → Build → Test → Docker Push → AWS Deploy → DONE! ✅
```

**Zero manual intervention required!**

---

## ⚡ **Step 1: Add AWS Credentials to Jenkins** (REQUIRED)

### **1.1 Get Your AWS Credentials**

You need your AWS Access Key ID and Secret Access Key.

**Option A: Use Existing Credentials**
If you already have AWS credentials configured in WSL, find them:

```bash
# In WSL
cat ~/.aws/credentials
```

You'll see:
```ini
[default]
aws_access_key_id = AKIAXXXXXXXXXXXXXXXX
aws_secret_access_key = XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Option B: Create New IAM User for Jenkins**

1. Go to AWS Console: https://console.aws.amazon.com/iam/
2. Click **Users** → **Create user**
3. User name: `jenkins-ci-cd`
4. Click **Next**
5. Attach policies:
   - `AmazonEC2ContainerRegistryFullAccess`
   - `AmazonECS_FullAccess`
   - `AmazonVPCFullAccess`
   - `IAMFullAccess` (for creating roles)
   - `AmazonEC2FullAccess`
   - `ElasticLoadBalancingFullAccess`
6. Click **Create user**
7. Click on the user → **Security credentials** → **Create access key**
8. Choose: **Application running outside AWS**
9. Click **Create access key**
10. **Copy both keys immediately!** (You won't see the secret again)

---

### **1.2 Add Credentials to Jenkins**

#### **Access Jenkins:**
```
http://localhost:8090
```

#### **Navigate to Credentials:**
1. Click **Manage Jenkins** (left sidebar)
2. Click **Credentials**
3. Click **(global)** under **Domains**
4. Click **Add Credentials** (left sidebar)

#### **Add AWS Credentials:**

**Step-by-step:**

1. **Kind:** Select **AWS Credentials**
2. **Scope:** Select **Global**
3. **ID:** Enter `aws-credentials` (EXACTLY this - it's used in Jenkinsfile)
4. **Description:** Enter `AWS Credentials for CI/CD`
5. **Access Key ID:** Paste your AWS Access Key ID
   - Example: `AKIAIOSFODNN7EXAMPLE`
6. **Secret Access Key:** Paste your AWS Secret Access Key  
   - Example: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`
7. Click **Create**

#### **Verify Credentials Added:**
- You should see `aws-credentials` in the credentials list
- ID should be exactly: `aws-credentials`

---

## 🔧 **Step 2: Install Required Jenkins Plugins** (if not already installed)

### **2.1 Check/Install AWS Plugin:**

1. Go to **Manage Jenkins** → **Plugins**
2. Click **Available plugins**
3. Search for: `CloudBees AWS Credentials`
4. Check the box and click **Install**
5. Restart Jenkins if prompted

### **2.2 Verify Plugin Installation:**

1. Go to **Manage Jenkins** → **Plugins** → **Installed plugins**
2. Search for: `CloudBees AWS Credentials`
3. Should be installed and enabled ✅

---

## 📝 **Step 3: Update Jenkinsfile** (ALREADY DONE!)

I've already updated your Jenkinsfile to:
- ✅ Use AWS credentials from Jenkins
- ✅ Automatically deploy to AWS after Docker push
- ✅ Show deployment status

**The pipeline now:**
1. Builds Docker images
2. Pushes to Docker Hub
3. **Automatically deploys to AWS** ✅
4. Shows application URL

---

## 🎬 **Step 4: Test Full Automation**

### **Commit and Push Updated Jenkinsfile:**

```bash
cd "d:\Projects\Academic Project\Semester 5\DevOps-Chat-Application\DevOps-Chat-Application"

# If git is installed in PowerShell
git add Jenkinsfile
git commit -m "Enable full CI/CD automation - automatic AWS deployment"
git push origin main

# OR using WSL
wsl git add Jenkinsfile
wsl git commit -m "Enable full CI/CD automation - automatic AWS deployment"  
wsl git push origin main
```

### **Watch Jenkins Build:**

1. Go to Jenkins: `http://localhost:8090`
2. Click on your pipeline
3. Watch the build progress

**Expected Stages:**
1. ✅ Checkout
2. ✅ Install Dependencies
3. ✅ Lint & Code Quality
4. ✅ Run Tests
5. ✅ Build Frontend
6. ✅ Build Docker Images
7. ✅ Security Scan
8. ✅ Push to Docker Hub
9. ✅ **Deploy to AWS (Terraform)** ⭐ NEW!
10. ✅ Deploy to Development/Production

**Build Time:** ~8-12 minutes (including AWS deployment)

---

## ✅ **What Happens Automatically**

### **When You Push to GitHub:**

```
1. GitHub detects push
   ↓
2. Jenkins webhook triggered (or poll)
   ↓
3. Jenkins starts build:
   - Checkout code ✅
   - Install dependencies ✅
   - Run tests ✅
   - Build frontend ✅
   - Build Docker images ✅
   - Push to Docker Hub ✅
   ↓
4. Jenkins runs Terraform:
   - Initialize Terraform ✅
   - Apply changes to AWS ✅
   - Update ECS tasks ✅
   - Show application URL ✅
   ↓
5. Your app is LIVE! 🎉
```

**Total time:** ~10 minutes from push to deployment

---

## 🐛 **Troubleshooting**

### **Error: "No valid credential sources found"**

**Cause:** AWS credentials not configured in Jenkins

**Fix:**
1. Verify credentials ID is exactly `aws-credentials`
2. Re-add credentials in Jenkins
3. Make sure CloudBees AWS Credentials plugin is installed

### **Error: "credentialsId 'aws-credentials' not found"**

**Cause:** Credentials ID mismatch

**Fix:**
1. Go to Jenkins → Credentials
2. Click on the AWS credential
3. Verify ID is exactly: `aws-credentials` (no capitals, no spaces)
4. If different, either update Jenkinsfile or recreate credential with correct ID

### **Error: "Access Denied" or "UnauthorizedOperation"**

**Cause:** IAM user doesn't have sufficient permissions

**Fix:**
Add these policies to your IAM user:
- `AmazonECS_FullAccess`
- `AmazonEC2FullAccess`
- `AmazonVPCFullAccess`
- `ElasticLoadBalancingFullAccess`
- `IAMFullAccess

`

### **Build Succeeds But No Deployment**

**Check:**
1. Look at Jenkins console output for errors
2. Verify terraform.tfvars has correct values
3. Check AWS console for ECS task status

---

## 📊 **Monitoring Your Deployment**

### **In Jenkins:**
- Build console shows Terraform output
- You'll see ECS task updates
- Final message shows application URL

### **In AWS Console:**
1. Go to ECS → Clusters → `chat-app-cluster`
2. Click on **Services** → `chat-app-service`
3. Watch **Tasks** tab for new tasks starting
4. Check **Events** tab for deployment progress

### **Verify Deployment:**
```bash
# Check ECS service
wsl aws ecs describe-services --cluster chat-app-cluster --services chat-app-service --region us-east-1

# Check deployment URL
curl http://chat-app-alb-1195695260.us-east-1.elb.amazonaws.com
```

---

## 🎯 **Complete Workflow Example**

### **Scenario: You fix a bug**

```bash
# 1. Fix bug in code
# Edit: server/routes/users.js

# 2. Commit and push
git add .
git commit -m "Fix user profile bug"
git push origin main

# 3. Wait 10 minutes ☕
# Jenkins automatically:
# - Builds new Docker images
# - Pushes to Docker Hub
# - Deploys to AWS
# - Your fix is LIVE!

# 4. Verify
# Open: http://chat-app-alb-1195695260.us-east-1.elb.amazonaws.com
```

**No manual steps required!** ✨

---

## 🔐 **Security Best Practices**

### **1. Use Least Privilege IAM:**
Create a dedicated IAM user for Jenkins with only required permissions

### **2. Rotate Credentials:**
Periodically update AWS access keys:
1. Create new access key in IAM
2. Update Jenkins credentials
3. Delete old access key

### **3. Monitor Usage:**
Check CloudTrail for Jenkins API calls

### **4. Use Secrets Management:**
For production, consider:
- AWS Secrets Manager
- HashiCorp Vault
- Jenkins Credentials Plugin with encryption

---

## 📋 **Checklist Before First Automated Deployment**

- [ ] AWS credentials added to Jenkins (ID: `aws-credentials`)
- [ ] CloudBees AWS Credentials plugin installed
- [ ] Jenkinsfile updated and committed
- [ ] terraform.tfvars has correct values
- [ ] MongoDB Atlas allows connections from AWS
- [ ] OAuth callback URLs updated with ALB DNS
- [ ] Docker Hub credentials valid
- [ ] GitHub webhook configured (optional but recommended)

---

## 🚀 **GitHub Webhook Setup** (Optional - for instant builds)

### **Why:**
Without webhook, Jenkins polls GitHub every 1-5 minutes.  
With webhook, Jenkins builds immediately on push!

### **Setup:**

1. **Get Jenkins URL:**
   - If running locally: Use ngrok or expose Jenkins
   - If on server: Use server's public IP

2. **GitHub Repository:**
   - Go to your repo: `https://github.com/nethminalakshan/DevOps-Chat-Application`
   - Click **Settings** → **Webhooks** → **Add webhook**

3. **Configure Webhook:**
   - **Payload URL:** `http://YOUR_JENKINS_URL:8090/github-webhook/`
   - **Content type:** `application/json`
   - **Events:** Select **Just the push event**
   - Click **Add webhook**

4. **Verify:**
   - Make a test push
   - Jenkins should build immediately!

---

## 🎉 **Success Criteria**

After setup, you should have:

✅ **Push to GitHub** → Automatic build starts  
✅ **Docker images** → Automatically built and pushed  
✅ **AWS deployment** → Automatically updated  
✅ **Application live** → Within 10 minutes  
✅ **Zero manual steps** → Fully automated!

---

## 📝 **What's Next?**

After successful automation:

1. **Monitor first automated deployment**
2. **Verify application works after auto-deploy**
3. **Set up monitoring/alerting** (CloudWatch, Datadog, etc.)
4. **Add deployment notifications** (Slack, email)
5. **Implement blue-green deployment** (zero downtime)
6. **Add automated rollback** (if deployment fails)

---

## 🆘 **Need Help?**

### **Common Commands:**

```bash
# View Jenkins logs
wsl docker logs jenkins-server

# Restart Jenkins
wsl docker restart jenkins-server

# Check AWS credentials
wsl aws sts get-caller-identity

# Manual Terraform deploy (if automation fails)
cd terraform
wsl terraform apply -auto-approve
```

### **Useful Links:**
- Jenkins: `http://localhost:8090`
- Docker Hub: `https://hub.docker.com/u/nlh29060`
- AWS ECS: `https://console.aws.amazon.com/ecs/`
- GitHub Repo: `https://github.com/nethminalakshan/DevOps-Chat-Application`

---

## ✅ **Ready to Go!**

**Your CI/CD pipeline is now fully automated!** 🎉

**Next time you push code:**
1. Push to GitHub
2. Wait 10 minutes ☕
3. Your app is updated on AWS! ✅

**No manual steps. No WSL commands. Fully automated!** 🚀

---

*Remember: The first automated deployment might take longer while ECS pulls new images. Subsequent deployments are faster!*
