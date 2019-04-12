const
  path = require('path'),
  webpack = require('webpack'),  
  merge = require('webpack-merge'),
  common = require('./webpack.common.js'),
  cssNext = require('postcss-cssnext'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  DashboardPlugin = require('webpack-dashboard/plugin');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  entry: {
    context: ['jquery', 'jquery-ui/ui/widget', 'jquery-ui/ui/data', 'bootstrap', 'popper.js', 'lodash', 'moment', 'jquery.urianchor', 'context/index.scss']
  },
  output: {
    filename: '[name].bundle.js',
    library: '[name]'
  },
  module:{
    rules:[{
      test: /\.(sa|sc|c)ss$/,
      use: [{
        loader: 'style-loader',
      },{
        loader: 'css-loader',
        options: {
          sourceMap : true,
          minimize  : false
        }
      },{
        loader: 'postcss-loader',
        options: {
          sourceMap: true,
          plugins: () => [cssNext()]
        }
      },{
        loader: 'sass-loader',
        options: {
          sourceMap: true,
          includePaths: [
            path.join(__dirname, 'node_modules'),
            path.join(__dirname, 'src'),
            path.join(__dirname, 'test')
          ]
        }
      }]
    },{
      test: require.resolve('jquery'),
      use: [{
        loader: 'expose-loader',
        options: 'jQuery'
      },{
        loader: 'expose-loader',
        options: '$'
      }]
    },{
      test: require.resolve('lodash'),
      use: [{
        loader: 'expose-loader',
        options: '_'
      }]
    },{
      test: require.resolve('moment'),
      use: [{
        loader: 'expose-loader',
        options: 'moment'
      }]
    }]
  },
  plugins: [
//     new CleanWebpackPlugin([path.resolve(__dirname, 'dist')]),  
    new webpack.DllPlugin({
      path: 'manifest.json',
      name: '[name]',
      context: __dirname,
    })
  ]
});