const 
  path = require('path'),
  webpack  = require('webpack'),
  VueLoaderPlugin = require('vue-loader/lib/plugin'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  MomentLocalesPlugin = require('moment-locales-webpack-plugin'),
  WorkboxPlugin = require('workbox-webpack-plugin'),
  MiniCssExtractPlugin = require("mini-css-extract-plugin"),
  HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');

module.exports = {
  entry: {
//      polyfills                         : path.join(__dirname, 'frontend/polyfills.js'),
     main                               : path.join(__dirname, 'frontend/main.js'),
    //  '@notesmore/im/im'                 : path.join(__dirname, 'frontend/im/im.vue')
       
    // index                              : path.join(__dirname, 'frontend/index.js'),
    // '@notesabc/calendar/calendar'      : path.join(__dirname, 'frontend/calendar/calendar.js'),
    // '@notesabc/im/im'                  : path.join(__dirname, 'frontend/im/im.js'),
    // '@notesabc/dashboard/dashboard'    : path.join(__dirname, 'frontend/dashboard/dashboard.js'),
    // '@notesabc/email/email'            : path.join(__dirname, 'frontend/email/email.js'),
    // '@notesabc/form/form'              : path.join(__dirname, 'frontend/form/form.js'),
    // '@notesabc/login/login'            : path.join(__dirname, 'frontend/login/login.js'),
    // '@notesabc/signup/signup'          : path.join(__dirname, 'frontend/signup/signup.js'),
    // '@notesabc/uploadfiles/uploadfiles': path.join(__dirname, 'frontend/uploadfiles/uploadfiles.js'),
    // '@notesabc/view/view'              : path.join(__dirname, 'frontend/view/view.js'),
    // '@notesabc/workbench/workbench'    : path.join(__dirname, 'frontend/workbench/workbench.js')
  },
  resolve: {
    extensions: ['*', '.js', '.vue', '.json'],
    alias: {
      vue$: 'vue/dist/vue.esm.js',
      frontend: path.resolve(__dirname, 'frontend'),
      lib: path.resolve(__dirname, 'lib'),
      test: path.resolve(__dirname, 'test')
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
      test:/\.vue$/,
      use:['vue-loader']
    },{
      test: /\.(js)$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader:'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: [
            '@babel/plugin-transform-runtime',
            '@babel/plugin-proposal-export-default-from',
            '@babel/plugin-transform-arrow-functions',
            '@babel/plugin-syntax-dynamic-import',
            '@babel/plugin-proposal-object-rest-spread', // [v,] => [v]
            '@babel/plugin-proposal-export-namespace-from',
            '@babel/plugin-proposal-class-properties',
            '@babel/plugin-transform-template-literals', // `foo${bar}` => "foo".concat(bar)
//             '@babel/plugin-transform-modules-commonjs',
            ['@babel/plugin-proposal-decorators', {
              "decoratorsBeforeExport": true
            }]
          ]
        }
      }
    },{
      test: /\.html$/,
      use: [{
        loader: 'html-loader',
        options: {
          minimize: true
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
      test: require.resolve('moment'),
      use: [{
        loader: 'expose-loader',
        options: 'moment'
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
//     splitChunks: {
//       chunks: 'all'
//     }
  }, 
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      'window.$': 'jquery',
      moment: 'moment',
      'window.moment': 'moment',
      _: 'lodash',
      'window._':'lodash',
      Popper: ['popper.js', 'default']
    }),
    new VueLoaderPlugin(),
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
    // new HtmlWebpackPlugin({title: "Notesmore"}),
//     new HtmlWebpackIncludeAssetsPlugin({
//       assets: ['context.bundle.js'],
//       append: false
//     }),
//     new webpack.DllReferencePlugin({
//       context: __dirname,
//       manifest: require('./manifest.json'),
//     }),
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