import config
from pymongo import MongoClient

client = MongoClient(config.MONGODB_URI)
db = client.get_database()
collection = db['commutes']

# cursor = collection.find(
#     {
#         'origin': 'CUP',
#         'destination': 'SCZ',
#         'departureTimeLocalizedSimplified.hour': 8,
#         'departureTimeLocalizedSimplified.minute': 30,
#     }
# ).explain()

pipeline = [
    {
        '$match': {
            'origin': 'SCZ',
            'destination': 'CUP',
            'departureTimeLocalizedSimplified.hour': 8,
            'departureTimeLocalizedSimplified.minute': 30
        }
    }, 
    {
        '$group': {
            '_id': 'avgTravelTimeInSeconds',
            'avg': {
                '$avg': '$travelTimeInSeconds'
            }
        }
    }
]

# res = collection.aggregate(pipeline)
res = db.command(
    'explain',
    {
        'aggregate': 'commutes',
        'pipeline': pipeline,
        'cursor': {}
    },
    verbosity='executionStats'
)
