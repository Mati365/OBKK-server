var express     = require('express')
  , dir         = require('../dir.js');

module.exports = function(app) {
    dir(function(path) {
        if (path !== 'routing')
            app.use('/' + path, [
                r = express.Router(),
                require('./routes/' + path + '.js')(r)
            ][0]);
    }, 'api/routes');
};