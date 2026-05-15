/* eslint-disable @typescript-eslint/no-var-requires */

import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import Dotenv from 'dotenv-webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { getPublicPathForMode } from './webpack.build-env.js';

const BG_IMAGES_DIRNAME = 'bgimages';

export default (env) => {
  const isProd = env === 'production';
  const publicPath = getPublicPathForMode(env);
  return {
    module: {
      rules: [
        {
          test: /\.(tsx|ts|jsx)?$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
                experimentalWatchApi: true,
              },
            },
          ],
        },
        {
          test: /\.(svg|ttf|eot|woff|woff2)$/,
          type: 'asset/resource',
          // only process modules with this loader
          // if they live under a 'fonts' or 'pficon' directory
          include: [
            path.resolve('./node_modules/patternfly/dist/fonts'),
            path.resolve('./node_modules/@patternfly/react-core/dist/styles/assets/fonts'),
            path.resolve('./node_modules/@patternfly/react-core/dist/styles/assets/pficon'),
            path.resolve('./node_modules/@patternfly/patternfly/assets/fonts'),
            path.resolve('./node_modules/@patternfly/patternfly/assets/pficon'),
          ],
        },
        {
          test: /\.svg$/,
          type: 'asset/inline',
          include: (input) => input.indexOf('background-filter.svg') > 1,
          use: [
            {
              options: {
                limit: 5000,
                outputPath: 'svgs',
                name: '[name].[ext]',
              },
            },
          ],
        },
        {
          test: /\.svg$/,
          // only process SVG modules with this loader if they live under a 'bgimages' directory
          // this is primarily useful when applying a CSS background using an SVG
          include: (input) => input.indexOf(BG_IMAGES_DIRNAME) > -1,
          type: 'asset/inline',
        },
        {
          test: /\.svg$/,
          // only process SVG modules with this loader when they don't live under a 'bgimages',
          // 'fonts', or 'pficon' directory, those are handled with other loaders
          include: (input) =>
            input.indexOf(BG_IMAGES_DIRNAME) === -1 &&
            input.indexOf('fonts') === -1 &&
            input.indexOf('background-filter') === -1 &&
            input.indexOf('pficon') === -1,
          use: {
            loader: 'raw-loader',
            options: {},
          },
        },
        {
          test: /\.(jpg|jpeg|png|gif)$/i,
          include: [
            path.resolve('./src'),
            path.resolve('./node_modules/patternfly'),
            path.resolve('./node_modules/@patternfly/patternfly/assets/images'),
            path.resolve('./node_modules/@patternfly/react-styles/css/assets/images'),
            path.resolve('./node_modules/@patternfly/react-core/dist/styles/assets/images'),
            path.resolve('./node_modules/@patternfly/react-core/node_modules/@patternfly/react-styles/css/assets/images'),
            path.resolve('./node_modules/@patternfly/react-table/node_modules/@patternfly/react-styles/css/assets/images'),
            path.resolve('./node_modules/@patternfly/react-inline-edit-extension/node_modules/@patternfly/react-styles/css/assets/images')
          ],
          type: 'asset/inline',
          use: [
            {
              options: {
                limit: 5000,
                outputPath: 'images',
                name: '[name].[ext]',
              },
            },
          ],
        },
        /* In common so merge order can’t drop it; all `*.css` (incl. @patternfly/chatbot, highlight.js). */
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
      ],
    },
    output: {
      filename: '[name].[contenthash].js',
      chunkFilename: '[name].[contenthash].js',
      path: path.resolve('./dist'),
      publicPath,
      clean: true,
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          /**
           * PatternFly + `@patternfly/*` CSS in its own chunk so the Help popout can load `patternfly*.css`
           * while skipping `main.*.css` (still carries `app.css` / shell rules that break `about:blank`).
           */
          patternflyStyles: {
            name: 'patternfly',
            type: 'css/mini-extract',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](@patternfly|patternfly)[\\/]/,
            priority: 40,
            enforce: true,
          },
        },
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve('./src', 'index.html'),
        inject: 'body',
        publicPath,
        baseHref: publicPath,
      }),
      new Dotenv({
        systemvars: true,
        silent: true,
      }),
      /*
       * Extract CSS in dev and prod so real `<link rel="stylesheet">` tags exist in `document.head`.
       * The Help undock popout clones those links into the auxiliary window; `style-loader`–only dev
       * builds had no links to copy (unstyled popout). Cloning all `<style>` nodes caused a white screen.
       */
      new MiniCssExtractPlugin({
        ignoreOrder: true,
        filename: isProd ? '[name].[contenthash].css' : '[name].css',
        chunkFilename: isProd ? '[name].[contenthash].css' : '[name].css',
      }),
      new CopyPlugin({
        patterns: [
          { from: './src/favicon.png', to: 'images' },
          { from: './public/404.html', to: '404.html' },
          { from: './public/cve-copy-fail-article.html', to: 'cve-copy-fail-article.html' },
          { from: './public/help-popout.html', to: 'help-popout.html' },
        ],
      }),
    ],
    resolve: {
      extensions: ['.js', '.ts', '.tsx', '.jsx'],
      plugins: [
        new TsconfigPathsPlugin({
          configFile: path.resolve('./tsconfig.json'),
        }),
      ],
      symlinks: false,
      cacheWithContext: false,
    },
  };
};
