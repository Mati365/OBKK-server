var dir = require('../dir.js');

module.exports = function(app) {
	dir(function(path) {
		if (path !== 'routing')
        	app.use('/' + path, require('./' + path + '.js'));
	}, 'api');
};