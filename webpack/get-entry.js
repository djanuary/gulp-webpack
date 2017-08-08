let path = require('path');
module.exports = (name,env) => {
    let entry = {};
    let mainJs = name + '-main';
    entry[mainJs] = path.join(__dirname,'/../src/js/' + mainJs);
    entry['vendor'] = ['jQuery'];  //此设置可是设置需要单独打包模块
    return entry;
}