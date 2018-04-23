var moment = require('moment');
var XRegExp = require('xregexp');

exports.statuses_acc_age_ratio = function(created_at, statuses_count) {
    var now = moment();
    var created = moment(created_at, "ddd MMM DD HH:kk:ss +-HHmm YYYY");
    var account_days = now.diff(created, 'days');
    var result = statuses_count / account_days;

    return result;
};

exports.followes_following_ratio = function(followers_count, following_count) {
    var result = following_count / followers_count;

    return result;
};

exports.is_alphanumeric = function(string) {
    const unicodeWord = XRegExp('^\\pL+$');
    var result = unicodeWord.test(string);

    return !result;
};

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
};

exports.has_link = function(string) {
    const url = XRegExp('([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?');

    var has_link = url.test(string);
}

exports.is_quote = function(tweet) {
    var has_quote_status = tweet.is_quote_status;

    var result = has_quote_status;
    return result;
};

exports.is_retweet = function(tweet) {
    var has_rt_key = tweet.hasOwnProperty('retweeted_status');
    var has_rt_text = tweet.text.startsWith('RT @');

    var result = { key: has_rt_key, text: has_rt_text };
    return result;
};

exports.is_answer = function(tweet) {
    var result = false;

    if (tweet.in_reply_to_status_id != null &&
        tweet.in_reply_to_status_id_str != null &&
        tweet.in_reply_to_user_id != null &&
        tweet.in_reply_to_user_id_str != null &&
        tweet.in_reply_to_screen_name != null) {
            result = true;
        }

    return result;
}

exports.is_original_post = function(tweet) {
    var result = true;

    if (this.is_retweet(tweet) || this.is_quote(tweet)) {
        result = false;
    }

    return result;
};