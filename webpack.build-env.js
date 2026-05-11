/**
 * Shared helpers for dev/prod webpack configs.
 * Set PUBLIC_PATH (or legacy ASSET_PATH) for subdirectory deploys, e.g. GitHub Project Pages.
 */

/** @param {string | undefined} raw */
export function normalizePublicPath(raw) {
  const s = (raw || '').trim();
  if (!s || s === '/') {
    return '/';
  }
  const withLeading = s.startsWith('/') ? s : `/${s}`;
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
}

/** Webpack `output.publicPath` / `<base href>` — always ends with `/` or is `/`. */
export function getPublicPath() {
  return normalizePublicPath(process.env.PUBLIC_PATH || process.env.ASSET_PATH);
}

/** React Router `basename` — no trailing slash; empty string when served from domain root. */
export function getRouterBasename() {
  const p = getPublicPath();
  if (p === '/') {
    return '';
  }
  return p.replace(/\/+$/, '');
}
