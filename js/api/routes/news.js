var jwt     = require('jsonwebtoken')
  , config  = require('../../config.js');

/** Schemas */
var Feed    = require('../../schemas/schemas.js').Feed;

/** Funkcje API */
var api = (function() {
    var getFeeds = function() {
        Feed
            .find()
            .limit(10)
            .sort('-date')
            .populate([
                  { path:'user', select:'info.name info.surname' }
                , { path:'data.company', select:'name' }
            ])
            .exec();
    };
    return  { getFeeds: getFeeds
            };
}());
/**
 * Routing API
 */
module.exports = function(router) {
    router
        /** Listowanie feed */
        .get('/', function(req, res, next) {
            api
                .getFeeds()
                .exec(res.json.bind(res));
        });
};