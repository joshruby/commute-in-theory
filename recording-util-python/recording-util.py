import time
from itertools import permutations
import requests
from pymongo import MongoClient
import config

def recordCommute(commute_request):
    # Build the URL
    uri = f'https://api.tomtom.com/routing/1/calculateRoute/{commute_request["origin"]["lat_lon"]}:{commute_request["destination"]["lat_lon"]}/json'
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

    # Keep only the relevant information
    return {
        'origin': commute_request['origin'],
        'destination': commute_request['destination'],
        'departureTime': res['routes'][0]['summary']['departureTime'],
        'travelTimeInSeconds': res['routes'][0]['summary']['travelTimeInSeconds']
    }

def mongodbPOST(commute):
    client = MongoClient(config.MONGODB_URI)
    db = client.get_database()
    collection = db['commutes']

    # POST commute to db
    collection.insert_one(commute)

LOCATIONS = {
    'MTV': {
        'name': 'Mountain View',
        'lat_lon': '37.403712687363814,-122.07814772790742'
    },
    'SCZ': {
        'name': 'Santa Cruz, Downtown',
        'lat_lon': '36.974797779340655,-122.0290861946705'
    },
    'CUP': {
        'name': 'Cupertino',
        'lat_lon': '37.330227595678146,-122.03281591229046'
    },
    'STA': {
        'name': 'Stanford',
        'lat_lon': '37.42666339942809,-122.17649144765893'
    },
}

if __name__ == "__main__":
    # Generate commute request pairs
    pairs = list(permutations(LOCATIONS, 2))

    for origin, destination in pairs:
        # Retreive the commute info
        commute = recordCommute(
            {
                'origin': LOCATIONS[origin],
                'destination': LOCATIONS[destination]
            }
        )

        # Save the commute in mongodb
        mongodbPOST(commute)

    time.sleep(10 * 60)