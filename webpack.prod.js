/* eslint-disable @typescript-eslint/no-var-requires */

import webpack from 'webpack';
import { merge } from 'webpack-merge';
import common from './webpack.common.js';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserJSPlugin from 'terser-webpack-plugin';
import { getRouterBasenameForMode } from './webpack.build-env.js';

export default merge(common('production'), {
  mode: 'production',
  devtool: 'hidden-source-map',
  optimization: {
    runtimeChunk: 'single',
    minimizer: [
      new TerserJSPlugin({}),
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: ['default', { mergeLonghand: false }],
        },
      }),
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.ROUTER_BASENAME': JSON.stringify(getRouterBasenameForMode('production')),
    }),
  ],
});
