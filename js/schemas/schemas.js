var _   = require('underscore')
  , dir = require('../dir.js');

(function() {
    dir(function(path) {
        if (!([ 'schemas', 'flags'].indexOf(path) + 1))
            module.exports[path] = require('./' + path + '.js');
    }, 'schemas');
}());