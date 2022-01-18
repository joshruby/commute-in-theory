import logging
format = "%(levelname)s - %(asctime)s - %(message)s"
logging.basicConfig(
        filename='cit.log',
        filemode='w',
        format=format,
        level=logging.ERROR)
logger = logging.getLogger()
import time
from datetime import datetime
import pytz
import requests
from pymongo import MongoClient
import config

def recordCommute(commute_request):
    # Parse the request
    origin_id = commute_request['origin'][0]
    origin = commute_request['origin'][1]
    destination_id = commute_request['destination'][0]
    destination = commute_request['destination'][1]
    hour = commute_request['hour']
    minute = commute_request['minute']

    # Build the URL
    uri = f'https://api.tomtom.com/routing/1/calculateRoute/{origin["lat_lon"]}:{destination["lat_lon"]}/json'
    params = {
        'sectionType': 'traffic',
        'traffic': 'true',
        'travelMode': 'car',
        'vehicleCommercial': 'false',
        'vehicleEngineType': 'combustion',
        'report': 'effectiveSettings',
        'key': config.TOMTOM_KEY
    }

    # Call the API
    res = requests.get(uri, params=params)

    # Convert response to JSON
    res = res.json()
    summary = res['routes'][0]['summary']

    # Make a date obj from the departureTime str
    departure_time = datetime.fromisoformat(summary['departureTime'])

    # Round each recording to the intended recording time
    for minute in RECORDING_MINUTES:
        diff = abs(departure_time.minute - minute)
        if (diff <= MINUTE_THRESH):
            departure_time = departure_time.replace(minute=minute, second=0)
            break
        elif (diff >= 60 - MINUTE_THRESH):
            # E.g 07:54 should be set to 08:00, not 07:00
            departure_time = departure_time.replace(
                hour=departure_time.hour + 1,
                minute=minute, 
                second=0
            )
            break

    # Keep only the relevant information
    return {
        'origin': origin_id,
        'destination': destination_id,
        'departureTime': departure_time,
        'departureTimeLocalizedSimplified': {'hour': hour, 'minute': minute},
        'travelTimeInSeconds': summary['travelTimeInSeconds']
    }

def mongodbPOST(commute):
    client = MongoClient(config.MONGODB_URI)
    db = client.get_database()
    collection = db['commutes']

    # POST commute to db
    collection.insert_one(commute)

LOCATIONS = {
    'work': {
        'CUP': {
            'name': 'Cupertino, MA',
            'lat_lon': '37.330227595678146,-122.03281591229046'
        },
        'STA': {
            'name': 'Stanford, Roble Field',
            'lat_lon': '37.42666339942809,-122.17649144765893'
        },
    },
    'home': {
        'SCZ': {
            'name': 'Santa Cruz, Downtown',
            'lat_lon': '36.974797779340655,-122.0290861946705'
        },
  
        'CAM': {
            'name': 'Campbell, Downtown',
            'lat_lon': '37.28750197556045,-121.94487365182788'
        },
        'SCU': {
            'name': 'Santa Clara, SCU',
            'lat_lon': '37.34887015070597,-121.94401506069336'
        },
        'SJC': {
            'name': 'Santa Jose, Downtown',
            'lat_lon': '37.33481534485126,-121.88822099401446'
        },
        'SFP': {
            'name': 'San Francisco, Pacific Heights',
            'lat_lon': '37.79427344559132,-122.43493160658136'
        },
        
        'LGS': {
            'name': 'Los Gatos, Downtown',
            'lat_lon': '37.22473891235269,-121.98375589032867'
        },
        'MLP': {
            'name': 'Menlo Park, West MP',
            'lat_lon': '37.431029416205284,-122.20217060835637'
        },
        'BER': {
            'name': 'Berkeley, Downtown',
            'lat_lon': '37.87075376688075,-122.27199562287598'
        },
        'CPA': {
            'name': 'Capitola, Mall',
            'lat_lon': '36.97371780004841,-121.95931307716036'
        },
        'PCA': {
            'name': 'Pacifica, Linda Mar',
            'lat_lon': '37.594122784571354,-122.5015289019967'
        },
        # 'FEL': {
        #     'name': 'Felton, Downtown',
        #     'lat_lon': '37.05131035573837,-122.07406272553854'
        # },
        # 'WLG': {
        #     'name': 'Willow Glen, Doerr Park',
        #     'lat_lon': '37.2739703906996,-121.91368527984521'
        # },
        # 'SFM': {
        #     'name': 'San Francisco, Mission District',
        #     'lat_lon': '37.75870633260038,-122.41794365829263'
        # },
        # 'MTV': {
        #     'name': 'Mountain View, Shoreline',
        #     'lat_lon': '37.403712687363814,-122.07814772790742'
        # },
    }
}

TZ_LA = pytz.timezone('America/Los_Angeles')
RECORDING_MINUTES = [0, 15, 30, 45]
MINUTE_THRESH = 7

if __name__ == "__main__":
    while True:
        now_LA = datetime.now(TZ_LA)
        hour = now_LA.hour
        minute = now_LA.minute

        if 6 <= hour <= 20 and minute in RECORDING_MINUTES:
            for wkey, wval in LOCATIONS['work'].items():
                for hkey, hval in LOCATIONS['home'].items():
                    pairs = [
                        ((hkey, hval), (wkey, wval)), 
                        ((wkey, wval), (hkey, hval))
                    ]

                    for p in pairs:
                        try:
                            # Retreive the commute info
                            commute = recordCommute(
                                {
                                    'origin': p[0],
                                    'destination': p[1],
                                    'hour': hour,
                                    'minute': minute
                                }
                            )

                            # Save the commute in mongodb
                            mongodbPOST(commute)

                            # Can't exceed 5 QPS for the TomTom Routing API
                            # https://developer.tomtom.com/default-qps
                            time.sleep(0.5)
                        except Exception as e:
                            logging.error(repr(e))
                            continue

            # Ensure another set of recordings doesn't immediately run 
            time.sleep(60)
        