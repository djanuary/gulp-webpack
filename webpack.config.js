let webpack = require('webpack');
let path = require('path');
let getEntry = require('./webpack/get-entry');
let getOutput = require('./webpack/get-output');
let getLoaders = require('./webpack/get-loaders');
let getPlugins = require('./webpack/get-plugins');
let getResolve = require('./webpack/get-resolve');
module.exports = (name,env) => {
    let config = {};
    let dirname = path.join(__dirname,'/');
    //入口
    config.entry = getEntry(name, env,dirname);
    //出口
    config.output = getOutput(name, env,dirname);
    //模块
    config.module = {
        loaders : getLoaders(name, env)
    };
    //后缀拓展，别名引用设置
    config.resolve = getResolve(name, env,dirname);
    //插件
    config.plugins = getPlugins(name,env);
    return config;
}