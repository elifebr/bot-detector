// Imports
var express         = require('express');
var logger          = require('morgan');
var bodyParser      = require('body-parser');
var Twit 			      = require('twit');
var mongoose        = require('mongoose');

// Starting Express and Mongo
var app = express();
var db = require('../util/config');
mongoose.connect(db.nouser_db_url);

// Define middleware
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Routes
var twitter 	= require('../routes/twitter.js');
var instagram 	= require('../routes/instagram.js');
app.use('/twitter', twitter);
app.use('/instagram', instagram);

// Test API
app.get('/', function(req, res) {
  res.send('Express server listening on port ' + (process.env.PORT || 3000));
});

// Error handlers
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res) {
  res.status(err.status || 500);
  res.end(JSON.stringify({
    message: err.message,
    error: {}
  }));
});

module.exports = app;