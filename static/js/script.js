// global variables 
var map;
let marker;
var locat = [{lat: -25.363, lng: 131.044}];
var result = ['lol'];

// Following function places markers on the map for every tweet and its corresponding location
function initMap() {

    var uluru = {lat: 45.708346, lng: -12.109734};
     map = new google.maps.Map(document.getElementById('gmap'), {
      zoom: 3,
      center: uluru
    });


    for (i in locat){
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
        //console.log(locat[i]);

        marker.addListener('click', function() {
            infowindow.open(map, marker);
          });
        
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
    var mapAPIRequest = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&key=AIzaSyDlHKltld8B7MCTCFByTAkjzQGpkiKwjaE';
    var uri = 'http://localhost:8080/geoloc?location=' + address;
    // routing this to my async call
    loadDoc(uri, myFunction, markup); 
}



function getdata(){
    const keyword = document.getElementById('keyword').value;
    const count = document.getElementById('test5').value;
    displaydata(keyword, count);
}

function displaydata(keyword, count){
    var myRequest = 'http://localhost:8080/tweets?query=' + keyword + '&size=' + count;
    fetch(myRequest).then(function(response) {    
        return response.json();
    })
    .then(function(json) { 
        var obj = json.hits.hits;
        result = ['lol'];
        locat = [{lat: -25.363, lng: 131.044}];

        for (var tweet in obj) {
            let date = new Date(obj[tweet]._source["@timestamp"]);

            res =  '<div class="row card-panel">'    
                        + '<div class="col s3 card-image">'
                            + '<img class="profile-img" src="' + obj[tweet]._source.user.profile_image_url_https + '">'
                        + '</div>'
                        + '<div class="s9">'
                            + '<p>'
                            + 'location: ' + obj[tweet]._source.user.location + '</br>'
                            + '<a class=""nav-link" href="https://twitter.com/' + obj[tweet]._source.user.screen_name + '" target="_blank">@'
                            + obj[tweet]._source.user.screen_name + '</a>&nbsp;&nbsp;&nbsp;'
                            + date.toString().slice(0,25) + '</br>'
                            + obj[tweet]._source.text + '&nbsp;&nbsp;&nbsp'
                            + '<a href="https://twitter.com/' + obj[tweet]._source.user.screen_name 
                            + '/status/' +  obj[tweet]._source.id_str + '" target="_blank">t.co</a>'
                            + '</p>'
                        + '</div>'
                    + '</div>';
            if (obj[tweet]._source.user.location!=null && obj[tweet]._source.user.location!=undefined){
                //console.log("1");
                getcoordinates(obj[tweet]._source.user.location, res);
            }            
        }

        
    }).then( () => {return setTimeout(initMap, 4000);} )
    .catch(function(error) { console.log(error); });
}