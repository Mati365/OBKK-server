var mongoose = require('mongoose')
  , _        = require('underscore')
  , config   = require('../config.js');

/** Schemas */
var Schema   = mongoose.Schema
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
        , enum: _(config.FEEDS).values()
        }
    , data: 
        { msg: String
        , company: 
            { type: ObjectId
            , ref: 'Company'
            }
        , opt: Object
        }
});
module.exports = mongoose.model('Feed', feedSchema);