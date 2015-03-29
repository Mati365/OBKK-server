var express     =   require('express')
  , bodyParser  =   require('body-parser')
  , path        =   require('path')
  , _           =   require('underscore');

/** Moduły aplikacji */
(function() {
    var db     = require('./db.js')
      , config = require('./config.js')
      , app    = express();

    /** Konfiguracja serwera */
    app
        .use(function(req, res, next) {
            res.set({'content-type': 'application/json; charset=utf-8'});
            next();
        })
        .set('view engine', 'jade')
        .use(bodyParser.json());   
    
    /** Routing plików na serwerze */
    var routing = require('./api/routing.js')(app),
        routes  = 
         { '/assets':  '/assets'
         , '/lib':     '/assets/lib'
         , '/img':     '/assets/img'
         , '/less':    '/assets/less'
         , '/js':      '/js'
         };
    _.each(routes, function(folder, route) {
        app.use(route, express.static(path.join(__dirname, '../../OBKK-client' + folder)));
    });
    app.set('views', path.join(__dirname, config('FRONTEND_PATH')+'/assets/views'));

    /* Routing API */
    var router = express.Router();
    router
        .get('/', function(req, res) {
            res.render('index');
        })
        /** TODO: Autoryzacja */
        .get('/views/*.jade', function(req, res) {
            res.render(req.params[0]);
        });
    app.use('/', router);

    var server = app.listen(3000, function() {
        console.log('Server is starting..');
    });
}());