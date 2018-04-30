var twitter_config = {
	account_app: {
		consumer_key: "2iav6kFkEY3tziIh286tHIwcB",
		consumer_secret: "klefLEOnqNGc0XY3CFTPzXc4jEZJ2UJNCWkstY6BL4hAP8clRU",
		app_only_auth: true
	},
	account_user: {
		consumer_key: "2iav6kFkEY3tziIh286tHIwcB",
		consumer_secret: "klefLEOnqNGc0XY3CFTPzXc4jEZJ2UJNCWkstY6BL4hAP8clRU",
		access_token: "860864502887317504-jTtCQmfgvxEGxVzBL07OssTDxePETJg",
		access_token_secret: "axc1MfVPdMIAdkohYEUC2miMxCLgarLvbLyCR1JdkFnRy"
	}
};

var instagram_config = {};

module.exports = {
	twitter_keys: twitter_config,
	instagram_keys: instagram_config,
	local_db_url : 'mongodb://localhost/bot-detector-dev',
	db_url: ''
};