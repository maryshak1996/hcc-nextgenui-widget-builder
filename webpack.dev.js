/* eslint-disable @typescript-eslint/no-var-requires */

import { merge } from 'webpack-merge';
import common from './webpack.common.js';
import { stylePaths } from './stylePaths.js';
const HOST = process.env.HOST || 'localhost';
/** Default dev port (`npm start` / `npm run dev`; `prestart` frees this port via kill-port). */
const PORT = process.env.PORT || '9000';

export default merge(common('development'), {
  mode: 'development',
  devtool: 'eval-source-map',
  devServer: {
    host: HOST,
    port: PORT,
    historyApiFallback: true,
    open: true,
    // Avoid stale main/chunk scripts when the browser or a proxy caches aggressively.
    headers: { 'Cache-Control': 'no-store' },
    // Never serve loose files from disk before webpack’s bundle (avoids stale ./dist).
    static: false,
    client: {
      overlay: true,
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
