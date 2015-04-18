var express = require('express')
  , jwt     = require('jsonwebtoken')
  , _       = require('underscore')
  , async   = require('async')
  , router  = express.Router()
  , config  = require('../config.js');

/** Schemas */
var Order    = require('../schemas/schemas.js').Order;

/** Funkcje API */
var api = (function() {
    return {
        /** Pobieranie wszystkich ofert */
        getOrders: function(callback) {
            Order
                .find({})
                .limit(10)
                .exec(callback);
        }
    };
}());
/**
 * Routing API
 */
router
    /** Listowanie ofert */
    .get('/', function(req, res, next) {
        api.getOrders(function(err, orders) {
            res.json(orders);
        });
    });
module.exports = router;