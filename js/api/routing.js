var expressJwt  = require('express-jwt')
  , express     = require('express')
  , dir         = require('../dir.js')
  , config      = require('../config.js');

module.exports = function(app) {
    app.use('/api', expressJwt({
        secret: config('AUTH_SECRET')
    }));
    dir(function(path) {
        if (path !== 'routing')
            app.use('/' + path, [ 
                r = express.Router(), 
                require('./' + path + '.js')(r) 
            ][0]);
    }, 'api');
};