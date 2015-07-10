var mail    = require('nodemailer')
  , juice   = require('juice')
  , _       = require('underscore')
  , config  = require('./config.js');

/** Transporter */
var transporter = mail.createTransport({
      service: 'Gmail'
    , auth: {
          user: ''
        , pass: ''
    }
});

/**
 * Wysyłanie emaila
 * @param  {string} title    Tytuł wiadomości
 * @param  {string} template Szablon wiadomości
 * @param  {Array}  params   Parametry do szablonu
 * @param  {string} to       Adres email odbiorcy
 */
module.exports.send = function(title, template, params, to) {
    transporter.sendMail({
          from: config.MAIL.FROM
        , to: to
        , subject: title
        , html: juice(_.template(template)(params))
    });
};
