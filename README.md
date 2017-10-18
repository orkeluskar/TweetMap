# TweetMap

## This app makes use of:
1. Logstash - as data pipeline to [AWS]ElasticSearch from Twitter
2. Twitter - as input to logstash
3. ElasticSearch - as ouput to logstash and input for the app


## Quick start?
```
1. npm install
2. Get your API keys from [Twitter Apps](https://apps.twitter.com/)
3. Deploy your ElasticSearch on AWS
4. fill in the logstash config files
```


## Logstash config
`twitter.conf:`
```
input {
  twitter {
      consumer_key => ""
      consumer_secret => ""
      oauth_token => ""
      oauth_token_secret => ""
      keywords => ["keyword-1", "keyword-2", "keyword-n"]
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

`twitter_template.json`
`credits to [David Pilato](http://http://david.pilato.fr/blog/2015/06/01/indexing-twitter-with-logstash-and-elasticsearch/)`
```
{
  "template": "twitter",
  "order":    1,
  "settings": {
    "index.mapping.total_fields.limit": 2000,
    "number_of_shards": 1,
    "number_of_replicas": 0
  },
  "mappings": {
    "tweet": {
      "_all": {
        "enabled": false
      },
      "dynamic_templates" : [ {
         "message_field" : {
           "match" : "message",
           "match_mapping_type" : "string",
           "mapping" : {
             "type" : "string", "index" : "analyzed", "omit_norms" : true
           }
         }
       }, {
         "string_fields" : {
           "match" : "*",
           "match_mapping_type" : "string",
           "mapping" : {
             "type" : "string", "index" : "analyzed", "omit_norms" : true,
               "fields" : {
                 "raw" : {"type": "string", "index" : "not_analyzed", "ignore_above" : 256}
               }
           }
         }
       } ],
      "properties": {
        "text": {
          "type": "string"
        },
          "coordinates": {
          "properties": {
             "coordinates": {
                "type": "geo_point"
             },
             "type": {
                "type": "string"
             }
          }
       }
      }
    }
  }
}
```

`Uncomment this following line from logstash.yml, which can be found under config/logstah.yml. It'll batch your streaming tweets and pass them as they fillup or delay of 5 seconds is reached`
```
   pipeline.batch.size: 125
   pipeline.batch.delay: 5
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

