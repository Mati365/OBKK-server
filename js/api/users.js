var _       = require('underscore'),
    User    = require('../schemas/schemas.js').User;

/**
 * Narzędzia wykorzystywane do zarządzania
 * użytkownikami, kasowanie, dodawanie, info itp
 */
var api = (function() {
        /**
     * Informacje o użytkowniku
     * @param  {String}     id          Identyfikator użytkownika
     * @param  {Function}   callback    Callback
     */
    var userInfo = function(id, callback) {
        User.findOne({ _id: id }, callback); 
    };
    /**
     * Aktualizacja użytkownika
     * @param  {String} id   Identyfikator użytkownika
     * @param  {Array}  data Informacje o użytkowniku
     */
    var updateUser = function(id, data) {
        User.update( { _id: id }
                   , data
                   , { multi: true }); 
    };
    /**
     * Lista użytkowników
     * @param  {Function} callback Callback
     */
    var listUsers = function(callback) {
        User
            .find({})
            .select('email groups info.name info.surname')
            .populate('groups', 'name dom.icon -_id')
            .exec(callback);
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
            };
}());
module.exports = function(router) {
    router
        /** Informacje u użytkowniku, użytkownikach */
        .get('/:id?', function(req, res) {
            if(_.isUndefined(req.params.id))
                api.listUsers(function(err, obj) {
                    res.json(obj);
                });
            else
                api.userInfo(req.params.id, function(err, obj) {
                    res.json(obj);
                });
        })
        /** Kasowanie użytkownika */
        .delete('/:id', function(req, res) { 
            api.deleteUser(req.params.id); 
        })
        /** Aktualizowanie yżytkownika */
        .put('/:id', function(req, res) { 
            api.updateUser(req.body); 
        });
};