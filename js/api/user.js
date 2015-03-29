var express = require('express')
  , jwt     = require('jsonwebtoken')
  , _       = require('underscore')
  , router  = express.Router()
  , config  = require('../config.js');

/** Schemas */
var User    = require('../schemas/user.js')
  , Company = require('../schemas/company.js');

/** Funkcje API */
var api = (function() {
    /**
     * Rejestracja użytkownika/firmy
     * @param  {User}    user    JSON z użytkownikiem
     * @param  {Company} company JSON z firmą
     * @param  {Func}    error   Callback w razie błędu
     */
    var register = function(user, company, error) {
        /** Tworzenie użytkownika */
        user = new User(user);
        if(user.prelegant) {
            /** TODO: Grupy i preleganci */
        }
        user.save(function(err) {
            if(err)
                error(err);
            /** Rejestracja firmy */
            if(company) {
                company = new Company(company);
                company.admin = user._id;
                company.save(function(err) {
                    if(err)
                        error(err);
                });
            }
        });
    };
    /**
     * Generowanie access token dla użytkownika
     * @param  {String}  login      Login
     * @param  {String}  pass       Hasło
     * @param  {Integer} exp        Czas wygaśnięcia tokenu(min)
     * @return  {Func}   callback(token)   Access Token
     */
    var getAccessToken = function(login, pass, exp, callback) {
        var auth = function(err, users) {
            users = users.length && users[0];
            callback(!err && users && users.auth(pass)
                ? { token: 
                        jwt.sign(
                          { info:   users.info
                          , email:  users.email
                          , groups: users.groups
                          }
                        , config('AUTH_SECRET')
                        , { expiresInMinutes: 60*exp })
                  }
                : null
            );
        };
        User
            .find({email: login})
            .limit(1)
            .exec(auth);
    };
    return { register        :   register
           , getAccessToken  :   getAccessToken
           };
}());
/**
 * Routing API
 */
router
    /** Rejestracja użytkownika */
    .put('/register', function(req, res, next) {
        api.register( req.body.user
                    , req.body.company
                    , next);
    })
    /** Logowanie użytkownika */
    .post('/login', function(req, res) {
        api.getAccessToken( req.body.login
                          , req.body.password
                          , 60
                          , _.bind(res.json, res));
    });
module.exports = router;