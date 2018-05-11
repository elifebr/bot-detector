var express 		= require('express');
var Twit			= require('twit');
var config			= require('../util/config.js');
var TwitterDetector	= require('../controllers/twitterController.js');
var SuspiciousUser	= require('../models/SuspiciousUser.js');

var router 			= express.Router();
var actual_key		= 0;
var total_requests  = 0;
var twitter			= new Twit(config.twitter_keys[actual_key]);

router.get('/suspicious_users', function (req, res) {
	SuspiciousUser.find({})
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((result) => {
        res.status(200).json(result);
    });
});

router.post('/botcheck/', function(req, res) {
	var users = req.body.screen_names; // ["screen_name", "screen_name", "screen_name"]
	var requests = 0;
	var responses = [];

	for (var i = 0; i < users.length; i++) {
		total_requests++;
		
		if ((actual_key % 2 == 0 && total_requests >= 1400) || (actual_key % 2 != 0 && total_requests >= 800)) {
			total_requests = 0;
			actual_key += 1;
			twitter	= new Twit(config.twitter_keys[actual_key]);
		}

		let auxUser = { user: users[i], index: i };

		SuspiciousUser.findOne({screen_name: auxUser.user}) // Search if the user is already saved on the bd.
		.catch((err) => {
			responses[auxUser.index] = { screen_name: auxUser.user, error: "Mongo error." };
			requests++;

			if (requests == users.length) {
				done();
			}
		})
		.then((user_found) => { 
			if (user_found) { // Suspicious user cached
				responses[auxUser.index] = { screen_name: auxUser.user, value: user_found.suspicious_level.value };
				requests++;

				if (requests == users.length) {
					done();
				}
			} else { // Suspicious_user not found
				twitter.get('statuses/user_timeline', { screen_name: auxUser.user, count: 200, include_rts: true })
				.catch((err) => {
					responses[auxUser.index] = { screen_name: auxUser.user, error: err };
					requests++;

					if (requests == users.length) {
						done();
					}
				})
				.then((result) => {
					
					if (result.data.error) {
						responses[auxUser.index] = { screen_name: auxUser.user, error: result.data.error };
						requests++;

						if (requests == users.length) {
							done();
						}
					} else { 
						var analysis = TwitterDetector.bot_check(result.data[0].user, result.data);

						if (analysis.boolean_analysis.suspicious_level.value > 0.4) { // Caching
							var suspiciousUser = new SuspiciousUser();
							suspiciousUser.screen_name = auxUser.user;
							suspiciousUser.result = analysis;
							suspiciousUser.suspicious_level = analysis.boolean_analysis.suspicious_level;

							suspiciousUser.save()
								.catch((err) => {
									responses[auxUser.index] = { screen_name: auxUser.user, error: "Mongo error." };
									requests++;

									if (requests == users.length) {
										done();
									}
								})
								.then(() => {
									responses[auxUser.index] = { screen_name: auxUser.user, value: analysis.boolean_analysis.suspicious_level.value };
									requests++;

									if (requests == users.length) {
										done();
									}
								});		
						} else {
							responses[auxUser.index] = { screen_name: auxUser.user, value: analysis.boolean_analysis.suspicious_level.value };
							requests++;

							if (requests == users.length) {
								done();
							}
						}
					}
				});
			}
		});
	}

	function done() {
		if (requests == users.length) {
			res.status(200).send(responses);
		} else {
			res.status(400).send('Error');
		}
	}
});

module.exports = router;