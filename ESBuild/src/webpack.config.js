import path from 'path';
import webpack from 'webpack';

export default {
    mode: 'development', // explicitly set mode
    entry: './src/index.js',
    output: {
        filename: 'bundle.user.js',
        path: path.resolve(process.cwd(), 'dist')
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                parser: { sourceType: 'module' },  // force module parsing
                use: 'babel-loader'
            }
        ]
    },
    plugins: [
        new webpack.BannerPlugin({
            banner: `// ==UserScript==
// @name         AMaxOffer
// @version      2.2
// @license      CC BY-NC-ND 4.0
// @description  AMaxOffer Offers and Account Management Tool for American Express Site
// @match        https://global.americanexpress.com/*
// @connect      uscardforum.com
// @grant        GM.xmlHttpRequest
// @grant        unsafeWindow
// ==/UserScript==`,
            raw: true
        })
    ]
};
