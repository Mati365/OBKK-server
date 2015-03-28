var mongoose =	require('mongoose');

mongoose.connection
	.on('error', console.error)
	.once('open', function() {
		console.log('Połączony!');
	});
// mongoose.connect('mongodb://username:password@host:port/database?options...');
mongoose.connect('mongodb://127.0.0.1/obkk');