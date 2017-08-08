module.exports = (name,env,dirname) => {
    return {
        extensions:['.js'],
        alias:{
            //设置全局别名引用
            jQuery : dirname + 'src/js/lib/jquery-1.10.2'
        }
    }
}