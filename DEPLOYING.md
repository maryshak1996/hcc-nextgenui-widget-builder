# Deploying

## Main branch — Vercel (internal demo)

The app auto-deploys to:

**https://hcc-ai-widget-builder.vercel.app/**

whenever changes are pushed to **`main`**.

Workflow: edit `src/`, commit, push to `main`. Vercel runs `npm run build` and serves `dist/` with SPA rewrites from **`vercel.json`**.

---

## PCM integration demo — GitHub Pages

The **pcm-integration** branch is built and published to **GitHub Pages** so the PCM demo has a stable URL without a second Vercel project.

### One-time GitHub setup

1. In the GitHub repo: **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions** (not “Deploy from a branch”).
3. Merge or push the workflow file **`.github/workflows/deploy-pcm-github-pages.yml`** to **`pcm-integration`** (it is already in the repo on that branch after you merge this change).

### Live URL

After a successful run of **“Deploy PCM demo to GitHub Pages”**:

Example pattern: `https://github-username.github.io/repository-name/`

For this repository, that is:

**https://maryshak1996.github.io/hcc-nextgenui-widget-builder/**

CI sets **`PUBLIC_PATH` to `/<repository-name>/`** so asset URLs and the router match Project Pages (forks pick up the correct path automatically).

### When it deploys

- Every **push** to **`pcm-integration`**
- Manual run: **Actions → Deploy PCM demo to GitHub Pages → Run workflow**

### Local check (same base path as GitHub Pages)

```bash
PUBLIC_PATH=/hcc-nextgenui-widget-builder/ npm run build
```

Then either open **`dist/index.html`** only for a quick smoke check, or run **`PUBLIC_PATH=/hcc-nextgenui-widget-builder/ npm start`** and open the dev-server URL under your repo prefix (for example **`http://localhost:9000/hcc-nextgenui-widget-builder/`** when `PUBLIC_PATH` matches that folder).

Adjust the path to your repository name if it differs.

### SPA routing on GitHub Pages

There is no server rewrite like Vercel. **`public/404.html`** uses the usual GitHub Pages SPA redirect pattern (`pathSegmentsToKeep = 1` for project sites). **`src/index.html`** includes the small companion script that restores the path after that redirect.

---

## Confirm deployment

**Vercel:** Project → Deployments → latest **Production** is **Ready**.

**GitHub Pages:** Actions → latest **Deploy PCM demo to GitHub Pages** workflow → **deploy** job succeeded; open the environment URL or your `https://<user>.github.io/<repo>/` link.

---

## Technical notes

- Webpack uses **content-hashed** filenames.
- **`PUBLIC_PATH`** (or legacy **`ASSET_PATH`**) sets **`output.publicPath`**, **`<base href>`**, and **`process.env.ROUTER_BASENAME`** for **React Router** when deploying under a subpath.
- **`vercel.json`** only affects Vercel; GitHub Pages relies on **`404.html`** + the index script above.
