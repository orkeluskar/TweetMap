const express = require('express');
const bodyParser = require('body-parser');
const app = express();
// Elastic beanstalk environment variables
const port = process.env.PORT || 8081;
const request = require('request');

// This mimics isomorphic fetch request in javascript
const fetch = require('node-fetch');
app.use(express.static('./'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

//serve static files using express
app.use(express.static('static/'));

// parse application/json
app.use(bodyParser.json());

// Importing my configuration file
const config = require('./config');

// retrieves tweets and pipes 'em to front-end
app.get('/tweets', function(req, res, next) {
    
    //console.log(req.query.query, req);
    "use strict";
    let query = req.query.query;
    let size = req.query.size;
    let ESreq =  config.esURI 
                    + '/' + config.esIndex
                    + '/_search'
                    + '?q=' + query 
                    + '&size=' + size 
                    + '&sort=id';
    
    request({
      uri: ESreq
    }).pipe(res);
});

app.get('/geoloc', function(req, res, next) {
    //console.log(req.query.query);
    "use strict";
    let location = req.query.location;
    //console.log(location);
    let geoReq =  config.geoAPI 
                    + '?address='
                    + location
                    + '&key='
                    + config.geoCodeKey;
    //console.log(geoReq);
    request({
      uri: geoReq
    }).pipe(res);
});

app.listen(port, function(){
    console.log("listening on " + port);
});
