var _       = require('underscore')
  , jwt     = require('jsonwebtoken')
  , async   = require('async')
  , archy   = require('archy')
  , colors  = require('colors')
  , config  = require('../../config.js')
  , flags   = require('../../flags.js')
  , mail    = require('../../mail.js');

/** Schemas */
var Schemas = require('../../schemas/schemas.js')
  , User    = Schemas.User
  , Company = Schemas.Company
  , Feed    = Schemas.Feed
  , Module  = Schemas.Module;

var api = (function() {
    /**
     * Rejestracja użytkownika/firmy
     * @param  {User}     user     JSON z użytkownikiem
     * @param  {Company}  company  JSON z firmą
     * @param  {Function} callback Callback
     */
    var register = function(user, company, callback) {
        /** Tworzenie użytkownika */
        var createUser = function(next) {
            if(user.prelegant)
                user.access = 0x2;

            /** Rejestracja użytkownika */
            user = new User(user);
            user.save(function(err) {
                if(!err)
                    Feed.create(
                        { user: user._id
                        , type: flags.Feeds.REGISTER
                        , data: { msg: 'zarejestrowano użytkownika' }
                        });
                next(err && 'Użytkownik o podanym emailu już istnieje');
            });
        };

        /** Tworzenie firmy */
        var createCompany = function(next) {
            /** Rejestracja firmy */
            if(_.isEmpty(company) || !company.name)
                return;

            /** Cache bo obiektu są kasowane */
            var cache = {
                  users: company.users
                , copyOrders: company.copyOrders
            };

            /** Użytkownicy, którzy muszą być potwierdzeni */
            company = new Company(company);
            company.admin = user._id;
            company.save(function(err) {
                if(!err)
                    Feed.create(
                        { user: user._id
                        , type: flags.Feeds.COMPANY_REGISTER
                        , data:
                            { msg: 'zarejestrowano firmę'
                            , company: company._id
                            }
                        });
                next(err && 'Firma o podanej nazwie już istnieje', cache);
            });
        };

        /** Etap finalny, tworzenie użytkowników i dodawanie go do firmy */
        var createMember = function(cache, tempUser, callback) {
            new User({
                  email: tempUser.email
                , password: ''
                , info:
                    { name: tempUser.name
                    , surname: tempUser.surname
                    }
                , disabled: true
            }).save(function(err, u) {
                    /** Wysyłanie emaila */
                    mail.send( 'Dokończenie rejestracji konta - OBKK'
                        , config.MAIL.COMPLETE_REGISTRATION
                        , { company: company.name
                          , url: config.SERVER_URL
                          , user: u
                          , orders: encodeURIComponent(JSON.stringify(cache.copyOrders ? user.orders : []))
                          }
                        , tempUser.email);

                    /** Dodawanie ID usera do listy firmy */
                    company.members.push(u._id);
                    callback();
                });
        };

        async.waterfall(
            [ createUser
            , createCompany
            , function(cache, next) {
                /** Szukanie zduplikowanych użytkowników */
                User.find({
                    'email': {
                        $in: _(cache.users).pluck('email')
                    }
                }, function(err, docs) {
                    next( docs.length && 'Na liście znajduje się użytkownik, który jest już zarejestrowany w systemie!'
                        , cache);
                });
            }
            , function(cache, next) {
                /** Współbieżne tworzenie nowych użytkowników */
                async.each(
                      cache.users
                    , createMember.bind(this, cache)
                    , function() {
                        company.update({
                            members: company.members
                        }, next);
                    });
                }
            ], _(callback).wrap(function(fn, err) {
                /** Sprzątanie po sobie */
                if(err) {
                    user.remove && user.remove();
                    company.remove && company.remove();
                }
                fn(err);
            }));
    };

    /**
     * Zakończenie rejestracji użytkownika zarejestrowanego
     * przez firmę
     * @param  {string}       id        Identyfikator użytkownika
     * @param  {CompleteForm} user      Dane potrzebne do zakończenia rejestracji
     * @param  {Function}     callback  Callback
     */
    var completeRegistration = function(id, user, callback) {
        User.findOne({ _id: id, disabled: true }, function(err, doc) {
            if(!doc)
                callback('Użytkownik został już aktywowany!');
            else {
                _(doc).extendOwn({
                      disabled: false
                    , password: user.password
                    , info: { phone: user.phone }
                });
                doc.save();
            }
        });
    };

    /**
     * Generowanie access token dla użytkownika
     * @param  {String}    login            Login
     * @param  {String}    pass             Hasło
     * @param  {Number}    exp              Czas wygaśnięcia tokenu(min)
     * @return {Function}  callback(token)  Access Token
     */
    var getAccessToken = function(login, pass, exp, callback) {
        var auth = function(err, users) {
            users = users.length && users[0];
            callback(!err && users && !users.disabled && users.auth(pass) ?
                { token:
                    jwt.sign(
                        { _id:    users._id
                        , info:   users.info
                        , email:  users.email
                        , mods:   _(users.mods).pluck('name')
                        }
                        , config.AUTH_SECRET
                        , { expiresInMinutes: 48 * 360 * exp })
                } : null
            );
        };
        User
            .find({ email: login })
            .populate('mods', '-__v')
            .limit(1)
            .exec(auth);
    };
    return  {
          register: register
        , completeRegistration: completeRegistration
        , getAccessToken: getAccessToken
    };
}());
module.exports = function(router) {
    /**
     * Logowanie zarejestrowanej firmy do TTY
     * @param {string}  ip      IP, z którego rejestrowana jest firma
     * @param {Company} company Dane rejestracyjne firmy z formularza
     */
    var logCompanyRegistration = function(ip, company) {
        console.log(('\n[ IP: ' + ip).white.bold
            + ' ] ' + (company.name).bold.italic.red + '!');
        console.log(archy({
            label: 'Zarejestrowani uczestnicy:'.bold.green
            , nodes: _(company.users).map(function(u) {
                return (u.name+' '+u.surname).italic +(' ('+u.email+') ').bold;
            })
        }));
    };

    router
        /** Rejestracja użytkownika */
        .put('/register', function(req, res, next) {
            api.register(
                  req.body.user
                , req.body.company
                , function(err) {
                    if(!err) {
                        res.sendStatus(200);
                        /** TODO: Logger */
                        if(req.body.company.name)
                            logCompanyRegistration(req.connection.remoteAddress, req.body.company);
                    } else
                        next(err);
                });
        })
        /** Dopełnienie rejestracji */
        .put('/register/:id', function(req, res, next) {
            api.completeRegistration(
                  req.params['id']
                , req.body.user
                , next);
        })

        /** Logowanie użytkownika */
        .post('/login', function(req, res, next) {
            var callback = function(token) {
                if(token)
                    res.json(token);
                else
                    next('Nieprawidłowe dane logowania!');
            };
            api.getAccessToken(
                  req.body.login
                , req.body.password
                , 60
                , callback);
        });
};