var express 		= require('express');
var Twit			= require('twit');
var config			= require('../util/config.js');
var TwitterDetector	= require('../controllers/twitterController.js');

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

router.get('/:statuses_id', function(req, res) {
	twitter.get('statuses/show/:id', { id: req.params.statuses_id })
		.catch((err) => {
			res.status(400).send(err);
		})
		.then((tweet) => {
			res.status(200).json(tweet.data);
		});
});

router.get('/botcheck/:screen_name', function(req, res) {
	var req_user = req.params.screen_name;

	twitter.get('users/show', { screen_name: req_user })
		.catch((err) => {
			res.status(400).send(err);
		})
		.then((user) => twitter.get('statuses/user_timeline', { screen_name: req_user, count: 200, include_rts: true })
		.catch((err) => {
			res.status(400).send(err);
		})
		.then((result) => {
			if (result.resp.statusCode != 200) {
				res.status(400).send(result.data.error);
			} else {
				var analysis = TwitterDetector.bot_check(user.data, result.data);
				res.status(200).json(analysis);
			}
		}));
});

module.exports = router;