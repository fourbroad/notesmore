const 
  path = require('path'),
  webpack = require('webpack'),
  merge = require('webpack-merge'),
  common = require('./webpack.common.js'),
  cssNext = require('postcss-cssnext'),
  MiniCssExtractPlugin = require("mini-css-extract-plugin"),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin'),
  CopyWebpackPlugin = require('copy-webpack-plugin'),
  ImageminPlugin    = require('imagemin-webpack-plugin').default;

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
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
    publicPath: '/',
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
    new HtmlWebpackPlugin({title:'Notesmore Workbench'}),
    new HtmlWebpackIncludeAssetsPlugin({
      assets: ['context.bundle.js'],
      append: false
    }),
    new CopyWebpackPlugin([{
      from : path.join(__dirname, 'frontend/context/static'),
      to   : path.join(__dirname, 'dist/context/static')
    }]),
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require('./manifest.json'),
    }),  
    new ImageminPlugin(),
    new webpack.DefinePlugin({'process.env.NODE_ENV': JSON.stringify('production')})
  ]
});