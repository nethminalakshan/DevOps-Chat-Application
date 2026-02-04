# 🎯 GitHub Webhook Setup - Build ONLY on Git Push!

## ✨ **What You Want: Build ONLY When You Push**

Instead of Jenkins checking GitHub every few minutes, let GitHub **instantly notify** Jenkins when you push!

**Result:**
- ✅ Push to GitHub → Build starts **instantly** (5-10 seconds)
- ✅ No push → No build (no wasted resources)
- ✅ No periodic polling needed

---

## 🚀 **Two Methods**

### **Method 1: GitHub Webhook with ngrok (BEST for Local Jenkins)**
**For:** Jenkins running on localhost:8090  
**Time:** 10 minutes setup  
**Cost:** Free  
**Triggers:** Instant (5-10 seconds after push)

### **Method 2: Poll SCM (Fallback - if webhook doesn't work)**
**For:** Quick setup, no external tools  
**Time:** 2 minutes setup  
**Triggers:** Within 1-5 minutes after push

---

## 🎯 **Method 1: GitHub Webhook (Recommended)**

### **Problem:**
GitHub can't reach `localhost:8090` to send notifications.

### **Solution:**
Use **ngrok** to create a temporary public URL that forwards to your local Jenkins.

---

## 📝 **Step-by-Step: GitHub Webhook Setup**

### **Step 1: Install ngrok**

