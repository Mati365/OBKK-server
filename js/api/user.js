var express = require('express')
  , jwt     = require('jsonwebtoken')
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
            callback(!err && users[0].auth(pass)
                ? jwt.sign(users[0], config('AUTH_SECRET'), { expiresInMinutes: 60*exp })
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
        var token = api.register(req.body.user, req.body.company, next);
    })
    /** Logowanie użytkownika */
    .post('/login', function(req, res) {
        res.json(
            api.getAccessToken(res.body.login, res.body.password, 60)
        );
    })
    /** Wylogowywanie użytkownika */
    .post('/logout', function(req, res) {

    });
module.exports = router;