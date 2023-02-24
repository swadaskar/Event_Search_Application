import requests
import json
from flask import Flask, request
from flask_cors import CORS
from geolib import geohash

app=Flask(__name__, static_url_path='/static/', static_folder='static/')
CORS(app)
baseAPIUrl = "https://app.ticketmaster.com/discovery/v2/"
apiKey = "Jdf4GP2674AxHAGBMLInCvwN6ZydDgZ5"

@app.route('/')
def index():
    return app.send_static_file("index.html")

# event search sample url
# https://app.ticketmaster.com/discovery/v2/events.json?apikey=Jdf4GP2674AxHAGBMLInCvwN6ZydDgZ5&keyword=Los+Angeles&segmentId=KZFzniwnSyZfZ7v7nE&radius=10&unit=miles&geoPoint=9q5cs

@app.route('/event/search', methods=['GET'])
def eventSearch():
    keyword = request.args.get('keyword')
    segmentID = request.args.get('segmentID')
    radius = request.args.get('radius')
    unit = request.args.get('unit')
    geoPoint = request.args.get('geoPoint').split(',')
    geoPoint = geohash.encode(geoPoint[0],geoPoint[1],7)
    print(keyword,segmentID,radius,unit,geoPoint)

    # keyword = 'Los Angeles'
    # segmentID = 'KZFzniwnSyZfZ7v7nE'
    # radius = '10'
    # unit = 'miles'
    # geoPoint = '9q5cs'

    params={
        'keyword':str(keyword),
        'segmentID': str(segmentID),
        'radius':str(radius),
        'unit': str(unit),
        'geoPoint': str(geoPoint),
        'apikey':str(apiKey)
    }
    # print(baseAPIUrl+'events.json')
    # print(params)
    response=requests.get(baseAPIUrl+'events.json',params=params)
    eventData=response.json()
    print("erfsedvsdfvsdfvsdfvdsfv", eventData)
    #### ------------Sample Data------------------ ####
    # response=requests.get("http://127.0.0.1:5000/sampleData")
    # eventData=response.json()
    #### ------------Remove when done------------------ ####

    # If there is error response
    if 'error' in eventData:
        return json.dumps([])

    searchData = []
    if '_embedded' not in eventData:
        return json.dumps(searchData, indent=4)

    for event in eventData['_embedded']['events']:
        date = event['dates']['start']['localDate']
        if 'localTime' in event['dates']['start']:
            date += ","+event['dates']['start']['localTime']
        if 'attractions' in event['_embedded']:
            searchData.append({
                'id': event['id'],
                'date': date,
                'icon': event['images'][0]['url'],
                'event': event['name'],
                'genre': event['_embedded']['attractions'][0]['classifications'][0]['segment']['name'] if 'attractions' in event['_embedded'] else "Undefined",
                'venue': event['_embedded']['venues'][0]['name']
            })
    return json.dumps(searchData, indent=4)


# event detail sample url
# https://app.ticketmaster.com/discovery/v2/events/G5eYZ98HCe8Sl.json?apikey=Jdf4GP2674AxHAGBMLInCvwN6ZydDgZ5

