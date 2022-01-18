import json
from datetime import datetime
from pymongo import MongoClient
import config

client = MongoClient(config.MONGODB_URI)
db = client.get_database()
collection = db['commutes']

docs = [doc for doc in collection.find({}).limit(35000)]
for doc in docs:
    # Convert the id and departureTime to strings, so they can be serialized
    doc['_id'] = str(doc['_id'])
    doc['departureTime'] = doc['departureTime'].isoformat()

commutes = {
    'saveTime': datetime.now().isoformat(),
    'commutes': docs
}

with open('commutes.json', 'w') as f:
    json.dump(commutes, f)