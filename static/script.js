
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
        document.getElementById("location").style.display="none";
        document.getElementById("location").value = '';
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", baseIPInfoURL + '?token=' + IPInfoTokenKey, false);
        xhttp.send();
        jsonObject = JSON.parse(xhttp.responseText);
        latlon = jsonObject['loc']
    }
    else{
        document.getElementById("location").style.display = "inline";
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
    if (document.getElementById("location").style.display == "none"){
        geoPoint = latlon;
    }else{
        geoPoint = getGeoHash(document.getElementById("location").value);
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
    htmlText = '<table id="eventTable" class="eventTable">'
    htmlText += '<tr>'
    htmlText += '<th style="width:12%;">Date</th>'
    htmlText += '<th style="width:12%;">Icon</th>'
    htmlText += '<th style="width:50%;" onclick="sortTable(2)"><a>Event</a></th>'
    htmlText += '<th style="width:9%;" onclick="sortTable(3)"><a>Genre</a></th>'
    htmlText += '<th style="width:17%;" onclick="sortTable(4)"><a>Venue</a></th>'
    htmlText += '</tr>'
    for (var i = 0; i < jsonObject.length && i<20 ; i++) {
        let [date,time] = jsonObject[i]['date'].split(",")
        htmlText += '<tr>'
        htmlText += '<td>' + date+ '<span style="display:block;">'+time+'</span></td>'
        htmlText += '<td><img src="' + jsonObject[i]['icon'] + '" alt="icon" width="50" height="50"></td>'
        htmlText += '<td onclick=\"eventInfo(\'' + jsonObject[i]['id'] +'\')\"><a>' + jsonObject[i]['event'] + '</a></td>'
        htmlText += '<td>' + jsonObject[i]['genre'] + '</td>'
        htmlText += '<td>' + jsonObject[i]['venue'] + '</td>'
        htmlText += '</tr>'
    }
    htmlText += '</table>'
    document.getElementById('eventList').innerHTML = htmlText
}

// According to the piazza post @195, we can use the following code to sort the table
// The code for the following sorting function has been credited to https://codepen.io/andrese52/pen/ZJENqp

function sortTable(n) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById("eventTable");
    switching = true;
    dir = "asc";
    /* Make a loop that will continue until
    no switching has been done: */
    while (switching) {
        // Start by saying: no switching is done:
        switching = false;
        rows = table.rows;
        /* Loop through all table rows (except the
        first, which contains table headers): */
        for (i = 1; i < (rows.length - 1); i++) {
            // Start by saying there should be no switching:
            shouldSwitch = false;
            /* Get the two elements you want to compare,
            one from current row and one from the next: */
            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];
            /* Check if the two rows should switch place,
            based on the direction, asc or desc: */
            if (dir == "asc") {
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                    // If so, mark as a switch and break the loop:
                    shouldSwitch = true;
                    break;
                }
            } else if (dir == "desc") {
                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                    // If so, mark as a switch and break the loop:
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            /* If a switch has been marked, make the switch
            and mark that a switch has been done: */
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            // Each time a switch is done, increase this count by 1:
            switchcount ++;
        } else {
            /* If no switching has been done AND the direction is "asc",
            set the direction to "desc" and run the while loop again. */
            if (switchcount == 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
}

function eventInfo(id) {
    console.log("Inside eventInfo")
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", baseBackendURL + `/event/info?id=${id}`, false);
    xhttp.send();
    jsonObject = JSON.parse(xhttp.responseText);
    console.log(jsonObject);

    // display the data
    makeEventInfo(jsonObject);

    // Go to the Table
    document.getElementById("eventDetails").scrollIntoView();
}

function makeEventInfo(jsonObject) {
    let [date,time] = jsonObject['date'].split(",")
    htmlText = '<div class="eventInfo">'
    htmlText += '<div class="heading">'
    htmlText += jsonObject['artist'][0][0]
    for (var i = 1; i < jsonObject['artist'].length; i++) {
        htmlText += ' vs. ' + jsonObject['artist'][i][0]
    }
    htmlText += '</div>'
    htmlText += '<table><tr><td>'
    htmlText += '<div class="textContent">'
    htmlText += '<div class="subheading">Date</div>'
    htmlText += '<div class="text">'+date+' '+time+'</div>'
    htmlText += '<div class="subheading">Artist/Team</div>'
    htmlText += '<div class="text"><a href="' + jsonObject['artist'][0][1] + '" target="_blank">' + jsonObject['artist'][0][0] + '</a>'
    for (var i = 1; i < jsonObject['artist'].length; i++) {
        htmlText += ' | <a href="' + jsonObject['artist'][i][1] +'" target="_blank">' + jsonObject['artist'][i][0] + '</a>'
    }
    htmlText += '</div>'
    htmlText += '<div class="subheading">Venue</div>'
    htmlText += '<div class="text">' + jsonObject['venue'] + '</div>'
    htmlText += '<div class="subheading">Genres</div>'
    htmlText += '<div class="text">' + jsonObject['genre'] + '</div>'
    if (jsonObject['priceRange'] != ""){
        htmlText += '<div class="subheading">Price Range</div>'
        htmlText += '<div class="text">' + jsonObject['priceRange'] + ' USD</div>'
    }
    htmlText += '<div class="subheading">Ticket Status</div>'
    htmlText += '<div class="text">' + jsonObject['ticketStatus'] + '</div>'
    htmlText += '<div class="subheading">Buy Ticket At</div>'
    htmlText += '<div class="text"><a href="' + jsonObject['buyAt'] +'" target="_blank">Ticketmaster</a></div>'
    htmlText += '</div></td><td>'
    htmlText += '<div class="imageContent">'
    htmlText += '<img src="' + jsonObject['seatMap'] + '" alt="Seat Map">'
    htmlText += '</div></td></tr></table>'
    htmlText += '</div>'
    htmlText += '<div class="arrowVenue">'
    htmlText += '<a onclick="venueInfo(\'' + jsonObject['venue'] + '\')">'
    htmlText += 'Show Venue Details'
    htmlText += '<p>Logo Down Arrow</p>'
    htmlText += '</a>'
    htmlText += '</div>'
    document.getElementById('eventDetails').innerHTML = htmlText
}

function venueInfo(venue) {
    console.log("Inside venueInfo")
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", baseBackendURL + `/venue/info?keyword=${venue}`, false);
    xhttp.send();
    jsonObject = JSON.parse(xhttp.responseText);
    console.log(jsonObject);

    // display the data
    makeVenueInfo(jsonObject);

    // Go to the venue card
    document.getElementById("venueDetails").scrollIntoView();
}

function makeVenueInfo(jsonObject) {
    vname= jsonObject['name'].split(" ").join("+")
    address= jsonObject['address'].split(" ").join("+")
    let [city,stateCode] = jsonObject['city'].split(", ")
    query = vname + '%2C+' + address + '%2C+' + city + '%2C+' + stateCode + '%2C+'+jsonObject['postcode']
    htmltext = `<div class="venueInfo">
                    <div class="heading">${jsonObject['name']}</div>
                    <div class="textContent">
                        <table>
                            <tr>
                                <td>
                                    <table>
                                        <tr>
                                            <td>Address:</td>
                                            <td>
                                                <div>${jsonObject['address']}</div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td></td>
                                            <td><div>${jsonObject['city']}</div></td>
                                        </tr>
                                        <tr>
                                            <td></td>
                                            <td><div>${jsonObject['postcode']}</div></td>
                                        </tr>
                                    </table>
                                    <a href="http://maps.google.com/maps/search/?api=1&query=${query}}">Open in Google Maps</a>
                                </td>
                                <td><a href="${jsonObject['upcomingEvents']}">More events at this venue:</a></td>
                            </tr>
                        </table>
                    </div>
                </div>`
    document.getElementById('venueDetails').innerHTML = htmltext
}

    {/* https://www.google.com/maps/search/?api=1&query=centurylink+field */}

function resetForm() {
    document.getElementById('eventList').innerHTML = '';
    document.getElementById('eventDetails').innerHTML = '';
    document.getElementById('venueDetails').innerHTML = '';
    document.getElementById('location').disabled = false;
}