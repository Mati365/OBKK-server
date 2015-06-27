var _       = require('underscore')
  , config  = require('../config.js');

/** Schemas */
var Order   = require('../schemas/schemas.js').Order;

/** Funkcje API */
var api = (function() {
    return {
        /** Pobieranie wszystkich ofert */
        getOrders: function(callback) {
            Order
                .find({})
                .limit(10)
                .select('name price')
                .exec(callback);
        }
    };
}());
/**
 * Routing API
 */
module.exports = function(router) {
    router
        /** Listowanie ofert */
        .get('/', function(req, res, next) {
            api.getOrders(function(err, orders) {
                res.json(orders);
            });
        });
};