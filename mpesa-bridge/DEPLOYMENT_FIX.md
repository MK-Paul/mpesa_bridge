# Fix Deployment Errors - Quick Guide

## ✅ Step 1: Code Fix (Done)

Added `app.set('trust proxy', 1)` to fix rate limiter error.

---

## ⚠️ Step 2: Add DATABASE_URL to Render

**The `DATABASE_URL` environment variable is missing in Render!**

### How to Add It:

1. Go to **Render Dashboard**: https://render.com/dashboard
2. Click on your **`mpesa-bridge-khh4`** service
3. Click **"Environment"** tab (left sidebar)
4. Click **"Add Environment Variable"**
5. Enter:
   - **Key:** `DATABASE_URL`
   - **Value:** Your Supabase connection string

### Your Supabase Connection String:

```
postgresql://postgres.uqktyenstlfosfgkckqt:YOUR_PASSWORD@aws-1-eu-west-1.pooler.supabase.com:6543/postgres
```

**Replace `YOUR_PASSWORD`** with your actual Supabase password.

6. Click **"Save Changes"**

---

## 🚀 Step 3: Push Code & Redeploy

After fixing the code locally:

```bash
git add .
git commit -m "fix: enable trust proxy for production"
git push
```

Render will auto-detect the push and redeploy (~3 minutes).

---

## ✅ After Redeploy

Test again:
```
GET https://mpesa-bridge-khh4.onrender.com
```

Should return:
```json
{
  "status": "success",
  "message": "M-Pesa Bridge API is running 🚀"
}
```

---

**Do Steps 2 and 3, then test again!**
