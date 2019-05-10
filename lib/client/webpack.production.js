const
  path = require('path'),
  webpack = require('webpack'),
  merge = require('webpack-merge'),
  common = require('./webpack.common.js'),  
  ManifestPlugin = require('webpack-manifest-plugin'),
  UglifyJsPlugin = require('uglifyjs-webpack-plugin'),
  TerserPlugin = require('terser-webpack-plugin');

const ASSET_PATH = process.env.ASSET_PATH || '/';

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  output: {
//     filename: '[name].[contenthash].js',
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: ASSET_PATH,
    library: "client",
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  externals: {
    lodash: {
      commonjs: 'lodash',
      commonjs2: 'lodash',
      amd: 'lodash',
      root: '_'
    }
  },
  plugins: [
//     new ManifestPlugin(),    
    new webpack.HashedModuleIdsPlugin(),
    new webpack.DefinePlugin({'process.env.ASSET_PATH': JSON.stringify(ASSET_PATH)})
  ]
});