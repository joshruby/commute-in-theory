from datetime import datetime
import pytz
from pymongo import MongoClient
import config

TZ_LA = pytz.timezone('America/Los_Angeles')
RECORDING_MINUTES = [0, 15, 30, 45]
MINUTE_THRESH = 7

client = MongoClient(config.MONGODB_URI)
db = client.get_database()
collection = db['commutes']

docs = collection.find({})

for doc in docs:
    # Make a date obj from the departureTime str
    departure_time = datetime.fromisoformat(doc['departureTime'])

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

    hour = departure_time.hour
    minute = departure_time.minute

    new_value = { 
        '$set': { 
            'departureTime': departure_time,
            'departureTimeLocalizedSimplified': {'hour': hour, 'minute': minute},
        } 
    }
    collection.update_one({'_id': doc['_id']}, new_value)
