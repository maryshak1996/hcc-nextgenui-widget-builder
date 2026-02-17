# 🚀 Deploying to Vercel (Internal Demo App)

This project auto-deploys to:

👉 **https://hcc-ai-widget-builder.vercel.app/**  
whenever changes are pushed to the `main` branch.

---

## 🛠 Standard Update Workflow

### 1️⃣ Make UI changes locally

Edit your components in the `src/` folder.

Optional local check:

```bash
npm run start:dev
```

OR (production-like check):

```bash
npm run build
```

---

### 2️⃣ Commit and push to `main`

```bash
git add .
git commit -m "Update UI: short description"
git push
```

Vercel will automatically:

- Install dependencies  
- Run `npm run build`  
- Deploy the `dist/` folder  
- Update the live URL  

---

## 🔎 Confirm Deployment

1. Go to **Vercel → Deployments**
2. Make sure the latest deployment is:
   - ✅ Production  
   - ✅ Ready  
   - ✅ Matches your commit message  

---

## 🧪 Before a Stakeholder Demo

To avoid cached assets:

- Open the site in an **Incognito window**
- OR hard refresh once

Because we use hashed filenames, stale caching should not occur — but this is a good habit.

---

## 🆘 If Something Breaks

You can instantly roll back:

1. Go to **Vercel → Deployments**
2. Click a previous successful deployment
3. Redeploy or promote it

No Git revert required.

---

## ⚙️ Technical Notes (For Future Me)

- Webpack uses **content-hashed filenames** to prevent stale caching.
- SPA routing is handled via `vercel.json` rewrites.
- React Router has **no basename** (Vercel deploys at `/`).
- Production uses `hidden-source-map`.