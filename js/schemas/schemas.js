var _   = require('underscore')
  , dir = require('../dir.js');

(function() {
    dir(function(path) {
        if (path !== 'schemas')
            module.exports[path] = require('./' + path + '.js');
    }, 'schemas');
}());