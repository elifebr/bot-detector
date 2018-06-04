var express 		    = require('express');
var Twit			      = require('twit');
var config			    = require('../util/config.js');
var TwitterDetector	= require('../controllers/twitterController.js');
var AnalysedUser	  = require('../models/AnalysedUser.js');

var router 			      = express.Router();
var actual_key		    = 0;
var twitter_requests  = 0;

var twitter1app = new Twit(config.twitter_keys[0]);
var twitter1user = new Twit(config.twitter_keys[1]);
var twitter2app = new Twit(config.twitter_keys[2]);
var twitter2user = new Twit(config.twitter_keys[3]);
var twitter3app = new Twit(config.twitter_keys[4]);
var twitter3user = new Twit(config.twitter_keys[5]);
var twitter4app = new Twit(config.twitter_keys[6]);
var twitter4user = new Twit(config.twitter_keys[7]);

var twitter_accounts = [
  twitter1app,
  twitter1user,
  twitter2app,
  twitter2user,
  twitter3app,
  twitter3user,
  twitter4app,
  twitter4user
];
var twitter = twitter_accounts[0];

// ==================== UTILITY FUNCTIONS ====================
var SingletonClass = (function(){
  function SingletonClass() {
      actual_key = (actual_key + 1) % 8;
      twitter	= twitter_accounts[actual_key];
      console.log('Twitter key changed, key: ' + actual_key);
  }
  var instance;
  return {
      getInstance: function() {
          if (instance == null) {
              instance = new SingletonClass();
              instance.constructor = null;
          }
          return instance;
      },
      killInstance: function() {
          if (instance != null) {
            instance = null;
            return true;
          } else {
            return false;
          }
      }
 };
})();

var verifyAccounts = function(cb) {
  var responses = [];
  var requests = 0;
  twitter_accounts.forEach((twit_account, i) => {
    twit_account.get('/application/rate_limit_status', {resources: 'statuses'})
    .then((result) => {
      responses[i] = result.data;
      requests++;
      if (requests == twitter_accounts.length) {
        return cb(responses);
      }
    })
    .catch((error) => {
      responses[i] = error;
      requests++;
      if (requests == twitter_accounts.length) {
        return cb(responses);
      }
    });
  });
};
// ============================================================

verifyAccounts((result) => {
  console.log('Accounts verified.');
});

router.get('/users', function (req, res) {
	AnalysedUser.find({})
    .catch((err) => {
        res.status(400).send(err);
    })
    .then((result) => {
        res.status(200).json(result);
    });
});

router.get('/verifyAccounts/', function(req, res) {
  verifyAccounts((responses) => {
    res.send(responses);
  });
});

router.get('/botcheck/:screen_name', function (req, res) {
  twitter.get('statuses/user_timeline', { screen_name: req.params.screen_name, count: 200, include_rts: true }, function (err, data, result) {
    return res.status(200).json({err: err, data: data, result: result});
  });
});

router.post('/botcheck/', function(req, res) {
  req.socket.setTimeout(600000);
	var users = req.body.screen_names; // ["screen_name", "screen_name", "screen_name"]
	var requests = 0;
  var responses = [];
  var updateKeyInstance;
  
  users.forEach((user, i) => {
    if ((actual_key % 2 == 0 && (twitter_requests + 1) > 1499) || (actual_key % 2 != 0 && (twitter_requests + 1) > 899)) {
      if (actual_key == 7) {
        verifyAccounts((result) => {
          console.log('Accounts verified.');
        });
      }
      twitter_requests = 0;
      updateKeyInstance = SingletonClass.getInstance();
    }

    AnalysedUser.findOne({screen_name: user}) // Search if the user is already saved on the bd.
		.catch((err) => {
			responses[i] = { screen_name: user, error: "Mongo error." };
      requests++;

			if (requests == users.length) {
				done();
			}
		})
		.then((user_found) => { 
			if (user_found) { // AnalysedUser cached
				responses[i] = { screen_name: user, value: user_found.suspicious_level.value };
        requests++;

				if (requests == users.length) {
					done();
				}
      } else { // AnalysedUser not found
        twitter.get('statuses/user_timeline', { screen_name: user, count: 200, include_rts: true }, function (err, data, result) {
          if (err) {
            responses[i] = { screen_name: user, error: err.message || 'Something went wrong.' };
            requests++;
            twitter_requests++;

            if (requests == users.length) {
              done();
            }
          } else {
            if (data) {
              var analysis = TwitterDetector.bot_check(data[0].user, data);

              var analysedUser = new AnalysedUser();
              analysedUser.screen_name = user;
              analysedUser.suspicious_level = analysis.boolean_analysis.suspicious_level;

              analysedUser.save()
                .catch((err) => {
                  responses[i] = { screen_name: user, error: "Mongo error." };
                  requests++;
                  twitter_requests++;

                  if (requests == users.length) {
                    done();
                  }
                })
                .then(() => {
                  responses[i] = { screen_name: user, value: analysis.boolean_analysis.suspicious_level.value };
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
  });

	function done() {
		if (requests == users.length) {
      updateKeyInstance = SingletonClass.killInstance();
			res.status(200).send(responses);
		} else {
      updateKeyInstance = SingletonClass.killInstance();
			res.status(400).send('Error');
		}
	}
});

module.exports = router;