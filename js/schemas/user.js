var mongoose = require('mongoose'),
	crypto   = require('crypto'),
	Schema 	 = mongoose.Schema,
	ObjectId = Schema.ObjectId;

/** Schema użytkownika do bazy danych */
var userSchema = new Schema({
    id: ObjectId,
    email: { 
    	type: String,
    	required: true,
    	index: { unique: true }
    },
    password: { 
    	type: String,
    	required: true
    },
    salt: { type: String },
    info: {
    	name: 	 { type: String },
    	surname: { type: String },
    	phone:   { type: String }
    }
});
userSchema
	.pre('save', function(next) {
		this.salt = crypto.randomBytes(16);
		this.password = crypto
							.createHash('md5')
							.update(this.salt + this.password)
							.digest('hex');
		next();
	})
	/** Numer telefonu tylko 9 cyfrowy */
	.path('info.phone').validate(function(v) {
		return /^\d{9}$/.test(v);
	}, 'Nieprawidłowy numer telefon!');

module.exports = mongoose.model('User', userSchema);