var express = require('express'),
    jwt     = require('jwt-simple'),
####router  = express.Router();
/** Schemas */
var User ####= require('../schemas/user.js'),
    Company = require('../schemas/company.js');

router
####/** Rejestracja użytkownika */
####.put('/register', function(req, res, next) {
########var data    = req.body;
########/** Tworzenie użytkownika */
########var user = new User(data.user);
########if(data.user.prelegant) {
############/** TODO: Grupy i preleganci */
########}
########user.save(function(err) {
############if(err)
################next(err);
############/** Rejestracja firmy */
############if(data.company) {
################var company = new Company(data.company);
################company.admin = user._id;
################company.save(function(err) {
####################if(err)
########################next(err);
################});
############}
########});
####})
####/** Logowanie użytkownika */
####.post('/login', function(req, res) {

####})
####/** Wylogowywanie użytkownika */
####.post('/logout', function(req, res) {

####});
module.exports = router;