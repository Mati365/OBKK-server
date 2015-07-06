var express     =   require('express')
  , bodyParser  =   require('body-parser')
  , path        =   require('path')
  , _           =   require('underscore')
  , compress    =   require('compression');

/** Moduły aplikacji */
(function() {
    var db     = require('./db.js')
      , config = require('./config.js')
      , app    = express();

    /** Konfiguracja serwera */
    app
        .use(compress())
        .engine('html', require('ejs').renderFile)
        .set('view engine', 'html')
        .use(bodyParser.json());   
    
    /** Routing plików na serwerze */
    var routing = require('./api/routing.js')(app),
        routes  = 
         { '/build':   '/build'
         , '/data':    '/data'
         , '/lib':     '/data/lib'
         , '/img':     '/data/img'
         , '/js':      '/build/js'
         , '/css':     '/build/css'
         };
    _.each(routes, function(folder, route) {
        app.use(route, express.static(path.join(__dirname, config.$('FRONTEND_PATH') + folder)));
    });
    app.set('views', path.join(__dirname, config.$('FRONTEND_PATH') + '/build/views'));

    /** Routing API */
    var router = express.Router();
    router
        .get('/', function(req, res) {
            res.render('index.html');
        })
        /** TODO: Autoryzacja */
        .get('/views/*', function(req, res) {
            res.render(req.params[0]);
        });
    app.use('/', router);

    /** Obsługa błędów */
    // app
    //     .use(function(err, req, res, next) {
    //         res.status(404);
    //         if(req.accepts('html'))
    //             res.render('404.html');
    //         else
    //             res.send({status:404, message: err, type:'internal'});
    //     });

    /** Start serwera */
    var server = app.listen(3000, function() {
        console.log('Server is starting..');
    });
}());