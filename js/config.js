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
    , FEEDS: {
          REGISTER:         0x1 /** Rejestracja usera */
        , COMPANY_REGISTER: 0x2 /** Rejestracja firmy */
        , POST:             0x3 /** Post użytkownika */
    }
    , ACCESS: {
          ADMIN:     0x4
        , MODERATOR: 0x2
        , USER:      0x1
    }
});