let path = require('path');
module.exports = (name,env) => {
    return {
        extensions:['.js'],
        alias:{
            //设置全局别名引用
            jQuery : path.join(__dirname,'/../src/js/lib/jquery-1.10.2')
        }
    }
}