var moment = require('moment');
var XRegExp = require('xregexp');

var statuses_acc_age_ratio = function(created_at, statuses_count) {
    var now = moment();
    var created = moment(created_at, "ddd MMM DD HH:kk:ss +-HHmm YYYY");
    var account_days = now.diff(created, 'days');
    var result = statuses_count / account_days;

    return result;
};

var followers_following_ratio = function(followers_count, following_count) {
    var result = following_count / followers_count;

    return result;
};

var is_alphanumeric = function(name, screen_name) {
    const unicodeWord = XRegExp('^\\pL+$');
    var name_alpha = unicodeWord.test(name);
    var screen_name_alpha = unicodeWord.test(screen_name);

    return { name: !name_alpha, screen_name: !screen_name_alpha };
};

var name_screen_name_matches = function(name, screen_name) {
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

var has_link = function(string) {
    const url = XRegExp('([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?');

    var has_link = url.test(string);
}

var is_retweet = function(tweet) {
    var has_rt_key = tweet.hasOwnProperty('retweeted_status');
    var has_rt_text = tweet.text.startsWith('RT @');

    var result = { key: has_rt_key, text: has_rt_text };
    return result;
};

var is_quote = function(tweet) {
    var has_quote_status = tweet.is_quote_status;

    var result = has_quote_status;
    return result;
};

var is_answer = function(tweet) {
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

var is_original_post = function(tweet) {
    return !(is_retweet(tweet) && is_quote(tweet) && is_answer(tweet));
};

var update_user_stats = function (user, results) {
    results.followers_following_ratio = followers_following_ratio(user.followers_count, user.friends_count);
    results.statuses_ratio = statuses_acc_age_ratio(user.created_at, user.statuses_count);
    results.is_alphanumeric = is_alphanumeric(user.name, user.screen_name);
    results.name_screen_name_matches = name_screen_name_matches(user.name, user.screen_name);

    return results;
}

var update_tweets_stats = function (timeline, results) {
    for (var i = 0; i < timeline.length; i++) {
        var tweet = timeline[i];

        if (has_link(tweet)) {
            results.tweets.has_link.count += 1;
        }

        rt_check = is_retweet(tweet);
        quote_check = is_quote(tweet);
        answer_check = is_answer(tweet);
        original_check = is_original_post(tweet);

        if (rt_check.key && rt_check.text) {
            results.tweets.is_retweet.count += 1;
        } else if (!rt_check.key && rt_check.text) {
            results.tweets.is_retweet.count += 1;
            results.tweets.is_fake_rt.count += 1;
        } else if (quote_check) {
            results.tweets.is_quote.count += 1;
        } else if (answer_check) {
            results.tweets.is_answer.count += 1;
        } else if (original_check) {
            results.tweets.is_original_post.count += 1;
        }
    }

    return results;
}

var update_tweets_ratios = function (results, size) {
    results.tweets.has_link.ratio = results.tweets.has_link.count / size;
    results.tweets.is_retweet.ratio = results.tweets.is_retweet.count / size;
    results.tweets.is_fake_rt.ratio = results.tweets.is_fake_rt.count / size;
    results.tweets.is_quote.ratio = results.tweets.is_quote.count / size;
    results.tweets.is_answer.ratio = results.tweets.is_answer.count / size;
    results.tweets.is_original_post.ratio = results.tweets.is_original_post.count / size;

    return results;
}

var bot_analysis = function(results) {
    var weigth = results.followers_following_ratio * 7 +
                results.statuses_ratio * 1.6 +
                results.tweets.has_link.ratio * 100 * 1.2 +
                results.tweets.is_retweet.ratio * 100 * 1.1 +
                results.tweets.is_quote.ratio * 100 +
                results.tweets.is_fake_rt.ratio * 100 * 2;

    if (weigth - results.tweets.is_answer.ratio * 100 * 0.5 > 0) {
        weigth -= results.tweets.is_answer.ratio * 100 * 0.5;
    }

    if (weigth - results.tweets.is_original_post.ratio * 100 > 0) {
        weigth -= results.tweets.is_original_post.ratio * 100;
    }
    
    if (!results.is_alphanumeric.name && !results.is_alphanumeric.screen_name && results.name_screen_name_matches && weigth >= 50) {
        weigth -= 50;
    } else if ((!results.is_alphanumeric.name && !results.is_alphanumeric.screen_name) && weigth >= 30) {
        weigth -= 30;
    } else if ((!results.is_alphanumeric.name || !results.is_alphanumeric.screen_name) && weigth >= 10) {
        weigth -= 10;
    } else if (results.is_alphanumeric.name && results.is_alphanumeric.screen_name && weigth <= 100) {
        weigth += 50;
    } else if((results.is_alphanumeric.name || results.is_alphanumeric.screen_name) && weigth <= 100) {
        weigth += 25;
    }

    if (weigth > 100) {
        weigth = 100;
    }

    return weigth;
}

exports.bot_check = function(user, timeline) {
    var results = {
        followers_following_ratio: 0,
        statuses_ratio: 0,
        is_alphanumeric: { name: false, screen_name: false },
        name_screen_name_matches: false,
        tweets: {
            has_link: { count: 0, ratio: 0.0 },
            is_retweet: { count: 0, ratio: 0.0 },
            is_fake_rt: { count: 0, ratio: 0.0 },
            is_quote: { count: 0, ratio: 0.0 },
            is_answer: { count: 0, ratio: 0.0 },
            is_original_post: { count: 0, ratio: 0.0 }
        },
        analysis: 0
    };

    results = update_user_stats(user, results);

    results = update_tweets_stats(timeline, results);

    results = update_tweets_ratios(results, timeline.length);

    results.analysis = bot_analysis(results);

    return results;
}