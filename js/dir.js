var fs = require('fs');
module.exports = function(callback, dir) {
	if(typeof callback === 'undefined')
		throw new Error('Undefined callback!');
	fs.readdirSync(__dirname+'/'+(dir||'')).forEach(function(file) {
		callback(file.substr(0, file.indexOf('.')));
    });
};