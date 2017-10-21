var ESclient = require('./ES_conn');
var Tclient = require('./twitter_conn');

/**
 * Stream statuses filtered by keyword
 * number of tweets per second depends on topic popularity
 **/

const keyword = 'trump, dota, mumbai, httr, nlcs, nfl, eminem, rain, cricket, vodka';
var count = 0;

//count the documents in the elasticsearch cluster
ESclient.count({ 
    index: 'tweets'
},function(err, res, status) {
    if(err) {
        console.log(err);
    }
    else {
        count = res.count;
    }
});

// Our rich twitter stream
Tclient.stream('statuses/filter', {track: keyword}, function(stream) {

    stream.on('data', function(event) {
        if (count > 10000000){
            stream.destroy();
        }
        if (event != undefined){
            if (event.place != null && 'full_name' in event.place){
                
                // if there's user details in the stream event
                if ('user' in event){
                    // log for knowing whether the stream resumes
                    console.log(10000000 - count, event.place.full_name);
                    ESclient.index({  
                        index: 'tweets',
                        type: 'tweets',       
                        body: {
                            id: 10000000 - count,
                            user_id_str: event.id_str,
                            profile_img_url: event.user.profile_image_url_https,
                            screen_name: event.user.screen_name,
                            location: event.place.full_name,
                            date: event.created_at,
                            text: event.text
                        }
                    },function(err,resp,status) {
                        ++count;                      
                    });          
                }
            }
        }
    });   
    stream.on('error', function(error) {
      throw error;
    });    
});