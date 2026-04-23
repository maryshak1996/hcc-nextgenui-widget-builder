/* eslint-disable @typescript-eslint/no-var-requires */

import { merge } from 'webpack-merge';
import common from './webpack.common.js';
import { stylePaths } from './stylePaths.js';
const HOST = process.env.HOST || 'localhost';
/** Default dev port (see `prestart:dev` in package.json — it frees this port before each `npm run start:dev`). */
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
    // Do not serve `./dist` here: static files are checked before webpack’s in-memory
    // bundle, so an existing dist/index.html + hashed chunks load stale JS/CSS and
    // HMR/source changes never appear until a full production build (localhost:9000).
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
