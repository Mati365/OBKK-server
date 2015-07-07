var mongoose = require('mongoose')
  , crypto   = require('crypto')
  , _        = require('underscore')
  , config   = require('../config')

  , Schema   = mongoose.Schema
  , ObjectId = Schema.ObjectId;


/** Schema użytkownika do bazy danych */
var userSchema = new Schema({
      email: 
        { type: String
        , required: true
        , index: { unique: true }
        }
    , password: 
        { type: String
        , required: true
        }
    , salt: String
    , info: 
        { name: String
        , surname: String
        , phone: String
        }

    , mods: [ { type: ObjectId, ref: 'Module' } ]
    , access: 
        { type: Number
        , default: 0x1
        , enum: _(config.ACCESS).values()
        }

    , orders: [ { type: ObjectId, ref: 'Order' } ]
    , disabled: Boolean
});
userSchema
    /** Pełne imię i nazwisko */
    .virtual('info.fullName').get(function() {
        return this.info.name + ' ' + this.info.surname;
    });

userSchema
    /**
     * Autoryzacja użytkownika, porównanie hashów
     * @param  {String} pass    Hasło 
     */
    .method('auth', function(password) {
        return this.encryptPassword(password) === this.password;
    })
    /**
     * Szyfrowanie hasła z solą
     * @param  {String} password Hasło
     * @param  {String} salt     Sól
     * @return {String}          Hash
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
        this.salt = crypto.randomBytes(16);
        this.password = this.encryptPassword(this.password);
        next();
    })
    /** Numer telefonu tylko 9 cyfrowy */
    .path('info.phone').validate(function(v) {
        return /^\d{3}-\d{3}-\d{3}$/.test(v);
    }, 'Nieprawidłowy numer telefon!');

module.exports = mongoose.model('User', userSchema);