# Deploying

## Main branch — GitHub Pages (UX prototype)

The **`main`** branch auto-deploys to GitHub Pages whenever you push to **`main`**.

### Live URL (main prototype)

**https://maryshak1996.github.io/hcc-nextgenui-widget-builder/prototype/**

Share that link for the dashboard / widget-builder prototype (Appearance settings, RH icons, etc.).

### PCM integration demo (unchanged)

The **`pcm-integration`** branch still deploys separately via **Deploy PCM demo to GitHub Pages** — do not change that workflow.

**https://maryshak1996.github.io/hcc-nextgenui-widget-builder/**

### One-time GitHub setup

1. **Settings → Pages** → **Build and deployment** → **Source: GitHub Actions**
2. **Settings → Environments → `github-pages`** → allow **`main`** (and keep **`pcm-integration`** if already configured)

### What the main workflow does

**Deploy main prototype to GitHub Pages** (`.github/workflows/deploy-main-github-pages.yml`):

1. Builds **`pcm-integration`** into the site **root** (so the PCM demo URL keeps working after a main deploy)
2. Builds **`main`** with `PUBLIC_PATH=/<repo>/prototype/` into the **`/prototype/`** subfolder
3. Publishes the combined site to GitHub Pages

> **Note:** A push to **`pcm-integration` alone** redeploys only the PCM demo and removes the **`/prototype/`** folder until the next **`main`** push. The PCM branch and its workflow are untouched.

### Standard update workflow

```bash
git checkout main
# edit src/
git add .
git commit -m "Update prototype: short description"
git push origin main
```

Watch **Actions → Deploy main prototype to GitHub Pages**.

### Local development

Default (root, no subpath):

```bash
npm run start:dev
```

Open **http://localhost:9000/**

### Local check (same base path as GitHub Pages)

```bash
PUBLIC_PATH=/hcc-nextgenui-widget-builder/prototype/ npm run build
npx sirv dist --single --cors --host --port 8080
```

Or dev server under the subpath:

```bash
DEV_PUBLIC_PATH=/hcc-nextgenui-widget-builder/prototype/ npm start
```

Open **http://localhost:9000/hcc-nextgenui-widget-builder/prototype/**

Local dev **ignores** `PUBLIC_PATH` / `ASSET_PATH` in the shell so CI values do not break **`http://localhost:9000/`**. Use **`DEV_PUBLIC_PATH`** only when testing a subpath locally.

### Vercel (deprecated for main)

**https://hcc-ai-widget-builder.vercel.app/** was the previous main-branch host. You can disconnect the Vercel project after GitHub Pages is verified. **`vercel.json`** remains in the repo for reference; **`pcm-integration`** is unaffected.

---

## Confirm deployment

**GitHub Pages (main):** Actions → **Deploy main prototype to GitHub Pages** → **deploy** job succeeded → open the **`/prototype/`** URL above.

**GitHub Pages (PCM):** Actions → **Deploy PCM demo to GitHub Pages** → open **https://maryshak1996.github.io/hcc-nextgenui-widget-builder/**

---

## Technical notes

- Webpack uses **content-hashed** filenames.
- **`PUBLIC_PATH`** (or legacy **`ASSET_PATH`**) sets **`output.publicPath`**, **`<base href>`**, and **`process.env.ROUTER_BASENAME`** for React Router on GitHub Pages subpaths.
- **`public/404.html`** + the small script in **`src/index.html`** handle SPA deep links on GitHub Pages (including **`/prototype/`** routes).
- **`vercel.json`** only applied when deploying to Vercel; GitHub Pages does not use it.
