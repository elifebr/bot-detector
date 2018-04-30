var moment = require('moment');
var XRegExp = require('xregexp');

var statuses_acc_age_ratio = function(created_at, last_tweet_at, statuses_count) {
    last_tweet_at = moment(last_tweet_at, "ddd MMM DD HH:kk:ss +-HHmm YYYY");
    var created = moment(created_at, "ddd MMM DD HH:kk:ss +-HHmm YYYY");
    var account_days = last_tweet_at.diff(created, 'days');
    var result = statuses_count / account_days;

    return result;
};

var followers_following_ratio = function(followers_count, following_count) {
    var result = following_count / followers_count;

    return result;
};

var is_alphanumeric = function(name, screen_name) {
    const unicodeWord = XRegExp('^[\\pL\\p{pc}]*$');
    var name_alpha = unicodeWord.test(name);
    var screen_name_alpha = unicodeWord.test(screen_name);

    return { name: !name_alpha, screen_name: !screen_name_alpha };
};

var name_screen_name_matches = function(name, screen_name, description) {
    var name_match = false;
    var description_match = false;

    name = name.toLowerCase();
    screen_name = screen_name.toLowerCase();
    description = description.toLowerCase();

    name = name.split(' ');
    for (var i = 0; i < name.length; i++) {
        word = name[i];

        if (screen_name.includes(word)) {
            name_match = true;
        } 
        
        if (description.includes(word)) {
            description_match = true;
        }

        if (name_match && description_match) break;
    }

    return result = { name_screen: name_match, name_screen_description: description_match };;
};

