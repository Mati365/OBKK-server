var _           = require('underscore')
  , expressJwt  = require('express-jwt')
  , config      = require('../../config.js');

/** Schemas */
var Schemas = require('../../schemas/schemas.js')
  , User    = Schemas.User
  , Module = Schemas.Module;

/** Funkcje API */
var api = (function() {
    /**
     * Informacje o użytkowniku
     * @param  {String} id Identyfikator użytkownika
     */
    var userInfo = function(id) {
        return User
            .findOne({ _id: id })
            .exec();
    };

    /**
     * Aktualizacja użytkownika
     * @param  {String} id   Identyfikator użytkownika
     * @param  {Array}  data Informacje o użytkowniku
     */
    var updateUser = function(id, data) {
        User.update(
              { _id: id }
            , data
            , { multi: true });
    };

    /** Lista użytkowników */
    var listUsers = function() {
        return User
            .find({})
            .select('email groups info.name info.surname mods')
            .populate('mods', '-__v')
            .exec();
    };

    /**
     * Rozpakowuje moduły
     * @param {Array} mods Lista modułów(nazwy)
     */
    var describeMods = function(mods) {
        return Module
            .where('name').in(mods)
            .select('-_id -__v')
            .exec();
    };

    /**
     * Kasowanie użytkownika
     * @param  {String} id Identyfikator użytkownika
     */
    var deleteUser = function(id) {
        User
            .find({ _id: id })
            .remove()
            .exec();
    };
    return  { userInfo: userInfo
            , updateUser: updateUser
            , listUsers: listUsers
            , deleteUser: deleteUser
            , describeMods: describeMods
            };
}());
/** Routing api */
module.exports = function(router) {
    router
        .use(expressJwt({
            secret: config.AUTH_SECRET
        }))

        /** API chronione */
        .get('/info', function(req, res) {
        })
        .get('/mods', function(req, res) {
            api.describeMods(req.user.mods).then(res.json.bind(res));
        })
        .route('/:id')
            /** Informacje u użytkowniku */
            .get(function(req, res) {
                api.userInfo(req.params.id).then(res.json.bind(res));
            })
            /** Kasowanie użytkownika */
            .delete(function(req) {
                api.deleteUser(req.params.id);
            })
            /** Aktualizowanie yżytkownika */
            .put(function(req) {
                api.updateUser(req.body);
            });
};