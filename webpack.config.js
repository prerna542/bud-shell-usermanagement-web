// NODE IMPORTS GO HERE
/* eslint-disable */
const { join, resolve } = require('path');

// PLUGIN AND THIRD PARTY IMPORTS GO HERE
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin').default;
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const {CleanWebpackPlugin}=require('clean-webpack-plugin')
const ESLintPlugin=require('eslint-webpack-plugin')

// CUSTOM IMPORTS AND CONSTANTS GO HERE
const DIRNAME = __dirname;
const isProductionEnvironment = (environment) => environment === 'production';
const BABEL_OPTIONS = require(resolve(join(DIRNAME, '/babel.config.json')));
const POSTCSS_OPTIONS = require(resolve(join(DIRNAME, '/postcss.config')));

/************ Webpack configuration object ************/

/**
 * A function that exports a webpack configuration object based on the environment
 * @param {'production'|'development'} environment The environment the bundle is needed for. Should be one of [production,development]
 * @param {boolean} watchChanges Tell webpack to watch for changes. Defaults to false
 * @returns {webpack.Configuration} A webpack configuration object
 */
module.exports = (environment, watchChanges = false) => {
  return {
    /* The entry point of the application */
    entry: {
      main: resolve(join(DIRNAME, '/src/index.js')),
    },

    /* The output definitions */
    output: {
      /* Stores Files in dist folder at Project root */
      path: resolve(join(DIRNAME, '/dist')),
      filename: 'js/[name].[contenthash].bundle.js',
      /* Clean the directory if it exists already */
      clean: true,
    },

    module: {
      rules: [
        /* Emit Images seperately if any are used in the bundle */
        {
          test: /\.(png|jpe?g|tiff|gif|webp|bmp)/,
          type: 'asset/resource',
        },
        /* Process font files if any */
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
        },
        /* Process JavaScript Files with proper loaders */
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: BABEL_OPTIONS,
            },
          ],
        },
        /* Process style sheets using loaders */
        {
          test: /\.s?css/,
          use: [
            'style-loader',
            /* MiniCssExtractPlugin extracts the CSS into seperate files */
            MiniCssExtractPlugin.loader,
            'css-loader',
            /* Postcss-loader uses autoprefixer to add browser vendor prefixes */
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: POSTCSS_OPTIONS,
              },
            },
            'sass-loader',
          ],
        },
      ],
    },

    plugins: [
      /* Use a Plugin to automatically extract CSS files */
      new MiniCssExtractPlugin({ filename: 'css/[name].css' }),

      /* Use a Plugin to create HTML File and add imports like CSS,JS automatically */
      new HtmlWebpackPlugin({
        template: resolve(join(DIRNAME, '/templates/index.ejs')),
        filename: 'index.html',
        title: 'BuddyConsole - A console to manage your BankBuddy interface',
        minify: isProductionEnvironment(environment),
      }),
      /* Use a plugin to see bundle sizes */
      new BundleAnalyzerPlugin({ analyzerMode: 'static', openAnalyzer: false }),
      new CleanWebpackPlugin(), /* Use webpack plugin to clear build folders */
      new ESLintPlugin() /* Use Eslint plugin to fix errors */
    ],

    optimization: {
      runtimeChunk: true,
      minimize: true,
      minimizer: [
        new TerserPlugin({
          exclude: /node_modules/,
          parallel: true,
          terserOptions: {
            safari10: true,
            ie8: true,
          },
        }),
        /* Use this plugin to minimize CSS files */
        new CssMinimizerPlugin(),
      ],
    },

    /* Automatically resolve JavaScript,TypeScript and JSX, TSX files
     without requiring the extension in the import */
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },

    mode: isProductionEnvironment(environment) ? environment : 'development',

    target: ['web', 'es5'],
    devtool: isProductionEnvironment(environment)
      ? false
      : 'eval-cheap-source-map',
    watch: watchChanges,
    devServer: {
      port: 9000,
      static: {
        directory: resolve(join(DIRNAME, '/dist')),
      },
      compress: false,
    },
  };
};