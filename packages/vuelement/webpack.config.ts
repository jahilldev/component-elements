import { Configuration, DefinePlugin } from 'webpack';
import nodeExternals from 'webpack-node-externals';
import * as path from 'path';

/* -----------------------------------
 *
 * Output
 *
 * -------------------------------- */

const outputFiles = [
  { target: 'es5', filename: '[name].es5.js' },
  // { target: 'es2016', filename: '[name].js' },
];

/* -----------------------------------
 *
 * Default
 *
 * -------------------------------- */

const defaultConfig = {
  entry: {
    define: path.join(__dirname, './src/define.ts'),
  },
  externals: [nodeExternals()],
  context: path.join(__dirname, './src'),
  output: {
    path: path.join(__dirname, './dist'),
    filename: '[name].js',
    libraryTarget: 'umd',
    globalObject: 'this',
    chunkFormat: 'commonjs',
  },
  resolve: {
    extensions: ['.ts', '.tsx', 'json'],
    alias: {
      '@': path.join(__dirname, '../'),
    },
  },
  node: {
    __filename: true,
    __dirname: true,
  },
  stats: {
    colors: true,
    timings: true,
  },
};

/* -----------------------------------
 *
 * Config
 *
 * -------------------------------- */

const config = ({ mode }): Configuration[] =>
  outputFiles.map(({ target, filename, ...config }) => ({
    ...defaultConfig,
    mode,
    target,
    devtool: mode === 'development' ? 'eval-source-map' : void 0,
    cache: mode === 'development',
    output: {
      ...defaultConfig.output,
      filename,
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                compilerOptions: {
                  target,
                },
              },
            },
          ],
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader',
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
    ...config,
  }));

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

module.exports = config;
