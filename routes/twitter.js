var express 		= require('express');
var Twit			= require('twit');
var config			= require('../util/config.js');

var router 			= express.Router();
var twitter			= new Twit(config.twitter_keys);

router.get('/searchTweets', function(req, res) {
	var params = {
		q: req.query.q,
		count: req.query.count
	}

	twitter.get('search/tweets', params)
		.catch((err) => {
			res.status(400).send(err);
		})
		.then((result) => {
			res.status(200).json(result.data);
		});
});

router.get('/botcheck/:screen_name', function(req, res) {
	var req_user = req.params.screen_name;

	twitter.get('users/show', { screen_name: req_user })
		.catch((err) => {
			res.status(400).send(err);
		})
		.then((user) => twitter.get('statuses/user_timeline', { screen_name: req_user, count: 10, include_rts: true })
		.catch((err) => {
			res.status(400).send(err);
		})
		.then((timeline) => {
			//is_quote_status: true
			//text: "RT @alguem"
			res.status(200).json(timeline.data);
		}));
});



module.exports = router;