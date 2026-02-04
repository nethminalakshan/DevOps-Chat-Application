# 🔐 Update OAuth Providers (Required for Login to Work)

Since your application URL has changed to the new AWS Load Balancer, you MUST update your Google and GitHub OAuth settings.

## 🔗 Your New Application URL
**Base URL:** `http://chat-app-alb-1195695260.us-east-1.elb.amazonaws.com`

---

## 1️⃣ Google OAuth Setup

1. Go to **[Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials)**.
2. Click on your **OAuth 2.0 Client ID**.
3. Under **Authorized redirect URIs**, ADD this **exact** URL:

```
http://chat-app-alb-1195695260.us-east-1.elb.amazonaws.com:5000/api/auth/google/callback
```

> ⚠️ **Important:**
> - Ensure it starts with `http://` (not https)
> - Ensure it includes `:5000`
> - Press **Save** and wait **5 minutes** (Google takes time to propagate!)

---

## 2️⃣ GitHub OAuth Setup

1. Go to **[GitHub Developer Settings > OAuth Apps](https://github.com/settings/developers)**.
2. Click on your **Chat App**.
3. Update these fields:

- **Homepage URL:**
```
http://chat-app-alb-1195695260.us-east-1.elb.amazonaws.com
```

- **Authorization callback URL:**
```
http://chat-app-alb-1195695260.us-east-1.elb.amazonaws.com:5000/api/auth/github/callback
```

4. Click **Update Application**.

---

## 3️⃣ Troubleshooting "Error 400: redirect_uri_mismatch"

If you still see this error:
1. **Check the URL:** In the error page browser bar, look for `redirect_uri=...`. It tells you EXACTLY what URL was sent. Match it configuration.
2. **Clear Cache:** Open your browser in **Incognito Mode** to test.
3. **Wait:** Google changes can take up to 5-10 minutes.
