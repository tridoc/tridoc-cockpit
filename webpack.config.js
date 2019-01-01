const path = require('path');

module.exports = [{
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 9000
    },
    entry: path.resolve(__dirname, 'src') + "/scss/style.scss",
    output: {
        // This is necessary for webpack to compile
        // But we never use style-bundle.js
        path: path.resolve('dist/'),
        filename: 'style-bundle.js',
    },
    module: {
        rules: [{
            test: /\.scss$/,
            use: [{
                    loader: 'file-loader',
                    options: {
                        path: path.resolve('generated/'),
                        name: 'style.css',
                    },
                },
                /* { loader: 'css-loader' },*/
                {
                    loader: 'sass-loader',
                    options: {
                        includePaths: ['./node_modules'],
                        implementation: require("sass")
                    }
                }
            ]
        }]
    },
}, {
    entry: path.resolve(__dirname, 'src/js/index.js'),
    output: {
        path: path.resolve("dist/"),
        filename: "index.js"
    },
    module: {
        rules: [{
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            options: {
                presets: ['@babel/preset-env']
            }
        }]
    },
    devtool: 'source-map',
}];