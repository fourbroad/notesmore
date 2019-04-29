const
  path = require('path'),
  webpack = require('webpack'),
  merge = require('webpack-merge'),
  common = require('./webpack.common.js'),
  cssNext = require('postcss-cssnext'),
  ManifestPlugin = require('webpack-manifest-plugin'),  
  MiniCssExtractPlugin = require("mini-css-extract-plugin"),
  TerserPlugin = require('terser-webpack-plugin'),
  CopyWebpackPlugin = require('copy-webpack-plugin'),
  ImageminPlugin    = require('imagemin-webpack-plugin').default;

const ASSET_PATH = process.env.ASSET_PATH || '/';

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  output: {
//     filename: '[name].[contenthash].js',
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: ASSET_PATH,
    library: "_@notesabc/[name]".replace(/[\.,@,/,-]/g,'_'),
    libraryTarget: 'umd'
  },
  devServer: {
    contentBase : path.join(__dirname, 'dist'),
    historyApiFallback : true,
    compress           : true,
    inline             : false,
    watchContentBase   : true,
    hot                : false,
    host               : '0.0.0.0',
    port               : process.env.PORT || 8080,
    disableHostCheck   : true,
    overlay            : true,
    stats: {
      assets     : true,
      children   : false,
      chunks     : false,
      hash       : false,
      modules    : false,
      publicPath : false,
      timings    : true,
      version    : false,
      warnings   : true,
      colors     : true
    }
  },
  module:{
    rules:[{
      test: /\.(sa|sc|c)ss$/,
      use: [{
        loader: MiniCssExtractPlugin.loader,
      },{
        loader: 'css-loader',
        options: {
          sourceMap : false,
          minimize  : true
        }
      },{
        loader: 'postcss-loader',
        options: {
          sourceMap: false,
          plugins: () => [cssNext()]
        }
      },{
        loader: 'sass-loader',
        options: {
          sourceMap: false,
          includePaths: [
            path.join(__dirname, 'node_modules'),
            path.join(__dirname, 'frontend', 'assets', 'styles'),
            path.join(__dirname, 'frontend')
          ]
        }
      }]
    }]
  },
  optimization: {
    minimizer: [new TerserPlugin()],
  },  
  plugins: [
//     new webpack.ProvidePlugin({
//       $: 'jquery',
//       jQuery: 'jquery',
//       'window.jQuery': 'jquery',
//       'window.$': 'jquery',
//       moment: 'moment',
//       'window.moment': 'moment',
//       _: 'lodash',
//       'window._':'lodash',
//       Popper: ['popper.js', 'default']
//     }),
    new CopyWebpackPlugin([{
      from : path.join(__dirname, 'frontend/context/static'),
      to   : path.join(__dirname, 'dist/context/static')
    }]),
//     new ManifestPlugin(),    
    new webpack.HashedModuleIdsPlugin(),
    new ImageminPlugin(),
    new webpack.DefinePlugin({'process.env.ASSET_PATH': JSON.stringify(ASSET_PATH)})
  ]
});