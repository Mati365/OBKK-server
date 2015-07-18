/** Schemas */
var Order   = require('../../schemas/schemas.js').Order;

/** Funkcje API */
var api = (function() {
    return {
        /** Pobieranie wszystkich ofert */
        getOrders: function() {
            return Order
                .find({})
                .limit(10)
                .select('name price')
                .exec();
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
            api
                .getOrders()
                .then(res.json.bind(res));
        });
};