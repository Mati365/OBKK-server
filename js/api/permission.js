var expressJwt = require('express-jwt')
  , config     = require('../config.js');

module.exports = (function() {
    return { loggedOnly: expressJwt({ secret: config.AUTH_SECRET})
           };
}());