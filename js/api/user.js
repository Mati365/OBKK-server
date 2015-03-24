var express = require('express'),
    jwt     = require('jwt-simple'),
    user 	= require('../schemas/user.js'),
	router  = express.Router();

router
	/** Rejestracja użytkownika */
	.put('/register', function(req, res) {
		var data = req.body;
		user.create({
			email: data.user.email,
			password: data.user.password,
			info: {
				name: data.user.name,
				surname: data.user.surname,
				phone: data.user.phone
			}
		}, function(err) {
			console.log(err);
		});
	})
	/** Logowanie użytkownika */
	.post('/login', function(req, res) {

	})
	/** Wylogowywanie użytkownika */
	.post('/logout', function(req, res) {

	});

user.find({}, function(err, doc) {
	console.log(doc);
});
module.exports = router;