@app.route('/event/info', methods=['GET'])
def eventInfo():
    id = request.args.get('id')

    # id = 'G5eYZ98HCe8Sl'
    params = {
        'apikey': apiKey
    }
    response = requests.get(baseAPIUrl+'events/'+id+'.json', params=params)
    eventDetailsData=response.json()
    
    ### ------------Sample Data------------------ ####
    # response = requests.get("http://127.0.0.1:5000/sampleEventData")
    # eventDetailsData = response.json()
    ### ------------Remove when done------------------ ####

    # If there is error response
    if 'error' in eventDetailsData:
        return json.dumps([])

    date = eventDetailsData['dates']['start']['localDate']
    if 'localTime' in eventDetailsData['dates']['start']:
        date += "," + eventDetailsData['dates']['start']['localTime']
    artists = [[artist['name'],artist['url'] if 'url' in artist else ""] for artist in eventDetailsData['_embedded']['attractions']] if 'attractions' in eventDetailsData['_embedded'] else ""
    if 'attractions' in eventDetailsData['_embedded']:
        genres = [eventDetailsData['_embedded']['attractions'][0]['classifications'][0][Type]['name'] for Type in ['subGenre','genre','segment','subType','type'] if (Type in eventDetailsData['_embedded']['attractions'][0]['classifications'][0] and (eventDetailsData['_embedded']['attractions'][0]['classifications'][0][Type]['name'] != "undefined" and eventDetailsData['_embedded']['attractions'][0]['classifications'][0][Type]['name'] != "Undefined"))]
    else:
        genres = ""
    if genres == [] or "":
        genres = ""
    priceRange=""
    if 'priceRanges' in eventDetailsData:
        priceRange=str(eventDetailsData['priceRanges'][0]['min'])+'-'+str(eventDetailsData['priceRanges'][0]['max'])
    eventData = {
        'name': eventDetailsData['name'],
        'date': date,
        'artist': artists,
        'venue': eventDetailsData['_embedded']['venues'][0]['name'] if 'venues' in eventDetailsData['_embedded'] else "",
        'genre': " | ".join(genres),
        'priceRange': priceRange,
        'ticketStatus': eventDetailsData['dates']['status']['code'] if 'status' in eventDetailsData['dates'] else "",
        'buyAt': eventDetailsData['url'] if 'url' in eventDetailsData else "",
        'seatMap': eventDetailsData['seatmap']['staticUrl'] if 'seatmap' in eventDetailsData else ""
    }
    # print(eventDetailsData)
    return json.dumps(eventData, indent=4)


# venue detail sample url
# https://app.ticketmaster.com/discovery/v2/venues?apikey=Jdf4GP2674AxHAGBMLInCvwN6ZydDgZ5&keyword=Los%20Angeles%20Memorial%20Coliseum

@app.route('/venue/info', methods=['GET'])
def venueInfo():
    keyword = request.args.get('keyword')

    # keyword = 'Los Angeles Memorial Coliseum'
    params = {
        'apikey': apiKey,
        'keyword': keyword
    }
    response = requests.get(baseAPIUrl+'venues', params=params)
    venueDetailsData=response.json()
    
    ### ------------Sample Data------------------ ####
    # response = requests.get("http://127.0.0.1:5000/sampleVenueData")
    # venueDetailsData = response.json()
    ### ------------Remove when done------------------ ####

    # If there is error response
    if 'error' in venueDetailsData:
        return json.dumps([])

    if '_embedded' not in venueDetailsData:
        return json.dumps({"novenue":"0"}, indent=4)

    venueDetailsData=venueDetailsData['_embedded']['venues'][0]
    venueData={
        'name': venueDetailsData['name'],
        'address': venueDetailsData['address']['line1'] if 'address' in venueDetailsData else "",
        'city': venueDetailsData['city']['name']+', '+venueDetailsData['state']['stateCode'],
        'postcode': venueDetailsData['postalCode'] if 'postalCode' in venueDetailsData else "",
        'upcomingEvents': venueDetailsData['url'] if 'url' in venueDetailsData else "",
        'image' : venueDetailsData['images'][0]['url'] if 'images' in venueDetailsData else "NoImage"
        
    }
    return json.dumps(venueData, indent=4)

# @app.route('/sampleData')
# def sampleData():
#     with open('sampleData.json', 'r') as f:
#         return json.load(f)

# @app.route('/sampleEventData')
# def sampleEventData():
#     with open('sampleEventData.json', 'r') as f:
#         return json.load(f)
    
# @app.route('/sampleVenueData')
# def sampleVenueData():
#     with open('sampleVenueData.json', 'r') as f:
#         return json.load(f)
    
if __name__=='__main__':
    app.run(debug=True)