var fs = require('fs');
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
module.exports = {
      FRONTEND_PATH: '../../client/'
    , AUTH_SECRET: 'MOJA_SZKOLA_SMIERDZI_PS_TO_PRAWDA' 
    , SERVER_URL: 'http://localhost:3000' 
    , MAIL: {
          FROM: 'cziken58@gmail.com'
        , DONE_REGISTRATION:     require('../templates/accountReg.html')
        , COMPLETE_REGISTRATION: require('../templates/completeReg.html')
    }
    , ACCESS: {
          ADMIN:     0x4
        , MODERATOR: 0x2
        , USER:      0x1
    }
};