var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AnalysedUserSchema = new Schema({
  screen_name: String,
  created: {
      type: Date,
      default: Date.now
  },
  suspicious_level: { level: String, value: Number }
});

var AnalysedUser = mongoose.model('AnalysedUser', AnalysedUserSchema);

module.exports = AnalysedUser;
