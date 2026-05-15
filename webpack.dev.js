/* eslint-disable @typescript-eslint/no-var-requires */

import { readFileSync, existsSync } from 'node:fs';
import path from 'path';
import webpack from 'webpack';
import { merge } from 'webpack-merge';
import common from './webpack.common.js';
import { getRouterBasenameForMode } from './webpack.build-env.js';
const HOST = process.env.HOST || 'localhost';
/** Default dev port (`npm start` / `npm run dev`; `prestart` frees this port via kill-port). */
const PORT = process.env.PORT || '9000';

export default merge(common('development'), {
  mode: 'development',
  devtool: 'eval-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.ROUTER_BASENAME': JSON.stringify(getRouterBasenameForMode('development')),
    }),
  ],
  devServer: {
    host: HOST,
    port: PORT,
    historyApiFallback: true,
    open: true,
    // Avoid stale main/chunk scripts when the browser or a proxy caches aggressively.
    headers: { 'Cache-Control': 'no-store' },
    /** Serve root-level static HTML/assets from `public/` only (not `./dist`), so e.g. `/cve-copy-fail-article.html` works with `npm start`. */
    static: [
      {
        directory: path.resolve(process.cwd(), 'public'),
        publicPath: '/',
        watch: true,
      },
    ],
    client: {
      /* Show build *errors* only; warnings should not block the full-screen overlay. */
      overlay: { errors: true, warnings: false, runtimeErrors: true },
    },
    /** Serve `public/help-popout.html` before SPA fallback (otherwise `historyApiFallback` can return `index.html`). */
    setupMiddlewares: (middlewares) => {
      middlewares.unshift((req, res, next) => {
        const pathname = (req.url ?? '').split('?')[0];
        const isHelpShell =
          pathname === '/help-popout.html' || pathname.endsWith('/help-popout.html');
        if (isHelpShell) {
          const file = path.resolve(process.cwd(), 'public/help-popout.html');
          if (existsSync(file)) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(readFileSync(file));
            return;
          }
        }
        next();
      });
      return middlewares;
    },
  },
});
