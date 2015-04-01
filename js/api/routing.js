var expressJwt  = require('express-jwt')
  , dir         = require('../dir.js')
  , config 	    = require('../config.js');

module.exports = function(app) {
    app.use('/api', expressJwt({
        secret: config('AUTH_SECRET')
    }));
    dir(function(path) {
        if (path !== 'routing')
            app.use('/' + path, require('./' + path + '.js'));
    }, 'api');
};