var mongoose = require('mongoose')
  , Schema   = mongoose.Schema  
  , ObjectId = Schema.ObjectId;

/** Schema użytkownika do bazy danych */
var feedSchema = new Schema({
      user: 
        { type: ObjectId
        , ref: 'User'
        , required: true
        , index: true
        }
    , date: 
        { type: Date
        , default: Date.now 
        }
    , type:
        { type: String
        , required: true
        , enum: [ 'REGISTER', 'COMPANY_REGISTER' ]
        }
    , data: 
        { msg: { type: String }
        , company: 
                { type: ObjectId
                , ref: 'Company'
                }     
        }
});
module.exports = mongoose.model('Feed', feedSchema);