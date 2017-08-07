module.exports = () => {
    return [
        {
            test: /\.js?$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            query: {
                presets: ['es2015','stage-0']
            }
        }
    ]
}