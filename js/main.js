var express 	= 	require('express'),
	path 		= 	require('path'),
	_ 			=	require('underscore');

/** Moduły aplikacji */
(function() {
	var
		db 		= require('./db.js'),
		config  = require('./config.js'),
	 	app 	= express();

	/** Routing plików na serwerze */
	app.set('view engine', 'jade');

	var routes = {
		'/assets' 	: 	'/assets',
		'/lib' 		: 	'/assets/lib',
		'/img' 		: 	'/assets/img',
		'/less' 	: 	'/assets/less',
		'/js' 		: 	'/js'
	};
	_.each(routes, function(folder, route) {
		app.use(route, express.static(path.join(__dirname, '../../OBKK-client' + folder)));
	});
	app.set('views', path.join(__dirname, '../../OBKK-client/assets/views'));

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

	/* Start serwera */
	app.use('/', router);
	var server = app.listen(3000, function() {
		console.log('Server is starting..');
	});
}());