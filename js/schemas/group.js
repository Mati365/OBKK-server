var mongoose   = require('mongoose')
  , Schema     = mongoose.Schema
  , ObjectId   = Schema.ObjectId
  , NumberLong = Schema.NumberLong;

/** Schema użytkownika do bazy danych */
var groupSchema = new Schema({
      name: 
        { type: String
        , required: true
        , index: { unique: true 
        } 
    , flags : 
        { type: NumberLong
        , required: true
        }
});

module.exports = groupSchema;