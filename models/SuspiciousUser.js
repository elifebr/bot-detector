var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SuspiciousUserSchema = new Schema({
  screen_name: String,
  result: JSON,
  created: {
      type: Date,
      default: Date.now
  },
  suspicious_level: { level: String, value: Number }
});

var SuspiciousUser = mongoose.model('SuspiciousUser', SuspiciousUserSchema);

module.exports = SuspiciousUser;
