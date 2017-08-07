let path = require('path');
module.exports = (name,env) => ({
    path : path.join(__dirname,'/../dist/'),
    publicPath : '',
    filename : name + '/js/[name].js'
})