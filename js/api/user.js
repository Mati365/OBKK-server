var _       = require('underscore')
  , jwt     = require('jsonwebtoken')
  , async   = require('async')
  , config  = require('../config.js');

/** Schemas */
var Schemas = require('../schemas/schemas.js')
  , User    = Schemas.User
  , Company = Schemas.Company
  , Feed    = Schemas.Feed;


/** Funkcje API */
var api = (function() {
    /**
     * Rejestracja użytkownika/firmy
     * @param  {User}    user     JSON z użytkownikiem
     * @param  {Company} company  JSON z firmą
     * @param  {Func}    callback Callback
     */
    var register = function(user, company, callback) {
        var users = company.users;
        async.waterfall(
            [ function(next) {
                /** Rejestracja użytkownika */
                user = new User(user);
                if(user.prelegant) {
                    /** TODO: Grupy i prelegenci */
                    user.access = 0x2;
                }
                user.save(function(err) {
                    if(!err)
                        Feed.create(
                            { user: user._id
                            , type: 'REGISTER'
                            , data: { msg: 'zarejestrowano użytkownika' }
                            });
                    next(err && 'Użytkownik o podanym emailu już istnieje');
                });
              }
            , function(next) {
                /** Rejestracja firmy */
                if(_.isEmpty(company) || _.isEqual(company, { users: [] }))
                    return next(null);
                
                /** Użytkownicy, którzy muszą być potwierdzeni */
                company = new Company(company);
                company.admin = user._id;
                company.save(function(err) {
                    if(!err)
                        Feed.create(
                            { user: user._id
                            , type: 'COMPANY_REGISTER'
                            , data: 
                                { msg: 'zarejestrowano firmę'
                                , company: company._id
                                }
                            });
                    next(err && 'Firma o podanej nazwie już istnieje');
                });
              }
            , function(next) {
                /** Szukanie zduplikowanych użytkowników */
                User.find({
                    'email': { 
                        $in: _(users).pluck('email') 
                    }
                }, function(err, docs) {
                    next(docs.length 
                        && 'Na liście znajduje się użytkownik, który jest już zarejestrowany w systemie!');
                });
            }
            , function(next) {
                /** Etap finalny, tworzenie użytkowników i dodawanie go do firmy */
                async.each(
                      users
                    , function(tempUser, callback) {
                        var u = new User({
                              email: tempUser.email
                            , password: ''
                            , info: 
                                { name: tempUser.name
                                , surname: tempUser.surname
                                }
                            , disabled: true
                        }).save(function(err, u) {
                            company.members.push(u._id);
                            callback();
                        });
                    }
                    , function() {
                        company.update({
                            members: company.members
                        }, next);
                    });
            } ], _(callback).wrap(function(fn, err) {
                /** Sprzątanie po sobie */
                if(err) {
                    user.remove && user.remove();
                    company.remove && company.remove();
                }
                fn(err);
            }));
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
                        , { expiresInMinutes: 48 * 60 * exp })
                  }
                : null
            );
        };
        User
            .find({ email: login })
            .populate('groups', '-_id -__v')
            .limit(1)
            .exec(auth);
    };
    return  { register:   register
            , getAccessToken:   getAccessToken
            };
}());
/** Routing api */
module.exports = function(router) {
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
        .post('/login', function(req, res, next) {
            var callback = function(token) {
                if(token)
                    res.json(token);
                else
                    next('Nieprawidłowe dane logowania');
            };
            api.getAccessToken( req.body.login
                              , req.body.password
                              , 60
                              , callback);
        });
};