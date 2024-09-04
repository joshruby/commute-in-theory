
import json
import os
import time
from datetime import datetime
import pytz
import requests
from pymongo import MongoClient
from constants import LOCATIONS, RECORDING_MINUTES, MINUTE_THRESH

client = MongoClient(os.environ.get('MONGODB_URI'))

def recordCommute(request):
    # Parse the request
    origin_id = request['origin'][0]
    origin = request['origin'][1]
    destination_id = request['destination'][0]
    destination = request['destination'][1]
    locality = request['locality']
    hour = request['hour']
    minute = request['minute']

    # Build the URL
    uri = f'https://api.tomtom.com/routing/1/calculateRoute/{origin["lat_lon"]}:{destination["lat_lon"]}/json'
    params = {
        'sectionType': 'traffic',
        'traffic': 'true',
        'travelMode': 'car',
        'vehicleCommercial': 'false',
        'vehicleEngineType': 'combustion',
        'report': 'effectiveSettings',
        'key': os.environ.get('TOMTOM_KEY')
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
        'locality': locality,
        'departureTime': departure_time,
        'departureTimeLocalizedSimplified': {'hour': hour, 'minute': minute},
        'travelTimeInSeconds': summary['travelTimeInSeconds']
    }

def recordCommutes(client, db, collection):
    collection = client[db][collection]

    now_LA = datetime.now(pytz.timezone('America/Los_Angeles'))
    hour = now_LA.hour
    minute = now_LA.minute

    requests = []
    for locality in LOCATIONS.keys():
        for wkey, wval in LOCATIONS[locality]['work'].items():
            for hkey, hval in LOCATIONS[locality]['home'].items():
                requests.append({
                    'origin': (hkey, hval),
                    'destination': (wkey, wval),
                    'locality': locality,
                    'hour': hour,
                    'minute': minute
                })
                requests.append({
                    'origin': (wkey, wval),
                    'destination': (hkey, hval),
                    'locality': locality,
                    'hour': hour,
                    'minute': minute
                })

    for request in requests:
        try:
            # Retreive the commute info
            commute = recordCommute(request)

            # POST the commute to mongodb
            collection.insert_one(commute)

            # Can't exceed 5 QPS for the TomTom Routing API
            # https://developer.tomtom.com/default-qps
            time.sleep(0.25)
        # Pass and log any exception
        except Exception as e:
            print(e)
            continue

def lambda_handler(event, context):
    recordCommutes(client, 'commute-in-theory-mongodb', 'commutes')
    
    return {
        'statusCode': 200,
        'body': json.dumps('')
    }
