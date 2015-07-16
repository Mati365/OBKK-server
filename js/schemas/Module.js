var mongoose = require('mongoose')
  , Schema   = mongoose.Schema;

/** Moduł jest doinstalowywany do serwera ręcznie */
var modSchema = new Schema({
      name:
        { type: String
        , required: true
        , index: { unique: true }
        }
    , path:
        { type: String
        , required: true
        }
    , menu: {
          title: String
        , ref:   String
        , info:  String
        , icon:  String
        , links: [{
              title: String
            , ref:   String
        }]
    }
});
module.exports = mongoose.model('Module', modSchema);