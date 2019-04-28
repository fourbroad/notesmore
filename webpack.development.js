const
  path = require('path'),
  webpack = require('webpack'),  
  merge = require('webpack-merge'),
  common = require('./webpack.common.js'),
  cssNext = require('postcss-cssnext'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin'),
  DashboardPlugin = require('webpack-dashboard/plugin');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    index                              : path.join(__dirname, 'frontend/index.js'),
    '@notesabc/calendar/calendar'      : path.join(__dirname, 'frontend/calendar/calendar.js'),
    '@notesabc/im/im'                  : path.join(__dirname, 'frontend/im/im.js'),
    '@notesabc/dashboard/dashboard'    : path.join(__dirname, 'frontend/dashboard/dashboard.js'),
    '@notesabc/email/email'            : path.join(__dirname, 'frontend/email/email.js'),
    '@notesabc/form/form'              : path.join(__dirname, 'frontend/form/form.js'),
    '@notesabc/login/login'            : path.join(__dirname, 'frontend/login/login.js'),
    '@notesabc/signup/signup'          : path.join(__dirname, 'frontend/signup/signup.js'),
    '@notesabc/uploadfiles/uploadfiles': path.join(__dirname, 'frontend/uploadfiles/uploadfiles.js'),
    '@notesabc/view/view'              : path.join(__dirname, 'frontend/view/view.js'),
    '@notesabc/workbench/workbench'    : path.join(__dirname, 'frontend/workbench/workbench.js')
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
  watch: true,
  devServer: {
    contentBase: [path.join(__dirname, 'frontend'), __dirname, path.join(__dirname, './dist')],
    historyApiFallback : true,
    compress           : false,
    inline             : true,
    watchContentBase   : true,
    hot                : true,
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
            path.join(__dirname, 'frontend'),
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
    }]
  },
  plugins: [
//     new webpack.ProvidePlugin({
//       $: 'jquery',
//       jQuery: 'jquery',
//       'window.$': 'jquery',
//       'window.jQuery': 'jquery',
//       moment: 'moment',
//       'window.moment': 'moment',
//       _: 'lodash',
//       'window._':'lodash',
//       Popper: ['popper.js', 'default']
//     }),  
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require('./manifest.json'),
    }),
    new HtmlWebpackPlugin({title:'Notesmore Workbench'}),
    new HtmlWebpackIncludeAssetsPlugin({
      assets: ['dist/context.bundle.js'],
      append: false
    }),
    new DashboardPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ]
});