var q           = require('q')
  , _           = require('underscore')
  , flags       = require('../../flags.js')
  , permission  = require('../permission.js')
  , Feed        = require('../../schemas/schemas.js').Feed;

/** Funkcje API */
var api = (function() {
    /** Zwracanie aktualności i akcji użytkowników */
    var getFeeds = function() {
        var get = function(types) {
            return Feed
                .find()
                .limit(5)
                .sort('-date')
                .where('type').in(types)
                .populate([
                      { path:'user', select:'info.name info.surname' }
                    , { path:'data.company', select:'name' }
                ])
                .exec();
        };

        const f = flags.Feeds;
        return q
            .all([
                  get([ f.REGISTER, f.COMPANY_REGISTER ])
                , get([ f.POST ])
            ])
            .then(
                _.object.bind(q, [ 'news', 'posts' ]));
    };

    /**
     * Wysyłanie informacji na stronę główną
     * @param user Użytkownik
     * @param type Typ postu
     * @param data Informacje
     */
    var sendFeed = function(user, type, data) {
        return Feed.create({
              user: user._id
            , type: type
            , data: data
        });
    };
    return  { getFeeds: getFeeds
            , auth:
                { sendFeed: sendFeed
                }
            };
}());
/**
 * Routing API
 */
module.exports = function(router) {
    router
        .route('/')
            /** Listowanie feed */
            .get(function(req, res) {
                api
                    .getFeeds()
                    .then(res.json.bind(res));
            })
            .post(permission.loggedOnly, function(req, res) {
                api.auth
                    .sendFeed(req.user, req.body.type, req.body.data)
                    .then(res.sendStatus.bind(res, 200));
            });
};