
let latlon = ''

// Current local backend server
const baseBackendURL = 'http://127.0.0.1:5000/'

// geooding api
const baseGeocodingURL = 'https://maps.googleapis.com/maps/api/geocode/json?address='
const geocodingAPIKey = 'AIzaSyADHRIj3MAMta84N8y0ZqEnNuiAQpZKJSQ'
// https://maps.googleapis.com/maps/api/geocode/json?address=University+of+Southern+California+CA&key=AIzaSyADHRIj3MAMta84N8y0ZqEnNuiAQpZKJSQ

// ipinfo api
const baseIPInfoURL = 'https://ipinfo.io/'
const IPInfoTokenKey = 'f9416a8146ee1d'

// https://ipinfo.io/68.181.16.82?token=f9416a8146ee1d

function autoLocate(checkBox){
    if(checkBox.checked == true){
        document.getElementById("location").disabled=true;
        document.getElementById("location").value = '';
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", baseIPInfoURL + '?token=' + IPInfoTokenKey, false);
        xhttp.send();
        jsonObject = JSON.parse(xhttp.responseText);
        latlon = jsonObject['loc']
    }
    else{
        document.getElementById("location").disabled = false;
        latlon = ''
    }
}

function getGeoHash(address) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", baseGeocodingURL + address + '&key=' + geocodingAPIKey, false);
    xhttp.send();
    jsonObject = JSON.parse(xhttp.responseText);
    return jsonObject.results[0].geometry.location.lat + ',' + jsonObject.results[0].geometry.location.lng;
}
//dddd
function searchEvents() {
    // collect the data

    var categories = {
        "default": "",
        "music": "KZFzniwnSyZfZ7v7nJ",
        "sports": "KZFzniwnSyZfZ7v7nE",
        "art": "KZFzniwnSyZfZ7v7na",
        "film": "KZFzniwnSyZfZ7v7nn",
        "miscellaneous": "KZFzniwnSyZfZ7v7n1"
    };

    keyword = document.getElementById("keyword").value;
    segmentID = categories[document.getElementById("category").value];
    radius = document.getElementById("distance").value;
    unit = "miles";
    if (document.getElementById("location").disabled == false){
        geoPoint = getGeoHash(document.getElementById("location").value);
    }else{
        geoPoint = latlon;
    }
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", baseBackendURL + `/event/search?keyword=${keyword}&segmentID=${segmentID}&radius=${radius}&unit=${unit}&geoPoint=${geoPoint}`,false);
    xhttp.send();
    
    jsonObject = JSON.parse(xhttp.responseText);
    console.log(jsonObject);

    // display the data
    makeTable(jsonObject);

    // Go to the Table
    document.getElementById("eventList").scrollIntoView();
}

function makeTable(jsonObject) {
    htmlText = '<table>'
    htmlText += '<th>Date</th>'
    htmlText += '<th>Icon</th>'
    htmlText += '<th>Event</th>'
    htmlText += '<th>Genre</th>'
    htmlText += '<th>Venue</th>'
    for (var i = 0; i < jsonObject.length; i++) {
        htmlText += '<tr>'
        htmlText += '<td>' + jsonObject[i]['date'] + '</td>'
        htmlText += '<td><img src="' + jsonObject[i]['icon'] + '" alt="icon" width="50" height="50"></td>'
        htmlText += '<td><a onclick=\"eventInfo(\''+jsonObject[i]['id']+'\')\">' + jsonObject[i]['event'] + '</a></td>'
        htmlText += '<td>' + jsonObject[i]['genre'] + '</td>'
        htmlText += '<td>' + jsonObject[i]['venue'] + '</td>'
        htmlText += '</tr>'
    }
    document.getElementById('eventList').innerHTML = htmlText
}

function eventInfo(id) {
    console.log("bereh")
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", baseBackendURL + `/event/info?id=${id}`, false);
    xhttp.send();
    jsonObject = JSON.parse(xhttp.responseText);
    console.log(jsonObject);

    // display the data
    makeEventInfo(jsonObject[0]);

    // Go to the Table
    document.getElementById("eventDetails").scrollIntoView();
}

function makeEventInfo(jsonObject) {
    htmlText = '<div class="heading">'+ jsonObject['artist'] + '</div>'
    htmlText += '<div class="textContent">'
    htmlText += '<div class="subheading">Date</div>'
    htmlText += '<div class="text">' + jsonObject['date'] + '</div>'
    htmlText += '<div class="subheading">Artist/Team</div>'
    htmlText += '<div class="text">' + jsonObject['artist'] + '</div>'
    htmlText += '<div class="subheading">Venue</div>'
    htmlText += '<div class="text">' + jsonObject['venue'] + '</div>'
    htmlText += '<div class="subheading">Genres</div>'
    htmlText += '<div class="text">' + jsonObject['genre'] + '</div>'
    if (jsonObject['priceRange'] != ""){
        htmlText += '<div class="subheading">Price Range</div>'
        htmlText += '<div class="text">' + jsonObject['priceRange'] + '</div>'
    }
    htmlText += '<div class="subheading">Ticket Status</div>'
    htmlText += '<div class="text">' + jsonObject['ticketStatus'] + '</div>'
    htmlText += '<div class="subheading">Buy Ticket At</div>'
    htmlText += '<div class="text">' + jsonObject['buyAt'] + '</div>'
    htmlText += '</div>'
    htmlText += '<div class="imageContent">'
    htmlText += '<img src="' + jsonObject['seatMap'] + '" alt="Seat Map" width="200" height="200">'
    htmlText += '</div>'

    document.getElementById('eventDetails').innerHTML = htmlText
    // <div class="heading">Artist</div>
    // <div class="textContent">
    //     <div class="subheading">Date</div>
    //     <div class="text"> adddate</div>
    //     <div class="subheading">Artist/Team</div></div>
    //     <div class="text"> addartist</div>
    //     <div class="subheading">Venue</div>
    //     <div class="text"> adddate</div>
    //     <div class="subheading">Genres</div>
    //     <div class="text"> adddate</div>
    //     <div class="subheading">Ticket Status</div>
    //     <div class="text"> adddate</div>
    //     <div class="subheading">Buy Ticket At</div>
    //     <div class="text"> adddate</div>
    // </div>
    // <div class="imageContent">
    //     <img src="https://aiia-web01.squiz.net/designs/css/design-images/mega-thumb.jpg" alt="image on mega menu">
    // </div>
}




function resetForm() {
    document.getElementById('eventList').innerHTML = '';
    document.getElementById('eventDetails').innerHTML = '';
    document.getElementById('venueDetails').innerHTML = '';
    document.getElementById('location').disabled = false;
}