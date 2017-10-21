# TweetMap

## This app makes use of:
1. Node 
   - data pipeline to [AWS] ElasticSearch from Twitter
   - As app server on [AWS] Elastic Beanstalk
2. Twitter Streaming node module
3. ElasticSearch - data store


## Sample System Architecture
![System Architecture hosted on AWS](system_architecture.png?raw=true "System Architecture")


## Quick start?

1. npm install
2. Get your API keys from [Twitter Apps](https://apps.twitter.com/)
3. Deploy an ElasticSearch on AWS
4. Create an `ES_Conn.js` file to connect to elasticSearch cluster created in step3
   - Fill in the URL as per your cluster's address 
      ```
      var elasticsearch = require('elasticsearch');

      var client = new elasticsearch.Client( {  
      hosts: [
        '[ElasticSearch-cluster-address:80]'
      ]
      });

      module.exports = client;  
      ```
   - Create an `twitter_conn.js` for twitter API keys
     ```
      var Twitter = require('twitter');

      var client = new Twitter({

          consumer_key: "",
          consumer_secret: "",
          access_token_key: "",
          access_token_secret: ""

      });

      module.exports = client;
     ```
5. Create an ElasticSearch index, say 'tweets' in this case, then:
   - I've chose these keywords for my example in the `datapipe.js`:
      ```
      'trump, dota, mumbai, httr, nlcs, nfl, eminem, rain, cricket, vodka'
      ```
      You can chose any keywords of your choice in `datapipe.js`
   - Run datapipe.js on a terminal or EC2 instance

6. add a config.js into the directory same as index.js, with following data:
   - 
        ```
        var config = {
            "esURI": "elasticSearch-cluster-endpoint",
            "esIndex": "twitter",
            "geoAPI": "https://maps.googleapis.com/maps/api/geocode/json",
            "geoCodeKey": ""
        };

        module.exports = config;
        ```
    - Above config file abstracts the sensitive data and API keys
    - (geoCodeKey)[https://developers.google.com/maps/documentation/geocoding/intro] can be found here
    - geoCode API helps to get latitude, longitude based on textual location 
    - Request: `https://maps.googleapis.com/maps/api/geocode/json?address=New+York,NY&key=[YourKey]`
    - Response: geoJSON response object
7. Run it by `node index.js`
8. If running elsewhere, say EC2. Rewrite the getURLs in static/script.js,
   - from: `http://localhost:[port]/`
   - to: `http://[EC2-public-ip]:[port]/`


# Ignore this if using node datapipe
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
1. Request:
   https://cluster-endpoint/twitter/_search?q=[keyword]&size=[n]

   Response:
   JSON formatted full tweet data

2. Request:
   https://cluster-endpoint/twitter/_search?q=[keyword]&size=[n]&sort=id

   Response:
   JSON formatted tweet data with sort on id

```