#### **Download ngrok:**
1. Go to: https://ngrok.com/download
2. Download for Windows
3. Extract `ngrok.exe` to a folder (e.g., `C:\ngrok\`)

#### **Or use Chocolatey:**
```powershell
choco install ngrok
```

---

### **Step 2: Run ngrok to Expose Jenkins**

#### **Open PowerShell/CMD:**
```powershell
# Navigate to ngrok folder
cd C:\ngrok

# Expose Jenkins (port 8090) to the internet
.\ngrok http 8090
```

#### **You'll see output like:**
```
ngrok

Session Status                online
Account                       [your email]
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:8090
```

**Copy this URL:** `https://abc123.ngrok-free.app` ✨

**⚠️ Important:**
- Keep ngrok running while you want webhooks to work
- The URL changes each time you restart ngrok (free version)
- For permanent URL, upgrade to ngrok paid plan

---

### **Step 3: Configure Jenkins for Webhooks**

#### **A. Install GitHub Plugin (if not installed):**
1. Open Jenkins: `http://localhost:8090`
2. **Manage Jenkins** → **Plugins** → **Available plugins**
3. Search: `GitHub`
4. Install: **GitHub Plugin**
5. Restart Jenkins if needed

#### **B. Configure Your Pipeline:**
1. Go to Jenkins → Your pipeline (ChatApplication)
2. Click **Configure**
3. Scroll to **Build Triggers**
4. **Check:** ✅ **GitHub hook trigger for GITScm polling**
5. **Uncheck:** Poll SCM (if enabled)
6. Click **Save**

---

### **Step 4: Configure GitHub Webhook**

#### **A. Go to Your GitHub Repository:**
```
https://github.com/nethminalakshan/DevOps-Chat-Application
```

#### **B. Add Webhook:**
1. Click **Settings** (repository settings, not your profile)
2. Click **Webhooks** (left sidebar)
3. Click **Add webhook**

#### **C. Configure Webhook:**

**Payload URL:**
```
https://abc123.ngrok-free.app/github-webhook/
```
⚠️ Replace `abc123.ngrok-free.app` with your ngrok URL  
⚠️ Don't forget the trailing slash `/` after `github-webhook/`

**Content type:**
```
application/json
```

**Secret:** (leave blank for now)

**Which events would you like to trigger this webhook?**
- Select: ✅ **Just the push event**

**Active:**
- Check: ✅ **Active**

**Click:** `Add webhook`

---

### **Step 5: Test the Webhook**

#### **Verify Webhook is Working:**

1. **In GitHub → Webhooks page:**
   - You'll see a green checkmark ✅ if webhook delivered successfully
   - Or red X ❌ if failed

2. **Click on the webhook** to see recent deliveries
   - Should show response code: `200 OK`

#### **Test with a Real Push:**

```bash
cd "d:\Projects\Academic Project\Semester 5\DevOps-Chat-Application\DevOps-Chat-Application"

# Make a small change
echo "# Testing webhook trigger" >> README.md

# Commit and push
git add README.md
git commit -m "Test: GitHub webhook instant trigger"
git push origin main
```

#### **Watch Jenkins:**
- Open: `http://localhost:8090`
- **Within 5-10 seconds**, a new build should start!
- Build description will say: "Started by GitHub push by nethminalakshan"

---

## ⚡ **Method 2: Poll SCM (Quick Alternative)**

### **If ngrok is too complicated, use Poll SCM with short interval:**

1. **Jenkins** → Your pipeline → **Configure**
2. **Build Triggers** → Check: ✅ **Poll SCM**
3. **Schedule:** `* * * * *` (checks every 1 minute)
4. Click **Save**

**Result:**
- Push to GitHub
- Within 1 minute, build starts automatically

**Pros:**
- Simple, no external tools
- Works with localhost Jenkins

**Cons:**
- Not instant (1 minute delay)
- Jenkins checks GitHub every minute (even if no changes)

---

## 📊 **Comparison**

| Feature | GitHub Webhook | Poll SCM |
|---------|---------------|----------|
| **Speed** | ⚡ 5-10 seconds | ⏱️ 1-5 minutes |
| **Efficiency** | ✅ Only on push | ❌ Checks constantly |
| **Setup** | 10 minutes | 2 minutes |
| **Requires** | ngrok (for local) | Nothing extra |
| **Best for** | Production | Development/Testing |

---

## 🎯 **Recommended Setup**

### **For Development (Your Current Setup):**
**Use Poll SCM:**
```
Schedule: H/2 * * * * 
(checks every 2 minutes)
```

### **For Production/Demo:**
**Use GitHub Webhook:**
- Set up ngrok
- Configure webhook
- Instant builds on push

### **Hybrid Approach:**
**Use both!**
- Webhook for instant triggers
- Poll SCM as fallback (in case webhook fails)

---

## 🔧 **Complete Configuration Example**

### **In Jenkins (Build Triggers section):**

```
✅ GitHub hook trigger for GITScm polling
✅ Poll SCM
    Schedule: H/5 * * * *
```

**Why both?**
- Webhook triggers instantly (primary)
- Poll SCM triggers if webhook missed (backup)

---

## 🐛 **Troubleshooting Webhooks**

### **Problem: Red X on webhook in GitHub**

**Check:**
1. Is ngrok running? (`ngrok http 8090`)
2. Is the URL correct? (should end with `/github-webhook/`)
3. Is Jenkins accessible via ngrok URL?
   - Test: Open `https://your-ngrok-url.ngrok-free.app` in browser

**Test ngrok connection:**
```powershell
# In browser, open:
https://abc123.ngrok-free.app

# Should show Jenkins login page
```

---

### **Problem: Webhook shows 200 OK but build doesn't start**

**Check Jenkins Configuration:**
1. Jenkins → Configure
2. "GitHub hook trigger for GITScm polling" is checked
3. Save configuration

**Check Jenkins Logs:**
1. Manage Jenkins → System Log
2. Look for GitHub webhook messages

---

### **Problem: ngrok URL changes every time**

**Solutions:**

**A. Keep ngrok running:**
- Don't close ngrok window
- Leave it running 24/7

**B. Use ngrok paid plan:**
- Get permanent URL
- ~$8/month

**C. Use Poll SCM instead:**
- No ngrok needed
- Slight delay acceptable

---

## 📱 **Daily Workflow with Webhook**

### **One-time Setup:**
1. Start ngrok: `ngrok http 8090`
2. Copy URL and update GitHub webhook if changed
3. Keep ngrok running

### **Daily Development:**
```
1. Write code
2. git push origin main
3. (5-10 seconds)
4. Jenkins build starts automatically!
5. (10 minutes)
6. App deployed to AWS
7. Done! ✅
```

**No manual steps. Fully automated!**

---

## 🎬 **Quick Start Commands**

### **Start ngrok (keep this running):**
```powershell
# Terminal 1 - Keep this open
cd C:\ngrok
.\ngrok http 8090
```

### **Copy ngrok URL and update GitHub webhook:**
```
https://abc123.ngrok-free.app/github-webhook/
```

### **Test with a push:**
```bash
# Terminal 2 - Your work terminal
cd "d:\Projects\Academic Project\Semester 5\DevOps-Chat-Application\DevOps-Chat-Application"

echo "# Test instant trigger" >> README.md
git add README.md
git commit -m "Test webhook"
git push origin main

# Watch Jenkins - build starts in 5-10 seconds!
```

---

## ✅ **Verification Checklist**

After setup, verify everything works:

- [ ] ngrok is running and shows public URL
- [ ] GitHub webhook is configured with ngrok URL
- [ ] GitHub webhook shows green checkmark ✅
- [ ] Jenkins has "GitHub hook trigger" enabled
- [ ] Test push triggers build within 10 seconds
- [ ] Build description shows "Started by GitHub push"

---

## 🆚 **What's Different from Poll SCM?**

### **With Poll SCM:**
```
00:00 - Push to GitHub
00:01 - (Jenkins checking... no changes)
00:02 - (Jenkins checking... no changes)
00:03 - Jenkins checks: "New commit found!"
00:03 - Build starts
```
**Delay:** 1-5 minutes

### **With Webhook:**
```
00:00 - Push to GitHub
00:01 - GitHub instantly sends webhook to Jenkins
00:02 - Build starts
```
**Delay:** 5-10 seconds ⚡

---

## 🎉 **Summary**

**Your Question:** "Is it possible to build ONLY when after git push?"

**Answer:** **YES! Use GitHub Webhooks!**

**Two Options:**

### **Option 1: GitHub Webhook (Best)**
- ✅ Builds **ONLY** when you push
- ✅ **Instant** trigger (5-10 seconds)
- ⚙️ Requires ngrok for local Jenkins
- ⏱️ 10 minutes setup

### **Option 2: Poll SCM with Short Interval**
- ✅ Builds **only** when there are changes
- ⏱️ Triggers within 1 minute
- 💚 Simple setup
- ⏱️ 2 minutes setup

**Recommendation:**
- **Development:** Use Poll SCM (`* * * * *` = every minute)
- **Production/Demo:** Use GitHub Webhook with ngrok
- **Best:** Use both (webhook + poll SCM as backup)

---

## 🚀 **Next Steps**

1. **Quick/Easy:** Set up Poll SCM with 1-minute interval
2. **Pro/Fast:** Set up GitHub Webhook with ngrok
3. **Best:** Use both for reliability

**Want to try webhook now?**
1. Download ngrok
2. Run `ngrok http 8090`
3. Copy URL and add to GitHub webhook
4. Push code and watch instant build! 🎉

---

*Pro Tip: For academic projects/demos, the combination of webhook (instant) + poll SCM (backup) shows advanced DevOps knowledge!* ✨
