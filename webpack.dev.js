/* eslint-disable @typescript-eslint/no-var-requires */

import path from 'path';
import webpack from 'webpack';
import { merge } from 'webpack-merge';
import common from './webpack.common.js';
import { getRouterBasename } from './webpack.build-env.js';
const HOST = process.env.HOST || 'localhost';
/** Default dev port (`npm start` / `npm run dev`; `prestart` frees this port via kill-port). */
const PORT = process.env.PORT || '9000';

export default merge(common('development'), {
  mode: 'development',
  devtool: 'eval-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.ROUTER_BASENAME': JSON.stringify(getRouterBasename()),
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
  },
});
