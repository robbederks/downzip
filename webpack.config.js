const path = require('path');

module.exports = {
    entry: './src/downzip.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'DownZip',
        libraryTarget: 'umd'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            }
        ]
    }
};