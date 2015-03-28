var mongoose = require('mongoose'),
####Schema #### = mongoose.Schema,
####ObjectId = Schema.ObjectId;

/** Schema użytkownika do bazy danych */
var companySchema = new Schema({
    name: { 
        type: String, 
        required: true,
        index: { unique: true } 
    },
    admin: {
        type: ObjectId,
        required: true,
        ref: 'User',
        index: true
    },
    members: [
        {
            type: ObjectId,
            ref: 'User'
        }
    ],
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
####/** Numer telefonu tylko 9 cyfrowy */
####.path('nip').validate(function(v) {
########return /^\d{3}-\d{2}-\d{2}-\d{3}$/.test(v);
####}, 'Nieprawidłowy NIP! Prawidłowa postać to XXX-XX-XX-XXX');

module.exports = mongoose.model('Company', companySchema);