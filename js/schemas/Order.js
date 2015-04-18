var mongoose = require('mongoose')
  , Schema   = mongoose.Schema;

/** Schema użytkownika do bazy danych */
var orderSchema = new Schema({
      price:
        { type: Number
        , required: true
        , min: 0
        }
    , name:
        { type: String
        , required: true
        , index: { unique: true }
        }
});
module.exports = mongoose.model('Order', orderSchema);