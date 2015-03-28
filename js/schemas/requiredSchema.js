var mongoose = require('mongoose'),
    _          = require('underscore');
module.exports = function(schema) {
    _.each(_.keys(schema), function(key) {
        schema[key].required = true;
    });
};