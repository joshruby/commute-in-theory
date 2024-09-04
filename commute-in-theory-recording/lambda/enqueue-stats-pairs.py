import json
import boto3
from constants import LOCATIONS

def lambda_handler(event, context):
    sqs = boto3.client('sqs')
    sqs_url = 'https://sqs.us-west-2.amazonaws.com/151062597311/commute-stats-queue'

    for locality in LOCATIONS:
        for work in LOCATIONS[locality]['work']:
            for home in LOCATIONS[locality]['home']:
                sqs.send_message(
                    QueueUrl=sqs_url,
                    MessageBody=json.dumps({
                        'origin': home,
                        'destination': work,
                        'locality': locality,
                    })
                )
                sqs.send_message(
                    QueueUrl=sqs_url,
                    MessageBody=json.dumps({
                        'origin': work,
                        'destination': home,
                        'locality': locality,
                    })
                )

    return {
        'statusCode': 200,
        'body': json.dumps('')
    }