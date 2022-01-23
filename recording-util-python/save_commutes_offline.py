import json
from datetime import datetime
import pytz
from pymongo import MongoClient
import config

client = MongoClient(config.MONGODB_URI)
db = client.get_database()
collection = db['commutes']

docs = list(collection.find({}).limit(80000))
for doc in docs:
    # Convert the id and departureTime to strings, so they can be serialized
    doc['_id'] = str(doc['_id'])
    doc['departureTime'] = pytz.utc.localize(doc['departureTime']).isoformat()

commutes = {
    'saveTime': datetime.now().isoformat(),
    'commutes': docs
}

with open('commutes.json', 'w', encoding='utf-8') as f:
    json.dump(commutes, f)
