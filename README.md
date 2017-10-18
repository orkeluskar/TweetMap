# TweetMap

## This app makes use of:
1. Logstash - as data pipeline to ElasticSearch from Twitter
2. Twitter - as input to logstash
3. ElasticSearch - as ouput to logstash and input for the app

## Logstash config
`twitter.conf:`
```
input {
  twitter {
      consumer_key => ""
      consumer_secret => ""
      oauth_token => ""
      oauth_token_secret => ""
      keywords => ["keyword-1", "keyword-2","keyword-n"]
      full_tweet => true
  }
}
filter {
}
output {
  elasticsearch {
        hosts => ["aws-cluster-endpoint:80"]
        ssl => false	
        index => "twitter"
        document_type => "tweet"
        template => "twitter_template.json"
        template_name => "twitter"
  }
}
```


## Sample ElasticSearch querying
```
Request:
https://cluster-endpoint/twitter/_search?q=[keyword]&size=[n]

Response:
JSON formatted full tweet data


Additional filtering:
https://cluster-endpoint/twitter/_search?q=[keyword]&size=[n]&_source=text,user.location,user.screen_name,id_str,@timestamp,user.profile_image_url_https

Above query just returns us with:
1. tweet text
2. user location, if any
3. user screen name
4. string id, to tag user
5. timestamp of the tweet
6. profile Image URL
```

