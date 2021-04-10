const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

const isProd = process.env.NODE_ENV === 'production';

const envPlugin = new webpack.EnvironmentPlugin(['NODE_ENV']);

const rules = [
    {
        test: /\.node$/,
        use: 'node-loader',
    },
    {
        test: /\.tsx?$/,
        exclude: /(node_modules|.webpack)/,
        loaders: [{
            loader: 'ts-loader',
            options: {
                transpileOnly: true,
            },
        }],
    },
];

const rendererRules = [
    {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [
            'file-loader',
            {
                loader: 'image-webpack-loader',
                options: {
                    publicPath: 'assets',
                    bypassOnDebug: true, // webpack@1.x
                    disable: true, // webpack@2.x and newer
                },
            },
        ],
    },
    {
        test: /\.(s[ac]ss|css)$/i,
        use: [
            // Creates `style` nodes from JS strings
            'style-loader',
            // Translates CSS into CommonJS
            'css-loader',
            // Compiles Sass to CSS
            'sass-loader',
        ],
    },
];

module.exports = [
    {
        mode: isProd ? 'production' : 'development',
        entry: [
            `./server/index.ts`,
        ],
        target: "node",
        devtool: 'source-map',
        externals: [nodeExternals()],
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.jsx', '.png', '.svg'],
        },
        module: {
            rules: [
                ...rules,
            ],
        },
        output: {
            path: __dirname + '/build-server',
            filename: `server.js`,
        },
        plugins: [
            envPlugin,
        ],
    },
];