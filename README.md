# HCC AI Widget Builder

An internal UX prototype used to explore and demonstrate UI/UX design concepts for AI-powered dashboard and widget-building experiences.

### 🔗 Live prototypes

- **Main branch (Vercel):** https://hcc-ai-widget-builder.vercel.app/
- **PCM integration (GitHub Pages):** https://maryshak1996.github.io/hcc-nextgenui-widget-builder/  
  (Deploys from the **`pcm-integration`** branch; see [`DEPLOYING.md`](./DEPLOYING.md).)

**Share with coworkers (PCM demo on Pages):**

- **Home / shell:** https://maryshak1996.github.io/hcc-nextgenui-widget-builder/
- **Copy-fail article walkthrough:** https://maryshak1996.github.io/hcc-nextgenui-widget-builder/pcm/article  
  After this push, GitHub Actions will rebuild the site from **`pcm-integration`**; if the link 404s briefly, wait for **Actions → Deploy PCM demo to GitHub Pages** to finish.

### 🎨 Design Preview
**Figma Working Design File:**  
https://www.figma.com/design/c1GHDIdhEGkwVZ0jt65q9q/NextGenUI-Dashboard-Widgets?node-id=0-1&t=KZCfD9CcCWUCEmvo-1

[![NextGenUI Dashboard Design Preview](./assets/figma-preview.png)](https://www.figma.com/design/c1GHDIdhEGkwVZ0jt65q9q/NextGenUI-Dashboard-Widgets?node-id=0-1&t=KZCfD9CcCWUCEmvo-1)

---

## 🎯 Purpose

This application is a working prototype designed for:

- Stakeholder demos  
- UX concept validation  
- Interaction exploration  
- Layout and widget experimentation  
- Rapid iteration on dashboard builder ideas  

This is not a production product — it is a design exploration environment.

---

## 🧱 Tech Stack

- **React 18**
- **TypeScript**
- **PatternFly 6**
- **Webpack 5**
- **Vercel** (main branch static deployment)
- **GitHub Pages** (PCM demo from `pcm-integration`)

---

## 🚀 Deployment

- **`main`** → Vercel (`hcc-ai-widget-builder.vercel.app`).
- **`pcm-integration`** → GitHub Pages (see URL above).

See [`DEPLOYING.md`](./DEPLOYING.md) for setup, local Pages-like builds, and troubleshooting.

---

## 🛠 Local Development

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run start:dev
```

Build production bundle:

```bash
npm run build
```

Preview production build locally:

```bash
npx sirv dist --single --cors --host --port 8080
```

---

## 🧠 Architecture Notes

- Uses content-hashed asset filenames to prevent stale caching.
- SPA routing: **`vercel.json`** rewrites on Vercel; **GitHub Pages** uses `public/404.html` plus a small script in `src/index.html`.
- **`PUBLIC_PATH`** + **`process.env.ROUTER_BASENAME`** support a repo subpath on GitHub Pages; Vercel production stays at `/`.
- Production builds use `hidden-source-map`.

---

## 📁 Project Structure (Simplified)

```
src/
  app/
    AppLayout/
    Homepage/
    routes.tsx
  index.tsx
webpack.common.js
webpack.prod.js
vercel.json
```

---

## ⚠️ Disclaimer

This repository is for internal UX exploration and demo purposes only.

---

## ✨ Maintained By

Mary Shakshober
