import json
import os
from datetime import datetime, timedelta
import pytz
from pymongo import MongoClient
import pandas as pd
from constants import WEEKDAYS

client = MongoClient(os.environ.get('MONGODB_URI'))

def compute_stats(pair):
    collection = client['commute-in-theory-mongodb']['commutes']

    origin = pair['origin']
    destination = pair['destination']
    locality = pair['locality']

    docs = list(collection.find(
        {
            'departureTime': {'$gte': datetime.now() + timedelta(days=-365)},
            'origin': origin,
            'destination': destination
        },
        {
            '_id': 0,
            'origin': 1,
            'destination': 1,
            'departureTime': 1,
            'travelTimeInSeconds': 1
        }
    ))
    print(f'Number of docs received: {len(docs)}')

    for doc in docs:
        # Flatten the nested "departureTimeLocalizedSimplified" obj field
        doc['departureHour'] = \
            pytz.timezone('America/Los_Angeles').fromutc(doc['departureTime']).hour
        doc['departureMinute'] = \
            pytz.timezone('America/Los_Angeles').fromutc(doc['departureTime']).minute

        # Add a column for the day of the week
        doc['departureWeekday'] = pytz.timezone('America/Los_Angeles').fromutc(doc['departureTime']).weekday()

    # Create a df with the docs
    df = pd.DataFrame(docs)

    # Note the time of computation
    computed_at = datetime.now()
    computed_at = computed_at.replace(
        hour=0,
        minute=0,
        second=0,
        microsecond=0
    )

    if df.empty:
        print(f'Empty DF: {origin}, {destination}')
        return {
            'statusCode': 200,
            'body': json.dumps('')
        }

    summaries = []
    for hour in df['departureHour'].unique():
        for minute in df['departureMinute'].unique():
            stats_by_weekday = {}
            # Filter the df
            for day_num, day_name in enumerate(WEEKDAYS):
                # Each weekday individually
                if day_num <= 6:
                    route_df = df.loc[
                        (df['origin']==origin) & 
                        (df['destination']==destination) &
                        (df['departureWeekday']==day_num) &
                        (df['departureHour']==hour) & 
                        (df['departureMinute']==minute)
                    ]
                # Business days
                elif day_num == 7:
                    route_df = df.loc[
                        (df['origin']==origin) & 
                        (df['destination']==destination) &
                        (df['departureWeekday'].isin([0, 1, 2, 3, 4])) &
                        (df['departureHour']==hour) & 
                        (df['departureMinute']==minute)
                    ]
                # Weekends
                elif day_num == 8:
                    route_df = df.loc[
                        (df['origin']==origin) & 
                        (df['destination']==destination) &
                        (df['departureWeekday'].isin([5, 6])) &
                        (df['departureHour']==hour) & 
                        (df['departureMinute']==minute)
                    ]
                # All weekdays together
                elif day_num == 9:
                    route_df = df.loc[
                        (df['origin']==origin) & 
                        (df['destination']==destination) &
                        (df['departureHour']==hour) & 
                        (df['departureMinute']==minute)
                    ]

                if not route_df.empty:
                    quantiles = route_df['travelTimeInSeconds'].quantile(
                        [0.1, 0.25, 0.5, 0.75, 0.9]
                    )

                    stats_by_weekday[day_name] = {
                        'count': int(route_df['travelTimeInSeconds'].count()),
                        'min': int(route_df['travelTimeInSeconds'].min()),
                        'max': int(route_df['travelTimeInSeconds'].max()),
                        'mean': int(route_df['travelTimeInSeconds'].mean()),
                        'quantiles': {
                            '10': int(quantiles[0.10]),
                            '25': int(quantiles[0.25]),
                            '50': int(quantiles[0.50]),
                            '75': int(quantiles[0.75]),
                            '90': int(quantiles[0.90]),
                        }
                    }

            if stats_by_weekday:
                # Append the completed summary to the list of summaries
                summaries.append({
                    'computedAt': computed_at,
                    'origin': origin,
                    'destination': destination,
                    'locality': locality,
                    'departureHour': int(hour),
                    'departureMinute': int(minute),
                    'statsByWeekdayInSeconds': stats_by_weekday
                })

    # Change to the stats collection
    collection = client['commute-in-theory-mongodb']['commute_stats']

    if summaries:
        collection.insert_many(summaries)

    # Delete documents older than 1 day
    collection.delete_many(
        {
            'computedAt': {'$lt': datetime.now() + timedelta(days=-1)}
        },
    )

def lambda_handler(event, context):
    for message in event['Records']:
        pair = message['body']
        if isinstance(pair, str):
            pair = json.loads(pair)
        
        print(f'pair: {pair}')
        compute_stats(pair)

    return {
        'statusCode': 200,
        'body': json.dumps('')
    }
