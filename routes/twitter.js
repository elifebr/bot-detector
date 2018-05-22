var express 		    = require('express');
var Twit			      = require('twit');
var config			    = require('../util/config.js');
var TwitterDetector	= require('../controllers/twitterController.js');
var AnalysedUser	= require('../models/AnalysedUser.js');

var router 			    = express.Router();
var actual_key		  = 0;
var twitter_requests  = 0;

var twitter_accounts = [
  new Twit(config.twitter_keys[0]),
  new Twit(config.twitter_keys[1]),
  new Twit(config.twitter_keys[2]),
  new Twit(config.twitter_keys[3]),
  new Twit(config.twitter_keys[4]),
  new Twit(config.twitter_keys[5]),
  new Twit(config.twitter_keys[6]),
  new Twit(config.twitter_keys[7])
];
var twitter			    = twitter_accounts[0];

router.get('/suspicious_users', function (req, res) {
	AnalysedUser.find({})
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((result) => {
        res.status(200).json(result);
    });
});

var updateTwitterKey = function() {
  actual_key = (actual_key + 1) % 8;
  twitter	= twitter_accounts[actual_key];
  console.log('Twitter key changed, key: ' + actual_key);
}

router.get('/botcheck/:screen_name', function (req, res) {
  twitter.get('statuses/user_timeline', { screen_name: req.params.screen_name, count: 200, include_rts: true }, function (err, data, result) {
    return res.status(200).json({err: err, data: data, result: result});
  });
});

router.post('/botcheck/', function(req, res) {
	var users = req.body.screen_names; // ["screen_name", "screen_name", "screen_name"]
	var requests = 0;
	var responses = [];

	for (var i = 0; i < users.length; i++) {
		if ((actual_key % 2 == 0 && twitter_requests > 1499) || (actual_key % 2 != 0 && twitter_requests > 899)) {
      twitter_requests = 0;
      updateTwitterKey();
		}

		let auxUser = { user: users[i], index: i };

		AnalysedUser.findOne({screen_name: auxUser.user}) // Search if the user is already saved on the bd.
		.catch((err) => {
			responses[auxUser.index] = { screen_name: auxUser.user, error: "Mongo error." };
      requests++;

			if (requests == users.length) {
				done();
			}
		})
		.then((user_found) => { 
			if (user_found) { // AnalysedUser cached
				responses[auxUser.index] = { screen_name: auxUser.user, value: user_found.suspicious_level.value };
        requests++;

				if (requests == users.length) {
					done();
				}
      } else { // AnalysedUser not found
        twitter.get('statuses/user_timeline', { screen_name: auxUser.user, count: 200, include_rts: true }, function (err, data, result) {
          if (err) {
            responses[auxUser.index] = { screen_name: auxUser.user, error: err.message || 'Something went wrong.' };
            requests++;
            twitter_requests++;

            if (requests == users.length) {
              done();
            }
          } else {
            if (data) {
              var analysis = TwitterDetector.bot_check(data[0].user, data);

              var analysedUser = new AnalysedUser();
              analysedUser.screen_name = auxUser.user;
              analysedUser.suspicious_level = analysis.boolean_analysis.suspicious_level;

              analysedUser.save()
                .catch((err) => {
                  responses[auxUser.index] = { screen_name: auxUser.user, error: "Mongo error." };
                  requests++;
                  twitter_requests++;

                  if (requests == users.length) {
                    done();
                  }
                })
                .then(() => {
                  responses[auxUser.index] = { screen_name: auxUser.user, value: analysis.boolean_analysis.suspicious_level.value };
                  requests++;
                  twitter_requests++;

                  if (requests == users.length) {
                    done();
                  }
                });		
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