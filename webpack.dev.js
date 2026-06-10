/* eslint-disable @typescript-eslint/no-var-requires */

import { merge } from 'webpack-merge';
import webpack from 'webpack';
import common from './webpack.common.js';
import { stylePaths } from './stylePaths.js';
import { getPublicPathForMode, getRouterBasenameForMode } from './webpack.build-env.js';
const HOST = process.env.HOST || 'localhost';
/** Default dev port (`npm start` / `npm run dev`; `prestart` frees this port via kill-port). */
const PORT = process.env.PORT || '9000';
const devPublicPath = getPublicPathForMode('development');

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
    historyApiFallback: devPublicPath === '/' ? true : { index: `${devPublicPath}index.html` },
    open: true,
    // Avoid stale main/chunk scripts when the browser or a proxy caches aggressively.
    headers: { 'Cache-Control': 'no-store' },
    // Never serve loose files from disk before webpack’s bundle (avoids stale ./dist).
    static: false,
    client: {
      overlay: {
        errors: true,
        warnings: false,
        runtimeErrors: (error) => {
          const message = error?.message ?? String(error);
          // Benign browser notification when RO callbacks shift layout in the same frame.
          if (/ResizeObserver loop/i.test(message)) {
            return false;
          }
          return true;
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        include: [...stylePaths],
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
});
