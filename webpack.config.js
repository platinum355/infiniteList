let webpack            = require('webpack');

module.exports = {
    mode:'development',
    entry: {
        index:'./infiniteList/index.js'
    },
    output: {
        path:__dirname + '/infiniteList/bundle',
        filename:'[name]-bundle.js'
    },
    plugins:[
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': '"production"',
                'BROWSER':JSON.stringify(true)
            }
        })
    ],
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['react', 'es2017', 'stage-0']
                }
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader'
            }
        ]
    }
};