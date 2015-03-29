var mongoose = require('mongoose')
  , crypto   = require('crypto')
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
    , salt: { type: String }
    , info: 
        { name:    { type: String }
        , surname: { type: String }
        , phone:   { type: String }
        }
    , groups: [ { type: ObjectId } ]
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
                    .update(this.salt + password)
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