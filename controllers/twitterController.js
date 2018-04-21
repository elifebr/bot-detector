var moment = require('moment');
var XRegExp = require('xregexp');

exports.statuses_acc_age_ratio = function(created_at, statuses_count) {
    var now = moment();
    var created = moment(created_at, "ddd MMM DD HH:kk:ss +-HHmm YYYY");
    var account_days = now.diff(created, 'days');
    var result = statuses_count / account_days;

    return result;
}

exports.followes_following_ratio = function(followers_count, following_count) {
    var result = following_count / followers_count;

    return result;
}

exports.is_alphanumeric = function(string) {
    const unicodeWord = XRegExp('^\\pL+$');
    var result = unicodeWord.test(string);

    return !result;
}

exports.name_screen_name_matches = function(name, screen_name) {
    var result = false;

    name = name.toLowerCase();
    screen_name = screen_name.toLowerCase();

    name = name.split(' ');
    for (word in name) {
        if (screen_name.includes(word)) {
            result = true;
            break;
        }
    }

    return result;
}