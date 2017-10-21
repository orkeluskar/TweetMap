// global variables 
var map;
let marker;
var locat = [{lat: -25.363, lng: 131.044}];
var result = ['lol'];
var bounds;

// Following function places markers on the map for every tweet and its corresponding location
function initMap() {
    var bounds = new google.maps.LatLngBounds();
    var uluru = {lat: 45.708346, lng: -12.109734};
     map = new google.maps.Map(document.getElementById('gmap'), {
      zoom: 3,
      center: uluru
    });

    for (i in locat){
        
        if (i != 0){
            bounds.extend(locat[i]);
            let temp = document.createElement('div');
            temp.innerHTML = result[i];

            let infowindow = new google.maps.InfoWindow({
                content: temp.firstChild,
                position: locat[i],
                maxWidth: 300
            });
            let marker = new google.maps.Marker({
                position: locat[i],
                map: map,
            });
            marker.addListener('click', function() {
                infowindow.open(map, marker);
            });
            map.fitBounds(bounds);
        }
       
    }
    
}

//get coordinates from the location
function loadDoc(url, cFunction, markup) {
    
    var xhttp;
    xhttp=new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        cFunction(this, markup);
      }
    };
    xhttp.open("GET", url, true);
    xhttp.send();
}

function myFunction(xhttp, markup) {
    if (xhttp.responseText != null && JSON.parse(xhttp.responseText).results[0] != undefined){
        var res  = JSON.parse(xhttp.responseText);
        //console.log(res.results["0"].geometry.location);
        let location = {
            lat: res.results["0"].geometry.location.lat,
            lng: res.results["0"].geometry.location.lng
        };
        locat.push(location);
        result.push(markup);      
    }   
}

function getcoordinates(address, markup){
    var uri = 'http://18.216.48.10:8081/geoloc?location=' + address;
    // routing this to my async call
    loadDoc(uri, myFunction, markup); 
}

function getdata(){
    const keyword = document.getElementById('keyword').value;
    const count = document.getElementById('test5').value;
    displaydata(keyword, count);
}

function displaydata(keyword, count){
    var myRequest = 'http://18.216.48.10:8081/tweets?query=' + keyword + '&size=' + count;
    fetch(myRequest).then(function(response) {    
        return response.json();
    })
    .then(function(json) { 
        //console.log(json)
        var obj = json.hits.hits;
        result = ['lol'];
        locat = [{lat: -25.363, lng: 131.044}];

        for (var tweet in obj) {
            let date = new Date(obj[tweet]._source.date);

            res =  '<div class="row card-panel">'    
                        + '<div class="col s3 card-image">'
                            + '<img class="profile-img" src="' + obj[tweet].profile_img_url + '">'
                        + '</div>'
                        + '<div class="s9">'
                            + '<p>'
                            + 'location: ' + obj[tweet]._source.location + '</br>'
                            + '<a class=""nav-link" href="https://twitter.com/' + obj[tweet]._source.screen_name + '" target="_blank">@'
                            + obj[tweet]._source.screen_name + '</a>&nbsp;&nbsp;&nbsp;'
                            + date.toString().slice(0,25) + '</br>'
                            + '<strong>' + obj[tweet]._source.text + '</strong>&nbsp;&nbsp;&nbsp'
                            + '<a href="https://twitter.com/' + obj[tweet]._source.screen_name 
                            + '/status/' +  obj[tweet]._source.user_id_str + '" target="_blank">t.co</a>'
                            + '</p>'
                        + '</div>'
                    + '</div>';
            // since I'm filtering them pesky non-location including tweets in my data-pipeline
            // No more need to check for the location == undefined/null here
            getcoordinates(obj[tweet]._source.location, res);
            
        }
        setTimeout(initMap, 5000); 
    }).then( () => {

        return setInterval(newdata, 10000);
    })
    .catch(function(error) { console.log(error); });
}


//newer data

function newdata(){
    let keyword = document.getElementById('keyword').value;
    let count = document.getElementById('test5').value;
    console.log(keyword, count);
    var myRequest = 'http://18.216.48.10:8081/tweets?query=' + keyword + '&size=' + count;
    fetch(myRequest).then(function(response) {    
        return response.json();
    })
    .then(function(json) { 
        //console.log(json)
        var obj = json.hits.hits;
        result = ['lol'];
        locat = [{lat: -25.363, lng: 131.044}];

        for (var tweet in obj) {
            let date = new Date(obj[tweet]._source.date);

            res =  '<div class="row card-panel">'    
                        + '<div class="col s3 card-image">'
                            + '<img class="profile-img" src="' + obj[tweet].profile_img_url + '">'
                        + '</div>'
                        + '<div class="s9">'
                            + '<p>'
                            + 'location: ' + obj[tweet]._source.location + '</br>'
                            + '<a class=""nav-link" href="https://twitter.com/' + obj[tweet]._source.screen_name + '" target="_blank">@'
                            + obj[tweet]._source.screen_name + '</a>&nbsp;&nbsp;&nbsp;'
                            + date.toString().slice(0,25) + '</br>'
                            + '<strong>' + obj[tweet]._source.text + '</strong>&nbsp;&nbsp;&nbsp'
                            + '<a href="https://twitter.com/' + obj[tweet]._source.screen_name 
                            + '/status/' +  obj[tweet]._source.user_id_str + '" target="_blank">t.co</a>'
                            + '</p>'
                        + '</div>'
                    + '</div>';
            // since I'm filtering them pesky non-location including tweets in my data-pipeline
            // No more need to check for the location == undefined/null here
            getcoordinates(obj[tweet]._source.location, res);
            
        }

    }).then(() => { Materialize.toast('New tweets might have been found!', 3000); return setTimeout(initMap, 1000)})
}