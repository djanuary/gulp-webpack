module.exports = (name,env,dirname) => ({
    path :dirname + '/dist/',
    publicPath : '',
    filename : name + '/js/[name].js'
})