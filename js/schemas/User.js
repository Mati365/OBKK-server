var mongoose = require('mongoose')
  , crypto   = require('crypto')
  , _        = require('underscore')
  , config   = require('../config')
  , flags    = require('../flags')

  , Schema   = mongoose.Schema
  , ObjectId = Schema.ObjectId;

/** Schema użytkownika do bazy danych */
var userSchema = new Schema({
      email: 
        { type: String
        , required: true
        , index: { unique: true }
        }
    , password: String
    , salt: String
    , info: 
        { name: String
        , surname: String
        , phone: String
        , description: String
        }

    , mods: [{ type: ObjectId, ref: 'Module' }]
    , access: 
        { type: Number
        , default: 0x1
        , enum: _(config.ACCESS).values()
        }

    , orders: [{ type: ObjectId, ref: 'Order' }]
    , inbox: [{
          name: String
        , icon: { type: String, default: 'folder-o' }
        , flags: { type: Number, default:  flags.Inbox.MAIL_GROUPING | flags.Inbox.REMOVABLE }
        , mails: [{ type: ObjectId, ref: 'Mail' }]
    }]
    , disabled: Boolean
}, {
      toObject: { virtuals: true }
    , toJSON: { virtuals: true }
});
userSchema
    /** Pełne imię i nazwisko */
    .virtual('info.fullName').get(function() {
        return [ this.info.name, this.info.surname ].join(' ');
    });

userSchema
    /**
     * Autoryzacja użytkownika, porównanie hashów
     * @param pass    Hasło
     */
    .method('auth', function(password) {
        return this.encryptPassword(password) === this.password;
    })
    /**
     * Szyfrowanie hasła z solą
     * @param  password Hasło
     * @param  salt     Sól
     * @return          Hash
     */
    .method('encryptPassword', function(password, salt) {
        salt = salt || this.salt;
        return crypto
                    .createHash('md5')
                    .update(salt + password)
                    .digest('hex');
    })
    /** Zapisywanie użytkownika do bazy */
    .pre('save', function(next) {
        var self = this;
        if(!this.salt || !this.salt.length) {
            this.salt = crypto.randomBytes(16);
            this.password = this.encryptPassword(this.password);
        }

        /** Tworzenie podstawowych folderów email użytkownika */
        if(!this.inbox || !this.inbox.length)
            _(config.MAIL_FOLDERS).each(function(val) {
                self.inbox.push(
                    { name: val[0]
                    , icon: val[1]
                    , mails: []
                    , flags: val != config.MAIL_FOLDERS.SENT ? flags.Inbox.MAIL_GROUPING : 0 // Wysłanych nie grupuje bo ten sam nadawca
                    });
            });
        next();
    })
    /** Numer telefonu tylko 9 cyfrowy */
    .path('info.phone').validate(function(v) {
        return /^\d{3}-\d{3}-\d{3}$/.test(v);
    }, 'Nieprawidłowy numer telefon!');

module.exports = mongoose.model('User', userSchema);