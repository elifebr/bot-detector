var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AnalysedUserSchema = new Schema({
  screen_name: {
    type: String,
    index: true
  },
  created: {
      type: Date,
      default: Date.now
  },
  suspicious_level: { level: String, value: Number }
}, {autoIndex: false});

var AnalysedUser = mongoose.model('AnalysedUser', AnalysedUserSchema);

module.exports = AnalysedUser;
