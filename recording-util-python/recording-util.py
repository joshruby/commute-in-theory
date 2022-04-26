
import time
from datetime import datetime
import logging
import pytz
import requests
from pymongo import MongoClient
import config
import pandas as pd

FORMAT = "%(levelname)s - %(asctime)s - %(message)s"
logging.basicConfig(
        filename='cit.log',
        filemode='w',
        format=FORMAT,
        level=logging.ERROR)
LOGGER = logging.getLogger()

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

def connect_to_db(collection):
    client = MongoClient(config.MONGODB_URI)
    db = client.get_database()

    return db[collection]

def compute_summary_stats(collection):
    collection = connect_to_db(collection)

    # Query the documents recorded in the last n months
    limit_month = datetime.now().month - 3
    limit_year = datetime.now().year
    # Handle wrapping around from Jan to the previous year
    if limit_month < 1:
        # E.g. is limit_month == -1 it should be redefined as 11
        limit_month = 12 + limit_month
        # Roll back the year
        limit_year = limit_year - 1
    limit_date = datetime.now().replace(year=limit_year, month=limit_month)
    docs = list(collection.find(
        {
            'departureTime': {'$gte': limit_date}
        },
        {
            '_id': 0,
            'origin': 1,
            'destination': 1,
            'departureTime': 1,
            'travelTimeInSeconds': 1
        }
    ))

    for doc in docs:
        # Flatten the nested "departureTimeLocalizedSimplified" obj field
        doc['departureHour'] = \
            TZ_LA.fromutc(doc['departureTime']).hour
        doc['departureMinute'] = \
            TZ_LA.fromutc(doc['departureTime']).minute

        # Add a column for the day of the week
        doc['departureWeekday'] = TZ_LA.fromutc(doc['departureTime']).weekday()

    # Create a df with the docs
    df = pd.DataFrame(docs)

    # Sort the df by the origin and destination
    df = df.sort_values(by=['origin', 'destination'])

    # Note the time of computation
    computed_at = datetime.now()
    computed_at = computed_at.replace(
        hour=0,
        minute=0,
        second=0,
        microsecond=0
    )

    summaries = []
    for work in LOCATIONS['work'].keys():
        if work in df['origin'].unique() and work in df['destination'].unique():
            for home in LOCATIONS['home'].keys():
                if home in df['origin'].unique() and home in df['destination'].unique():
                    pairs = [(work, home), (home, work)]  

                    for p in pairs:
                        for hour in df['departureHour'].unique():
                            for minute in df['departureMinute'].unique():
                                stats_by_weekday = {}
                                # Filter the df
                                for day_num, day_name in enumerate(WEEKDAYS):
                                    # Each weekday individually
                                    if day_num <= 6:
                                        route_df = df.loc[
                                            (df['origin']==p[0]) & 
                                            (df['destination']==p[1]) &
                                            (df['departureWeekday']==day_num) &
                                            (df['departureHour']==hour) & 
                                            (df['departureMinute']==minute)
                                        ]
                                    # Business days
                                    elif day_num == 7:
                                        route_df = df.loc[
                                            (df['origin']==p[0]) & 
                                            (df['destination']==p[1]) &
                                            (df['departureWeekday'].isin([0, 1, 2, 3, 4])) &
                                            (df['departureHour']==hour) & 
                                            (df['departureMinute']==minute)
                                        ]
                                    # Weekends
                                    elif day_num == 8:
                                        route_df = df.loc[
                                            (df['origin']==p[0]) & 
                                            (df['destination']==p[1]) &
                                            (df['departureWeekday'].isin([5, 6])) &
                                            (df['departureHour']==hour) & 
                                            (df['departureMinute']==minute)
                                        ]
                                    # All weekdays together
                                    elif day_num == 9:
                                        route_df = df.loc[
                                            (df['origin']==p[0]) & 
                                            (df['destination']==p[1]) &
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
                                        'origin': p[0],
                                        'destination': p[1],
                                        'departureHour': int(hour),
                                        'departureMinute': int(minute),
                                        'statsByWeekdayInSeconds': stats_by_weekday
                                    })

    return summaries

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
        'OAK': {
            'name': 'Oakland, West',
            'lat_lon': '37.812088988762454,-122.29942506950347'
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
        'RWC': {
            'name': 'Redwood City, Oxford',
            'lat_lon': '37.46947269135535,-122.2284655255091'
        },
        'CPA': {
            'name': 'Capitola, Mall',
            'lat_lon': '36.97371780004841,-121.95931307716036'
        },
        'PCA': {
            'name': 'Pacifica, Linda Mar',
            'lat_lon': '37.594122784571354,-122.5015289019967'
        },
        # 'BER': {
        #     'name': 'Berkeley, Downtown',
        #     'lat_lon': '37.87075376688075,-122.27199562287598'
        # },
        # 'SCU': {
        #     'name': 'Santa Clara, SCU',
        #     'lat_lon': '37.34887015070597,-121.94401506069336'
        # },
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
WEEKDAYS = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
    'Business',
    'Weekend',
    'All'
]

if __name__ == "__main__":
    while True:
        now_LA = datetime.now(TZ_LA)
        weekday = now_LA.weekday()
        hour = now_LA.hour
        minute = now_LA.minute

        if 6 <= hour <= 20 and minute in RECORDING_MINUTES:
            collection = connect_to_db(collection='commutes')

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

                            # POST the commute to mongodb
                            collection.insert_one(commute)

                            # Can't exceed 5 QPS for the TomTom Routing API
                            # https://developer.tomtom.com/default-qps
                            time.sleep(0.5)
                        # Pass and log any exception
                        except Exception as e:
                            logging.error(repr(e))
                            continue

            # Ensure another set of recordings doesn't immediately run
            time.sleep(60)

        # Summarize the recorded commutes once weekly
        if weekday == 0 and hour == 0 and minute == 0:
            try:
                # Summarize the commutes
                summaries = compute_summary_stats('commutes')

                # POST the summaries to the db if any summaries are returned
                if summaries:
                    collection = connect_to_db('commute_stats')
                    # Delete the previous statistics
                    collection.drop()
                    # Insert the new statistics
                    collection.insert_many(summaries)

                # Ensure this block only runs once
                time.sleep(60)
            # Pass and log any exception
            except Exception as e:
                logging.error(repr(e))
                continue
