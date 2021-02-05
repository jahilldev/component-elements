import { Configuration, DefinePlugin } from 'webpack';
import nodeExternals from 'webpack-node-externals';
import * as path from 'path';

/* -----------------------------------
 *
 * Flags
 *
 * -------------------------------- */

const RELEASE = process.env.NODE_ENV === 'production';

/* -----------------------------------
 *
 * Config
 *
 * -------------------------------- */

const config: Configuration = {
  entry: {
    index: path.join(__dirname, './src/index.ts'),
  },
  mode: RELEASE ? 'production' : 'development',
  target: 'web',
  externals: [nodeExternals()],
  devtool: !RELEASE ? 'eval-source-map' : void 0,
  context: path.join(__dirname, `./src`),
  cache: !RELEASE,
  output: {
    path: path.join(__dirname, './dist'),
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', 'json'],
    alias: {
      '@': path.join(__dirname, './src'),
    },
  },
  node: {
    __filename: true,
    __dirname: true,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },
    ],
  },
  performance: {
    hints: !RELEASE ? 'warning' : void 0,
  },
  plugins: [
    new DefinePlugin({
      __DEV__: !RELEASE,
    }),
  ],
  stats: {
    colors: true,
    timings: true,
  },
};

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export default config;
