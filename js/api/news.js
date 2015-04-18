var express = require('express')
  , jwt     = require('jsonwebtoken')
  , router  = express.Router()
  , config  = require('../config.js');

/** Schemas */
var Feed    = require('../schemas/schemas.js').Feed;

/** Funkcje API */
var api = (function() {
    var getFeeds = function(callback) {
        Feed
            .find()
            .limit(10)
            .sort('-date')
            .populate([
                  {path:'user', select:'info.name info.surname'}
                , {path:'data.company', select:'name'}
            ])
            .exec(callback);
    };
    return {
        getFeeds: getFeeds
    };
}());
/**
 * Routing API
 */
router
    /** Listowanie feed */
    .get('/', function(req, res, next) {
        api.getFeeds(function(err, feeds) {
            res.json(feeds);
        });
    });
module.exports = router;