var mongoose = require('mongoose')
  , Schema   = mongoose.Schema
  , ObjectId = Schema.ObjectId;

/** Wiadomość */
var mailSchema = new Schema({
      sender:
        { type: ObjectId
        , ref: 'User'
        , required: true
        }
    , receiver:
        { type: ObjectId
        , ref: 'User'
        , required: true
        }
    , date:
        { type: Date
        , default: Date.now
        }
    , title: String
    , body: String
    , read:
        { type: Boolean
        , default: false
        }
});
module.exports = mongoose.model('Mail', mailSchema);
