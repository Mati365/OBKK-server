/**
 * Konfiguracja serwisu jest stała, 
 * dlatego nie jest zwykłym assocem
 */
var constant = require('./const.js')({
      'FRONTEND_PATH': '../../OBKK-client/'
  	, 'AUTH_SECRET': 'MOJA_SZKOLA_SMIERDZI_PS_TO_PRAWDA'   
});
module.exports = constant.$;