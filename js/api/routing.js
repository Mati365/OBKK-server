var express = require('express')
  , dir     = require('../dir.js');

/**
 * Wyszukiwanie podrouterów w podanej ścieżce
 * @param router Router rodzic
 * @param root   Katalog przeszukania
 */
module.exports.requireRoutes = function(router, root) {
    dir(function(path) {
        if (path.length && path !== 'routing')
            router.use('/' + path, [
                r = express.Router(),
                require('./routes/' + root + path + '.js')(r)
            ][0]);
    }, 'api/routes/' + root);
    return router;
};