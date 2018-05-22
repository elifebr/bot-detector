require('dotenv').load();

var twitter_config = [
	{
		consumer_key: process.env.TWITTER_APP_1_KEY,
		consumer_secret: process.env.TWITTER_APP_1_SECRET,
		app_only_auth: true
	},
	{
		consumer_key: process.env.TWITTER_APP_1_KEY,
		consumer_secret: process.env.TWITTER_APP_1_SECRET,
		access_token: process.env.TWITTER_USER_1_TOKEN,
		access_token_secret: process.env.TWITTER_USER_1_TOKEN_SECRET
	},
	{
		consumer_key: process.env.TWITTER_APP_2_KEY,
		consumer_secret: process.env.TWITTER_APP_2_SECRET,
		app_only_auth: true
	},
	{
		consumer_key: process.env.TWITTER_APP_2_KEY,
		consumer_secret: process.env.TWITTER_APP_2_SECRET,
		access_token: process.env.TWITTER_USER_2_TOKEN,
		access_token_secret: process.env.TWITTER_USER_2_TOKEN_SECRET
	},
	{
		consumer_key: process.env.TWITTER_APP_3_KEY,
		consumer_secret: process.env.TWITTER_APP_3_SECRET,
		app_only_auth: true
	},
	{
		consumer_key: process.env.TWITTER_APP_3_KEY,
		consumer_secret: process.env.TWITTER_APP_3_SECRET,
		access_token: process.env.TWITTER_USER_3_TOKEN,
		access_token_secret: process.env.TWITTER_USER_3_TOKEN_SECRET
	},
	{
		consumer_key: process.env.TWITTER_APP_4_KEY,
		consumer_secret: process.env.TWITTER_APP_4_SECRET,
		app_only_auth: true
	},
	{
		consumer_key: process.env.TWITTER_APP_4_KEY,
		consumer_secret: process.env.TWITTER_APP_4_SECRET,
		access_token: process.env.TWITTER_USER_4_TOKEN,
		access_token_secret: process.env.TWITTER_USER_4_TOKEN_SECRET
	}
];

var instagram_config = {};

module.exports = {
	twitter_keys: twitter_config,
	instagram_keys: instagram_config,
	nouser_db_url : 'mongodb://' + process.env.MONGO_HOST + '/bot-detector',
	db_url: 'mongodb://' + process.env.MONGO_USER + ':' + process.env.MONGO_PASS + '@' + process.env.MONGO_HOST + ':' + process.env.MONGO_PORT + '/bot-detector'
};