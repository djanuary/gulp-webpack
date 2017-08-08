let webpack = require('webpack');
module.exports = (name, env) => {
    /*
        ModuleConcatenationPlugin
        https://zhuanlan.zhihu.com/p/27828233
        如果对于webpack前两个版本了解的同学，应该知道，
        在打包后的文件里面，每个模块都会被包装在一个单独的函数闭包中，
        这些闭包会导致你JS在浏览器中的执行速度变慢，并且会导致内存占用率增加，
        而另外的打包工具rollup则是将所有的模块包装在一个大的闭包中
        所以在webpack3中增加了这个功能，我们可以在配置项中添加对应的配置来开启该功能
    */
    let plugins = [
        new webpack.ProvidePlugin({
            $ : 'jQuery',
            jQuery : 'jQuery',
        }),
        new webpack.optimize.ModuleConcatenationPlugin(),
        new webpack.optimize.CommonsChunkPlugin('vendor')
    ];
    //生产环境进行压缩
    if(env == 'pro'){
        plugins.push(new webpack.optimize.UglifyJsPlugin());
    }
    return plugins;
}