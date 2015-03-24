var mongoose = require('mongoose'),
	Schema 	 = mongoose.Schema,
	ObjectId = Schema.ObjectId;

/** Schema użytkownika do bazy danych */
var companySchema = new Schema({
    id: ObjectId,
    name: { 
        type: String, 
        required: true 
    },
    nip: { 
        type: String, 
        required: true 
    },
    info: {
        street: { type: String },
        code: { type: String },
        city: { type: String },
        webpage: { type: String }
    }
});
companySchema
	/** Numer telefonu tylko 9 cyfrowy */
	.path('info.code').validate(function(v) {
		return /^\d{2}-\d{3}$/.test(v);
	}, 'Nieprawidłowy kod pocztowy!');

module.exports = mongoose.model('Company', companySchema);