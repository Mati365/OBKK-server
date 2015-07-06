var mongoose = require('mongoose')
  , Schema   = mongoose.Schema
  , ObjectId = Schema.ObjectId;

/** Moduł jest doinstalowywany do serwera ręcznie */
var modSchema = new Schema({
      name: 
        { type: String
        , required: true
        , index: { unique: true }
        }
});
module.exports = mongoose.model('Module', modSchema);