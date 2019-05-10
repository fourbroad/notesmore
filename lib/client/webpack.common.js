const 
  path = require('path'),
  webpack  = require('webpack'),
  MomentLocalesPlugin = require('moment-locales-webpack-plugin');

module.exports = {
  entry: {
    client: path.join(__dirname, 'index.js'),
  },
  resolve: {
    extensions: ['*', '.js'],
    alias: {
      src: path.resolve(__dirname, '.')
    },    
    modules: [
      path.join(__dirname, '.'), 
      path.resolve(__dirname, 'node_modules')
    ]
  },
  module: {
    rules: [{
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
    }]
  },
  plugins: [
    // To strip all locales except “en”, “es-us” and “ru”
    // (“en” is built into Moment and can’t be removed)
    new MomentLocalesPlugin({
      localesToKeep: ['es-us', 'zh-cn'],
    })
  ]
};