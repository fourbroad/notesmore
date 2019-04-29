const 
  path = require('path'),
  webpack  = require('webpack'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  MomentLocalesPlugin = require('moment-locales-webpack-plugin'),
  WorkboxPlugin = require('workbox-webpack-plugin'),
  MiniCssExtractPlugin = require("mini-css-extract-plugin"),
  HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');

module.exports = {
  entry: {
    index                              : path.join(__dirname, 'frontend/index.js'),
     polyfills                         : path.join(__dirname, 'frontend/polyfills.js'),
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
  resolve: {
    extensions: ['.webpack-loader.js', '.web-loader.js', '.loader.js', '.js'],
    alias: {
      frontend: path.resolve(__dirname, 'frontend'),
      lib: path.resolve(__dirname, 'lib'),
      test: path.resolve(__dirname, 'test'),
      'jquery-ui/ui/widget': 'blueimp-file-upload/js/vendor/jquery.ui.widget.js',
      'canvas-to-blob': 'blueimp-canvas-to-blob/js/canvas-to-blob.js',
      'load-image': 'blueimp-load-image/js/load-image.js',
      'load-image-exif': 'blueimp-load-image/js/load-image-exif.js',
      'load-image-meta': 'blueimp-load-image/js/load-image-meta.js',
      'load-image-scale': 'blueimp-load-image/js/load-image-scale.js'
    },    
    modules: [
      path.join(__dirname, 'frontend'), 
      path.join(__dirname, 'lib'),
      path.resolve(__dirname, 'node_modules')
    ]
  },
  module: {
    rules: [{
      test: /\.(eot|svg|ttf|otf|woff|woff2)$/,
      use: [{
        loader: 'file-loader',
        options: {
          outputPath: 'assets/fonts'
        }        
      }]
    },{
      test: /\.(png|gif|jpg|svg)$/,
      use: [{
        loader: 'file-loader',
        options: {
          outputPath: 'assets/images'
        }
      }]
    },{
      test: /\.(js)$/,
      use: ['babel-loader']
    },{
      test: /\.html$/,
      use: [{
        loader: 'html-loader',
        options: {
          minimize: true
        }
      }]
    }]
  },
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  }, 
//   optimization: {
//     splitChunks: {
//       chunks: 'all'
//     }
//   },  
  plugins: [
    // To strip all locales except “en”, “es-us” and “ru”
    // (“en” is built into Moment and can’t be removed)
    new MomentLocalesPlugin({
      localesToKeep: ['es-us', 'zh-cn'],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'frontend/index.html'),
      path: path.join(__dirname, 'dist'),
      filename: 'index.html',
      inject: true,
      minify: {
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
        removeComments: true,
        useShortDoctype: true
      },
    }),
//     new HtmlWebpackIncludeAssetsPlugin({
//       assets: ['dist/context.bundle.js'],
//       append: false
//     }),
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require('./manifest.json'),
    }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output both options are optional
//       filename: "[name].[chunkhash].css",
//       chunkFilename: "[name].[chunkhash].css"
      filename: '[name].bundle.css',
      chunkFilename: '[name].bundle.css',
    }),
    new WorkboxPlugin.GenerateSW({
      // these options encourage the ServiceWorkers to get in there fast 
      // and not allow any straggling "old" SWs to hang around
      clientsClaim: true,
      skipWaiting: true
    })    
  ]
};