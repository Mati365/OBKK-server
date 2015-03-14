var _ 	=	require('underscore');

/** Prosta implementacja stałych w Node.JS */
var Const = function() {
	var vars = {};

	/**
	 * Pobieranie stałej z mapy
	 * @param  {String} name Nazwa stałej
	 * @return {Object}      Wartość stałej
	 */
	this.$ 	= 	function(name) {
		return vars[name];
	};

	/**
	 * Definiowanie stałej
	 * @return {Const} Uchwyt do this
	 */
	this.define = 	function() {
		if(arguments.length === 2) 
			vars[arguments[0]] = arguments[1];
		else
			_.each(arguments[0], function(obj, key) {
				vars[key] = obj;
			});
		return this;
	};
	if(arguments !== 'undefined')
		this.define(arguments[0]);
};
module.exports = function(params) {
	return new Const(params);
};