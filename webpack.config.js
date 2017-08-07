let webpack = require('webpack');
let path = require('path');
let getEntry = require('./webpack/get-entry');
let getOutput = require('./webpack/get-output');
let getLoaders = require('./webpack/get-loaders');
let getPlugins = require('./webpack/get-plugins');
module.exports = (name,env) => {
    let config = {};
    //入口
    config.entry = getEntry(name, env);
    //出口
    config.output = getOutput(name, env);
    //模块
    config.module = {
        loaders : getLoaders()
    };
    //后缀拓展，别名引用设置
    config.resolve = {
        extensions:['.js'],
        alias:{
            //设置全局别名引用
        }
    };
    //插件
    config.plugins = getPlugins()
    return config;
}