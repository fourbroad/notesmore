const
    path = require('path'),
    webpack = require('webpack'),
    merge = require('webpack-merge'),
    common = require('./webpack.common.js'),
    cssNext = require('postcss-cssnext'),
    DashboardPlugin = require('webpack-dashboard/plugin'),
    MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/'
    },
    watch: true,
    devServer: {
        contentBase: [path.join(__dirname, 'frontend'), __dirname, path.join(__dirname, './dist')],
        historyApiFallback: true,
        compress: false,
        inline: true,
        watchContentBase: true,
        hot: true,
        host: '0.0.0.0',
        port: process.env.PORT || 8080,
        disableHostCheck: true,
        overlay: true,
        stats: {
            assets: true,
            children: false,
            chunks: false,
            hash: false,
            modules: false,
            publicPath: false,
            timings: true,
            version: false,
            warnings: true,
            colors: true
        }
    },
    module: {
        rules: [{
            test: /\.(sa|sc|c)ss$/,
            use: [{
                loader: MiniCssExtractPlugin.loader
            }, {
                loader: 'css-loader',
                options: {
                    sourceMap: true
                }
            }, {
                loader: 'postcss-loader',
                options: {
                    sourceMap: true,
                    plugins: () => [cssNext()]
                }
            }, {
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
        }]
    },
    plugins: [
        new DashboardPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.HotModuleReplacementPlugin()
    ]
});