var has_link = function(string) {
    const url = XRegExp('([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?');
    
    var has_link = url.test(string);

    return has_link;
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

var update_user_stats = function (user, timeline, results) {
    results.followers_following_ratio = followers_following_ratio(user.followers_count, user.friends_count);
    results.statuses_ratio = statuses_acc_age_ratio(user.created_at, timeline[0].created_at, user.statuses_count);
    results.is_alphanumeric = is_alphanumeric(user.name, user.screen_name);
    results.name_screen_name_matches = name_screen_name_matches(user.name, user.screen_name, user.description);

    return results;
}

var checkHashtags = function(array, tweet) {
    var result = [];

    if (tweet.entities.hashtags) {
        for (var i = 0; i < tweet.entities.hashtags.length; i++) {
            hashtag = tweet.entities.hashtags[i].text;
            result.push(hashtag);
        }
    }

    return result;
}

var update_tweets_stats = function (timeline, results) {
    var hashtags = [];

    for (var i = 0; i < timeline.length; i++) {
        var tweet = timeline[i];

        if (has_link(tweet.text)) {
            results.tweets.has_link.count += 1;
        }
        
        var aux = checkHashtags(hashtags, tweet);
        if (aux.length > 0) {
            results.tweets.hashtags.count += 1;

            for (var j = 0; j < aux.length; j++) {
                hashtags.push(aux[j]);
            }
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

    var unique = new Set(hashtags); 

    results.tweets.hashtags.unique += unique.size;

    return results;
}

var update_tweets_ratios = function (results, size) {
    results.tweets.hashtags.ratio = (results.tweets.hashtags.count / results.tweets.hashtags.unique) / size;
    results.tweets.has_link.ratio = results.tweets.has_link.count / size;
    results.tweets.is_retweet.ratio = results.tweets.is_retweet.count / size;
    results.tweets.is_fake_rt.ratio = results.tweets.is_fake_rt.count / size;
    results.tweets.is_quote.ratio = results.tweets.is_quote.count / size;
    results.tweets.is_answer.ratio = results.tweets.is_answer.count / size;
    results.tweets.is_original_post.ratio = results.tweets.is_original_post.count / size;

    return results;
}

var bot_boolean_analysis = function(results) {
    var result = 0;

    // ff_ratio
    if (results.followers_following_ratio > 35) {
        results.boolean_analysis.ff_ratio = 7;
    } else if (results.followers_following_ratio > 25) {
        results.boolean_analysis.ff_ratio = 5;
    } else if (results.followers_following_ratio > 15) {
        results.boolean_analysis.ff_ratio = 3;
    } else if (results.followers_following_ratio > 10) {
        results.boolean_analysis.ff_ratio = 1;
    }
    // statuses_ratio
    if (results.statuses_ratio > 125) {
        results.boolean_analysis.statuses_ratio = 15;
    } else if (results.statuses_ratio > 75) {
        results.boolean_analysis.statuses_ratio = 12;
    } else if (results.statuses_ratio > 50) {
        results.boolean_analysis.statuses_ratio = 9;
    } else if (results.statuses_ratio > 35) {
        results.boolean_analysis.statuses_ratio = 6;
    } else if (results.statuses_ratio > 15) {
        results.boolean_analysis.statuses_ratio = 3;
    }
    // profile
    if ((results.is_alphanumeric.name && results.is_alphanumeric.screen_name) && (results.name_screen_name_matches.name_screen || results.name_screen_name_matches.name_screen_description)) {
        results.boolean_analysis.profile = 6;
    } else if (results.name_screen_name_matches.name_screen && results.name_screen_name_matches.name_screen_description) {
        results.boolean_analysis.profile = 4;
    } else if ((results.is_alphanumeric.name && results.is_alphanumeric.screen_name) || (results.name_screen_name_matches.name_screen || results.name_screen_name_matches.name_screen_description)) {
        results.boolean_analysis.profile = 2;
    } else if (results.is_alphanumeric.name || results.is_alphanumeric.screen_name) {
        results.boolean_analysis.profile = 1;
    }
    // suspicious_behavior
    if (results.tweets.hashtags.ratio > 0.90) {
        results.boolean_analysis.suspicious_hashtag = 9;
    } else if (results.tweets.is_retweet.ratio > 0.75 || results.tweets.is_fake_rt.count > 1) {
        results.boolean_analysis.suspicious_hashtag = 7;
    } else if (results.tweets.is_retweet.ratio > 0.55) {
        results.boolean_analysis.suspicious_hashtag = 5;
    } else if (results.tweets.is_retweet.ratio > 0.35) {
        results.boolean_analysis.suspicious_hashtag = 3;
    } else if (results.tweets.is_retweet.ratio > 0.15) {
        results.boolean_analysis.suspicious_hashtag = 1;
    }

    if (results.tweets.is_retweet.ratio > 0.90 || results.tweets.is_fake_rt.ratio > 0.1) {
        results.boolean_analysis.suspicious_rt = 10;
    } else if (results.tweets.is_retweet.ratio > 0.75 || results.tweets.is_fake_rt.count > 1) {
        results.boolean_analysis.suspicious_rt = 8;
    } else if (results.tweets.is_retweet.ratio > 0.55) {
        results.boolean_analysis.suspicious_rt = 6;
    } else if (results.tweets.is_retweet.ratio > 0.35) {
        results.boolean_analysis.suspicious_rt = 4;
    } else if (results.tweets.is_retweet.ratio > 0.15) {
        results.boolean_analysis.suspicious_rt = 2;
    }

    if (results.tweets.is_quote.ratio > 0.90 || results.tweets.has_link.ratio > 0.90) {
        results.boolean_analysis.suspicious_quote = 15;
    } else if (results.tweets.is_quote.ratio > 0.75 || results.tweets.has_link.ratio > 0.75) {
        results.boolean_analysis.suspicious_quote = 12;
    } else if (results.tweets.is_quote.ratio > 0.55 || results.tweets.has_link.ratio > 0.55) {
        results.boolean_analysis.suspicious_quote = 9;
    } else if (results.tweets.is_quote.ratio > 0.35 || results.tweets.has_link.ratio > 0.35) {
        results.boolean_analysis.suspicious_quote = 6;
    } else if (results.tweets.is_quote.ratio > 0.15 || results.tweets.has_link.ratio > 0.15) {
        results.boolean_analysis.suspicious_quote = 3;
    }

    // result
    result += results.boolean_analysis.ff_ratio + results.boolean_analysis.statuses_ratio + results.boolean_analysis.profile + results.boolean_analysis.suspicious_hashtag + results.boolean_analysis.suspicious_rt + results.boolean_analysis.suspicious_quote;
    results.boolean_analysis.suspicious_level.value = result / 60;

    return results.boolean_analysis;
}

var update_suspicious_level = function (value) {
    var level = '';

    if (value > 0.8) {
        level = 'Extremamente suspeito';
    } else if (value > 0.6) {
        level = 'Muito Suspeito';
    } else if (value > 0.4) {
        level = 'Suspeito';
    } else if (value > 0.2) {
        level = 'Pouco suspeito';
    } else {
        level = 'Não suspeito'
    }

    return level;
}

exports.bot_check = function(user, timeline) {
    var results = {
        followers_following_ratio: 0,
        statuses_ratio: 0,
        is_alphanumeric: { name: false, screen_name: false },
        name_screen_name_matches: { name_screen: false, name_screen_description: false },
        tweets: {
            hashtags: { count: 0, unique: 0, ratio: 0.0 },
            has_link: { count: 0, ratio: 0.0 },
            is_retweet: { count: 0, ratio: 0.0 },
            is_fake_rt: { count: 0, ratio: 0.0 },
            is_quote: { count: 0, ratio: 0.0 },
            is_answer: { count: 0, ratio: 0.0 },
            is_original_post: { count: 0, ratio: 0.0 }
        },
        boolean_analysis: {
            ff_ratio: 0,
            statuses_ratio: 0,
            profile:  0,
            suspicious_hashtag: 0,
            suspicious_rt: 0,
            suspicious_quote: 0,
            suspicious_level: {
                level: '',
                value: 0
            }
        }
    };

    results = update_user_stats(user, timeline, results);

    results = update_tweets_stats(timeline, results);

    results = update_tweets_ratios(results, timeline.length);

    results.boolean_analysis = bot_boolean_analysis(results);

    results.boolean_analysis.suspicious_level.level = update_suspicious_level(results.boolean_analysis.suspicious_level.value);

    return results;
}