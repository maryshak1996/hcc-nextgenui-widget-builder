# HCC AI Widget Builder

An internal UX prototype used to explore and demonstrate UI/UX design concepts for AI-powered dashboard and widget-building experiences.

### 🔗 Live Prototype
https://maryshak1996.github.io/hcc-nextgenui-widget-builder/prototype/

*(PCM integration demo, separate deploy: https://maryshak1996.github.io/hcc-nextgenui-widget-builder/)*

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
- **GitHub Pages** (main prototype at `/prototype/`; PCM demo on `pcm-integration`)

---

## 🚀 Deployment

The **`main`** branch auto-deploys to **GitHub Pages** at **`/prototype/`** when you push to **`main`**.

See **[`DEPLOYING.md`](./DEPLOYING.md)** for URLs, GitHub setup, and the PCM vs main split.

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
- **`main`** is published to GitHub Pages under **`/prototype/`** with **`PUBLIC_PATH`** + **`ROUTER_BASENAME`**.
- **`pcm-integration`** continues to deploy the PCM demo at the repo root (separate workflow; unchanged).
- Local dev defaults to **`http://localhost:9000/`** (no subpath).

---

## 📁 Project Structure (Simplified)

```
src/
  app/
    AppLayout/
    Homepage/
    routes.tsx
  index.tsx
webpack.build-env.js
webpack.common.js
webpack.prod.js
.github/workflows/deploy-main-github-pages.yml
```

---

## ⚠️ Disclaimer

This repository is for internal UX exploration and demo purposes only.

---

## ✨ Maintained By

Mary Shakshober
