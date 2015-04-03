var express = require('express')
  , jwt     = require('jsonwebtoken')
  , _       = require('underscore')
  , async   = require('async')
  , router  = express.Router()
  , config  = require('../config.js');

/** Schemas */
var User    = require('../schemas/user.js')
  , Company = require('../schemas/company.js');

/** Funkcje API */
var api = (function() {
    /**
     * Rejestracja użytkownika/firmy
     * @param  {User}    user     JSON z użytkownikiem
     * @param  {Company} company  JSON z firmą
     * @param  {Func}    callback Callback
     */
    var register = function(user, company, callback) {
        async.waterfall(
            [ function(next) {
                /** Rejestracja użytkownika */
                user = new User(user);
                if(user.prelegant) {
                    /** TODO: Grupy i prelegenci */
                }
                user.save(function(err) {
                    next(err && 'Użytkownik o podanym emailu już istnieje');
                });
              }
              /**
               * Rejestracja firmy
               */
            , function(next) {
                if(typeof company === 'undefined')
                    return next(null);
                
                company = new Company(company);
                company.admin = user._id;
                company.save(function(err) {
                    next(err && 'Firma o podanej nazwie już istnieje');
                });
              }
            ], callback);
    };
    /**
     * Generowanie access token dla użytkownika
     * @param  {String}  login      Login
     * @param  {String}  pass       Hasło
     * @param  {Integer} exp        Czas wygaśnięcia tokenu(min)
     * @return {Func}    callback(token)   Access Token
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
                    , function(err) {
            if(!err)
                res.sendStatus(200);
            else
                next(err);
        });
    })
    /** Logowanie użytkownika */
    .post('/login', function(req, res) {
        api.getAccessToken( req.body.login
                          , req.body.password
                          , 60
                          , _.bind(res.json, res));
    });
module.exports = router;