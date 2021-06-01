const webpack = require('webpack');
const path = require('path');

const isProd = process.env.NODE_ENV === 'production';

const envPlugin = new webpack.EnvironmentPlugin(['NODE_ENV', 'TOKEN_ADDRESS']);

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
        entry: {
            'signup': `./theme/signup.tsx`,
        },
        // devtool: 'source-map',
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.jsx', '.png', '.svg'],
            modules: [
                path.resolve('./node_modules')
            ]
        },
        module: {
            rules: [
                ...rules,
                ...rendererRules,
            ],
        },
        output: {
            path: __dirname + '/gthemes/Casper/assets/react',
            publicPath:  '/',
            filename: `[name].js`,
        },
        plugins: [
            envPlugin,
        ],
    },
];