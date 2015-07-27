var q           = require('q')
  , _           = require('underscore')
  , ObjectId    = require('mongoose').Schema.ObjectId
  , config      = require('../../../config.js')
  , Schemas     = require('../../../schemas/schemas.js')
  , Mail        = Schemas.Mail
  , User        = Schemas.User;

var api = (function() {
    /**
     * Wysyłanie email'a do użytkownika
     * @param fromId  ID użytkownika, który wysyła
     * @param toId    ID użytkownika, który otrzymuje
     * @param data    Treść wiadomości
     */
    var sendMail = function(fromId, toId, data) {
        var mail = new Mail(data);
        _.extendOwn(mail, {
              sender: fromId
            , receiver: toId
        });

        var send = function(userId, folder) {
            var data = {};
            data['inbox.' + folder + '.mails'] = {
                $each: [ mail._id ]
            };
            return User
                .update({ _id: userId }, { $push: data })
                .exec();
        };
        /**
         * 0 - skrzynka odbiorcza
         * 1 - skrzynka nadawcza
         */
        return mail
            .save()
            .then(send.bind(this, toId, 0))
            .then(send.bind(this, fromId, 1));
    };

    /**
     * Pobieranie informacji o wiadomości i oznaczanie jej
     * za przeczytaną
     * @param user   Użytkownik z middleware
     * @param mailId Identyfikator wiadomości
     */
    var getMailData = function(user, mailId) {
        return Mail
            .findById(mailId)
            .populate('sender receiver', 'info _id')
            .exec()
            .then(function(data) {
                /** Odczytanie tylko przez odbiorce */
                if(data.receiver._id == user._id)
                    data.read = true;
                else if(data.sender._id != user._id)
                    this.reject('Myślisz, że podglądniesz czyjąś wiadomość? ( ͡° ͜ʖ ͡°)');

                data.save();
                return data;
            });
    };

    /**
     * Listowanie folderów w skrzynce pocztowej
     * @param user Użytkownik, właściciel skrzynki
     */
    var listFolders = function(user) {
        return User
            .find({ _id: user._id })
            .select('inbox.name inbox.icon inbox._id')
            .exec();
    };

    function objectIdWithTimestamp(timestamp) {
        if (typeof(timestamp) == 'string') {
            timestamp = new Date(timestamp);
        }
        var hexSeconds = Math.floor(timestamp/1000).toString(16);
        var constructedObjectId = ObjectId(hexSeconds + "0000000000000000");
        console.log(hexSeconds + "0000000000000000");
        return constructedObjectId
    }

    /**
     * Listowanie tylko nagłówków listów, optymalizacja
     * wysyłam wszystko za jednym razem, dane dla 1tys listów
     * nie powinny być większe niż parest kilobajtow
     * @param user      Użytkownik z middleware
     * @param folder    Nazwa folderu
     * @param lastDate  Data ostatniego listu
     */
    var userInfoFields   = 'email info.fullName info.name info.surname'
      , mailHeaderFields = 'date title sender read';
    var listHeaders = function(user, folder, lastDate) {
        var defer = q.defer();

        /** Kompresowanie danych do wysyłki */
        var compress = function(data) {
            return _.map(data, function(el) {
                return _.extendOwn(
                      _(el).pick('_id', 'title', 'date', 'read')
                    , _(el.sender.info).pick('fullName')
                );
            });
        };

        /** Szukanie mail i zwracanie flag */
        User
            .findOne({
                  '_id': user._id
                , 'inbox._id': folder
            })
            .select('inbox.$.mails')
            .populate( 'inbox.mails'
                    ,  mailHeaderFields
                    , lastDate &&  { date: { $gt: lastDate }}
                    ,  { limit: 200 })
            .exec()
            .then(function(data) {
                data = data.inbox[0];
                User.populate(data.mails.reverse(), {
                      path: 'sender'
                    , select: userInfoFields
                }, function(err, result) {
                    defer.resolve({
                          flags:   data.flags
                        , headers: compress(result)
                    });
                });
            });
        return defer.promise;
    };

    /**
     * Listowanie możliwych odbiorców email'ów, niektórzy
     * użytkownicy nie będą mogli zobaczyć innych itp.
     * @param user Użytkownik z middleware
     */
    var listReceivers = function(user) {
        return User
            .find({})
            .select(userInfoFields)
            .exec();
    };

    /**
     * Zmiana folderu mail'a
     * @param user          Użytkownik z middleware
     * @param folderId      Identyfikator folderu, w którym jest wiadomość
     * @param messageId     Identyfikator wiadomości
     * @param newFolderId   Identyfikator nowego folderu
     */
    var moveMail = function(user, folderId, messageId, newFolderId) {
        return User
            .findById(user._id)
            .exec()
            .then(function(data) {
                data = data.toJSON();
                var getFolder = function(id) {
                    return _(data.inbox).findWhere({ id: id });
                };

                /** Folder źródłowy */
                var source = getFolder(folderId);
                source.mails = _(source.mails).without(messageId);
                getFolder(newFolderId).mails.push(messageId);

                /** Aktualizowanie użytkowników */
                return User
                    .update({ _id: user._id }, data)
                    .exec();
            });
    };
    return  { listFolders: listFolders
            , listHeaders: listHeaders
            , listReceivers: listReceivers
            , sendMail: sendMail
            , getMailData: getMailData
            , moveMail: moveMail
            };
}());
module.exports = function(router) {
    router
        .get('/', function(req, res) {
            api
                .listFolders(req.user)
                .then(function(data) {
                    res.json(data[0].inbox);
                });
        })

        /** Listowanie odbiorców */
        .get('/receivers', function(req, res) {
            api
                .listReceivers(req.user)
                .then(res.json.bind(res));
        })

        /** Listowanie nagłówków maili z folderu */
        .get('/folder/:folder', function(req, res) {
            api
                .listHeaders(req.user, req.params.folder, req.query.lastDate)
                .then(res.json.bind(res));
        })

        /** Wysyłanie wiadomości */
        .put('/', function(req, res) {
            var promises = [];
            _.each(req.body.receiver, function(userId) {
                promises.push(
                    api.sendMail(
                          req.user._id
                        , userId
                        , _.pick(req.body, 'title', 'body')
                    )
                );
            });
            q
                .all(promises)
                .then(res.sendStatus.bind(res, 200));
        })

        /** Opcje dotyczące wiadomości */
        .route('/folder/:folder/:message')
            /** Pobieranie szczegółów wiadomości z folderu */
            .get(function(req, res) {
                api
                    .getMailData(req.user, req.params.message)
                    .then(res.json.bind(res));
            })

            /** Kasowanie wiadomości */
            .delete(function(req, res) {
                api
                    .moveMail(req.user, req.params.folder, req.params.message, req.body.folder)
                    .then(res.json.bind(res));
            });
};