var express 		= require('express');
var Twit			= require('twit');
var config			= require('../util/config.js');
var TwitterDetector	= require('../controllers/twitterController.js');
var SuspiciousUser	= require('../models/SuspiciousUser.js');

var router 			= express.Router();
var actual_key		= 0;
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

router.get('/botcheck/:screen_name', function(req, res) {
	var req_user = req.params.screen_name;
	console.log(config.twitter_keys[actual_key]);
	console.log(actual_key);
	SuspiciousUser.findOne({screen_name: req_user})
		.catch((err) => {
			res.status(400).send('Mongo error');
		})
		.then((user_found) => { 
			if (user_found) { // Suspicious user cached
				console.log('user_found');
				res.status(200).json(user_found.suspicious_level);
			} else {
				twitter.get('statuses/user_timeline', { screen_name: req_user, count: 200, include_rts: true })
				.catch((err) => {
					res.status(400).send(err);
				})
				.then((result) => {
					if (result.resp.statusCode != 200 || !result.data[0].user) { //not_found or another error
						res.status(400).send(result.data.error);
					} else if (result.resp.statusCode == 429) { //rate_limit
						
						actual_key += 1;

						if (actual_key >= 4) {
							actual_key = 0;
						}
						
						twitter	= new Twit(config.twitter_keys[actual_key]);
		
						twitter.get('statuses/user_timeline', { screen_name: req_user, count: 200, include_rts: true })
							.catch((err) => {
								res.status(400).send(err);
							})
							.then((result) => {
								if (result.resp.statusCode != 200 || !result.data[0].user) { //not_found or another error
									res.status(400).send(result.data.error);
								} else {
									var analysis = TwitterDetector.bot_check(result.data[0].user, result.data);
									if (analysis.boolean_analysis.suspicious_level.value > 0.4) { // Caching
										var suspiciousUser = new SuspiciousUser();
										suspiciousUser.screen_name = req_user;
										suspiciousUser.result = analysis;
										suspiciousUser.suspicious_level = analysis.boolean_analysis.suspicious_level;
			
										suspiciousUser.save(function (err) {
											if (err) {
												res.status(400).send('Mongo error.');
											} else {
												res.status(200).json(analysis.boolean_analysis.suspicious_level);
											}
										});
									} else {
										res.status(200).json(analysis.boolean_analysis.suspicious_level);
									}
								}
							});
					} else { // 
						var analysis = TwitterDetector.bot_check(result.data[0].user, result.data);

						if (analysis.boolean_analysis.suspicious_level.value > 0.4) { // Caching
							var suspiciousUser = new SuspiciousUser();
							suspiciousUser.screen_name = req_user;
							suspiciousUser.result = analysis;
							suspiciousUser.suspicious_level = analysis.boolean_analysis.suspicious_level;

							suspiciousUser.save(function (err) {
								if (err) {
									res.status(400).send('Mongo error.');
								} else {
									res.status(200).json(analysis.boolean_analysis.suspicious_level);
								}
							});
						} else {
							res.status(200).json(analysis.boolean_analysis.suspicious_level);
						}
					}
				});
			}
		});
});

module.exports = router;