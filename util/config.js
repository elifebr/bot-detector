var twitter_config = [
	{
		consumer_key: "2iav6kFkEY3tziIh286tHIwcB",
		consumer_secret: "klefLEOnqNGc0XY3CFTPzXc4jEZJ2UJNCWkstY6BL4hAP8clRU",
		app_only_auth: true
	},
	{
		consumer_key: "2iav6kFkEY3tziIh286tHIwcB",
		consumer_secret: "klefLEOnqNGc0XY3CFTPzXc4jEZJ2UJNCWkstY6BL4hAP8clRU",
		access_token: "860864502887317504-jTtCQmfgvxEGxVzBL07OssTDxePETJg",
		access_token_secret: "axc1MfVPdMIAdkohYEUC2miMxCLgarLvbLyCR1JdkFnRy"
	},
	{
		consumer_key: "1gaOoVg8EQAIuhiQQgeg7sZjV",
		consumer_secret: "8bm6UKBBZdWJcdqtz0Fyq9ri5N4xOKYMxg4Bg4e3PeSnGnbYB0",
		app_only_auth: true
	},
	{
		consumer_key: "1gaOoVg8EQAIuhiQQgeg7sZjV",
		consumer_secret: "8bm6UKBBZdWJcdqtz0Fyq9ri5N4xOKYMxg4Bg4e3PeSnGnbYB0",
		access_token: "1018156508-3JAUbIelpSAyPPygcCEXQ4H6qyAQm9Kw7lx1d0U",
		access_token_secret: "j3ENh712UlNDEyY5VMyQO613QTGnpEPlF4QxPFHNTksSS"
	}
];

var instagram_config = {};

module.exports = {
	twitter_keys: twitter_config,
	instagram_keys: instagram_config,
	local_db_url : 'mongodb://localhost/bot-detector-dev',
	db_url: ''
};