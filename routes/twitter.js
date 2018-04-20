var express 		= require('express');
var Twit			= require('twit');
var moment			= require('moment');
var config			= require('../util/config.js');

var router 			= express.Router();
moment().format();
var twitter			= new Twit(config.twitter_keys);

router.get('/searchTweets', function(req, res) {
	var params = {
		q: req.query.q,
		count: req.query.count
	}

	twitter.get('search/tweets', params, function(err, data, response) {
		if (err) {
			res.status(400).send(err);
		} else {
			res.status(200).json(data);
		}
	});
});

router.get('/botcheck/:screen_name', function(req, res) {
	var req_user = {
		screen_name: req.params.screen_name
	}

	var now = moment();

	twitter.get('users/show', req_user)
		.catch((err) => {
			res.status(400).send(err);
		})
		.then((result) => {
			var created = moment(result.data.created_at, "ddd MMM DD HH:kk:ss +-HHmm YYYY");
			var account_days = now.diff(created, 'days');
			var _post = result.data.statuses_count / account_days;
			console.log(_post);
			res.status(200).json(result.data);
		});
});

/*var params = {
	q: 'avicii',
	count: 5
}*/

//twitter.get('search/tweets', params, searchResult);

function searchResult(err, data, response) {
	console.log(data);
}

module.exports = router;