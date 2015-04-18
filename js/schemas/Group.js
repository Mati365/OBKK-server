var mongoose   = require('mongoose')
  , Schema     = mongoose.Schema
  , ObjectId   = Schema.ObjectId;

/** Schema użytkownika do bazy danych */
var groupSchema = new Schema({
      name: 
        { type: String
        , required: true
        , index: { unique: true }
        } 
    , flags : 
        { type: Number
        , required: true
        }
});
module.exports = mongoose.model('Group', groupSchema);;