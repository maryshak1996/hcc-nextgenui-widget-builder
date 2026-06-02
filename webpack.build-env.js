/**
 * Shared helpers for dev/prod webpack configs.
 * Production: set PUBLIC_PATH (or legacy ASSET_PATH) for subdirectory deploys, e.g. GitHub Project Pages.
 * Development: defaults to `/` so a leftover shell PUBLIC_PATH does not break localhost.
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

/** Production / CI: base path from env (GitHub Actions sets PUBLIC_PATH). */
export function getPublicPath() {
  return normalizePublicPath(process.env.PUBLIC_PATH || process.env.ASSET_PATH);
}

/**
 * @param {'development' | 'production'} mode
 * In development, only DEV_PUBLIC_PATH applies (optional subpath testing). Ignores PUBLIC_PATH/ASSET_PATH.
 */
export function getPublicPathForMode(mode) {
  if (mode === 'development') {
    const dev = (process.env.DEV_PUBLIC_PATH || '').trim();
    return dev ? normalizePublicPath(dev) : '/';
  }
  return getPublicPath();
}

/** React Router `basename` — no trailing slash; empty string when served from domain root. */
export function getRouterBasenameForMode(mode) {
  const p = getPublicPathForMode(mode);
  if (p === '/') {
    return '';
  }
  return p.replace(/\/+$/, '');
}
