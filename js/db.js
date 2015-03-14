var mongoose =	require('mongoose'),
	db 		 = 	mongoose.connection;

db
	.on('error', console.error)
	.once('open', function() {
		console.log('Połączony!');
	});
// mongoose.connect('mongodb://username:password@host:port/database?options...');
mongoose.connect('mongodb://127.0.0.1/test');

var UserSchema = mongoose.Schema({
	name 	:   String,
	surname : 	String
});