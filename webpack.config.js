const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js'
    },
    resolve: {
        alias: {
          three: path.resolve('./node_modules/three')
        },
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ]
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          { from: "static", to: "" },
        ],
      }),
    ],
};