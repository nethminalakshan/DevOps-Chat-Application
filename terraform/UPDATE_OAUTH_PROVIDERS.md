# OAuth Configuration Update Required 🔑

Your application infrastructure is now deployed! However, to enable Google and GitHub login, you **MUST** update the OAuth callback URLs in both provider consoles.

---

## ⚠️ YOUR NEW APPLICATION URLs

**Application URL (Frontend):**
```
http://chat-app-alb-1195695260.us-east-1.elb.amazonaws.com
```

**Backend API URL:**
```
http://chat-app-alb-1195695260.us-east-1.elb.amazonaws.com:5000
```

---

## 🔵 Step 1: Update Google OAuth Settings

### Navigate to Google Cloud Console:
🔗 **[Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)**

### Find Your OAuth Client:
- Client ID: `563521387761-s6008ucnkmnq9hst7799kp0is89n56b6.apps.googleusercontent.com`
- Click on it to edit

### Update Authorized JavaScript Origins:
**Remove old URLs** (if they exist):
- ❌ `http://13.218.108.220.nip.io`
- ❌ `http://13.218.108.220.nip.io:5000`

**Add these NEW URLs:**
```
http://chat-app-alb-1195695260.us-east-1.elb.amazonaws.com
http://chat-app-alb-1195695260.us-east-1.elb.amazonaws.com:5000
```

### Update Authorized Redirect URIs:
**Remove old URLs** (if they exist):
- ❌ `http://13.218.108.220.nip.io:5000/api/auth/google/callback`

**Add this NEW URL:**
```
http://chat-app-alb-1195695260.us-east-1.elb.amazonaws.com:5000/api/auth/google/callback
```

### Save Changes
Click **"Save"** at the bottom of the page.

---

## 🐙 Step 2: Update GitHub OAuth Settings

### Navigate to GitHub Developer Settings:
🔗 **[GitHub Developer Settings - OAuth Apps](https://github.com/settings/developers)**

### Find Your OAuth App:
- Look for the app with Client ID: `Ov23liGFqdvFV34eGEaN`
- Click on it to edit

### Update Homepage URL:
**Replace with:**
```
http://chat-app-alb-1195695260.us-east-1.elb.amazonaws.com
```

### Update Authorization Callback URL:
**Replace with:**
```
http://chat-app-alb-1195695260.us-east-1.elb.amazonaws.com:5000/api/auth/github/callback
```

### Save Changes
Click **"Update application"** at the bottom.

---

## ✅ Verification Checklist

After updating both providers, verify:

- [ ] Google OAuth: Authorized JavaScript origins updated
- [ ] Google OAuth: Redirect URIs updated
- [ ] Google OAuth: Changes saved
- [ ] GitHub OAuth: Homepage URL updated
- [ ] GitHub OAuth: Callback URL updated
- [ ] GitHub OAuth: Changes saved

---

## 🧪 Testing Your Application

### Step 1: Wait for Deployment (2-3 minutes)
The Terraform update is currently applying. Wait until you see:
```
Apply complete! Resources: 0 added, 1 changed, 0 destroyed.
```

### Step 2: Check Application Status
```bash
wsl bash diagnose.sh
```

Look for:
- ✅ ECS Service: ACTIVE
- ✅ Running count: 1/1
- ✅ Load Balancers: Not empty `[]`

### Step 3: Access Your Application
Open in browser:
```
http://chat-app-alb-1195695260.us-east-1.elb.amazonaws.com
```

### Step 4: Test OAuth Login
1. **Test Google Login:**
   - Click "Sign in with Google"
   - Should redirect to Google
   - After login, redirect back to your app

2. **Test GitHub Login:**
   - Click "Sign in with GitHub"
   - Should redirect to GitHub
   - After login, redirect back to your app

---

## 🐛 Troubleshooting

### "Redirect URI Mismatch" Error
**Cause:** OAuth callback URLs not updated in provider console

**Fix:**
1. Double-check URLs in Google/GitHub console
2. Ensure exact match (including `http://` and port `:5000`)
3. Wait 1-2 minutes for changes to propagate

### Application Not Loading
**Cause:** ECS tasks may still be starting

**Fix:**
1. Wait 2-3 minutes for tasks to start
2. Check logs:
```bash
wsl aws logs tail /ecs/chat-app --region us-east-1 --follow
```

### Target Health Check Failing
**Cause:** Application not responding to health checks

**Fix:**
1. Check backend is running on port 5000
2. Check frontend nginx is serving on port 80
3. View ECS task status:
```bash
wsl aws ecs describe-tasks --cluster chat-app-cluster --tasks $(aws ecs list-tasks --cluster chat-app-cluster --region us-east-1 --query 'taskArns[0]' --output text) --region us-east-1
```

---

## 📊 Quick Status Check

Run this to get current status:
```bash
cd "/mnt/d/Projects/Academic Project/Semester 5/DevOps-Chat-Application/DevOps-Chat-Application/terraform"
wsl bash diagnose.sh
```

---

## 🎯 Summary

**What You Need to Do:**

1. ✅ **Update Google OAuth** (5 minutes)
   - Go to: https://console.cloud.google.com/apis/credentials
   - Update origins and redirect URIs

2. ✅ **Update GitHub OAuth** (2 minutes)
   - Go to: https://github.com/settings/developers
   - Update homepage and callback URLs

3. ✅ **Wait for Deployment** (2-3 minutes)
   - Terraform is currently updating containers

4. ✅ **Test Application** (5 minutes)
   - Visit: http://chat-app-alb-1195695260.us-east-1.elb.amazonaws.com
   - Test Google and GitHub login

**Total Time:** ~15 minutes

---

## 🆘 Need Help?

If something doesn't work:

1. Check this document first
2. Run diagnostics: `wsl bash diagnose.sh`
3. Check logs: `wsl aws logs tail /ecs/chat-app --region us-east-1 --follow`
4. Review the full guide: `AWS_TROUBLESHOOTING_GUIDE.md`

---

**Good luck! Your app should be running soon! 🚀**
