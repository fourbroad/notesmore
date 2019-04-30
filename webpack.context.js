const 
  path = require('path'),
  webpack  = require('webpack'),
  MomentLocalesPlugin = require('moment-locales-webpack-plugin'),  
  MiniCssExtractPlugin = require("mini-css-extract-plugin"),
  cssNext = require('postcss-cssnext'),
  UglifyJsPlugin = require('uglifyjs-webpack-plugin'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  DashboardPlugin = require('webpack-dashboard/plugin');

module.exports = {
  mode: 'production',
  devtool: 'source-map',
  entry: {
    context: ['jquery', 'jquery-ui/ui/widget', 'jquery-ui/ui/data', 'bootstrap', 'popper.js', 'lodash', 'moment', 'jquery.urianchor', 'context/index.scss']
  },
  output: {
    filename: '[name].bundle.js',
    library: '[name]'
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
      use: ['file-loader']
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
      exclude: /(node_modules|bower_components)/,
      use: {
        loader:'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: [
            '@babel/plugin-transform-runtime',
            '@babel/plugin-proposal-export-default-from',
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
      test: /\.(sa|sc|c)ss$/,
      use: [{
        loader: 'style-loader',
      },{
        loader: 'css-loader',
        options: {
          sourceMap : true
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
  optimization: {
    minimizer: [
//       new TerserPlugin()
     new UglifyJsPlugin({
       sourceMap: true,
       uglifyOptions:{ie8: true}
     })
   ]
  },  
  plugins: [
    new webpack.DllPlugin({
      path: 'manifest.json',
      name: '[name]',
      context: __dirname,
    }),  
    // To strip all locales except “en”, “es-us” and “ru”
    // (“en” is built into Moment and can’t be removed)
    new MomentLocalesPlugin({
      localesToKeep: ['es-us', 'zh-cn'],
    }),  
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output both options are optional
//       filename: "[name].[chunkhash].css",
//       chunkFilename: "[name].[chunkhash].css"
      filename: '[name].bundle.css',
      chunkFilename: '[name].bundle.css',
    })
  ]
};