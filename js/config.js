var fs = require('fs')
  , _  = require('underscore');

(function() {
    /** Synchroniczne ładowanie plików */
    require.extensions['.html'] = function (module, filename) {
        module.exports = fs.readFileSync(filename, 'utf8');
    };
}());

/**
 * Konfiguracja serwisu jest stała, 
 * dlatego nie jest zwykłym assocem
 */
var envConfig = _(process.env).pick(
      'FRONTEND_PATH'
    , 'AUTH_SECRET'
    , 'SERVER_URL'
);
module.exports = _.extend(envConfig, {
      MAIL: {
          USER: process.env.SERVER_EMAIL_USER
        , PASS: process.env.SERVER_EMAIL_PASS
        , DONE_REGISTRATION:     require('../templates/accountReg.html')
        , COMPLETE_REGISTRATION: require('../templates/completeReg.html')
    }
    , MAIL_FOLDERS: {
          RECEIVED: [ 'Odebrane',  'inbox' ]  /** Folder otrzymywanych wiadomości */
        , SENT:     [ 'Wysłane',   'send'  ]  /** Folder wysłanych wiadomości */
        , REMOVED:  [ 'Skasowane', 'trash' ]  /** Folder usuniętych wiadomości */
    }
});