import { Configuration, DefinePlugin } from 'webpack';
import nodeExternals from 'webpack-node-externals';
import * as path from 'path';

/* -----------------------------------
 *
 * Config
 *
 * -------------------------------- */

const config = ({ mode }): Configuration => ({
  entry: {
    index: path.join(__dirname, './src/index.ts'),
  },
  mode: mode || 'development',
  target: 'es5',
  externals: [nodeExternals()],
  devtool: mode === 'development' ? 'eval-source-map' : void 0,
  context: path.join(__dirname, `./src`),
  cache: mode === 'development',
  output: {
    path: path.join(__dirname, './dist'),
    filename: '[name].js',
    libraryTarget: 'umd',
    globalObject: 'this',
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
    hints: mode === 'development' ? 'warning' : void 0,
  },
  plugins: [
    new DefinePlugin({
      __DEV__: mode === 'development',
    }),
  ],
  stats: {
    colors: true,
    timings: true,
  },
});

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

module.exports = config;
