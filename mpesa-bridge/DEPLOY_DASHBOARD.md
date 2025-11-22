# 🚀 How to Deploy the Admin Dashboard to Render

Since the dashboard is a **React App** (Static Site), it is deployed differently from your Backend API.

## Step 1: Push to GitHub
1. Open **GitHub Desktop**.
2. You should see the changes for the `dashboard` folder.
3. **Commit** and **Push** to `master`.

## Step 2: Create Static Site on Render
1. Go to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → **Static Site**.
3. Connect your **GitHub Repository** (`mpesa-bridge`).

## Step 3: Configure Settings (Critical!) ⚙️

Use these EXACT settings:

| Setting | Value |
|---------|-------|
| **Name** | `mpesa-bridge-dashboard` (or anything you like) |
| **Root Directory** | `dashboard` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

> **Note:** The "Root Directory" is very important because your dashboard lives inside a subfolder, not the root of the repo.

## Step 4: Deploy
1. Click **Create Static Site**.
2. Wait for the build to finish (~3 minutes).
3. Click the URL (e.g., `https://mpesa-bridge-dashboard.onrender.com`).

## Step 5: Connect to Your API
Once deployed, your dashboard needs to know where your Backend API is.
1. Go to the **Environment** tab of your new Static Site.
2. Add a variable:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://mpesa-bridge-khh4.onrender.com/api/v1`
3. **Save** (it will redeploy).

---

## ❓ FAQ

**Q: I saw errors during the local build, is that okay?**
A: **Yes!** We fixed them.
- The `npm install` error was a syntax issue (fixed).
- The `TailwindCSS` error was a version mismatch (fixed by downgrading to v3).
- The final build was **successful** (`✓ built in 6.98s`).

**Q: Can I use this on mobile?**
A: **Yes!** The dashboard is fully responsive and works on phones.
