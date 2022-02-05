import clientPromise from '$lib/db'
import { ObjectId } from 'mongodb'

// https://stackoverflow.com/questions/31826760/how-to-get-data-in-batches-in-mongodb
export async function post(request) {
    try {
        // Parse the request
        const body = JSON.parse(request.body);
        const origin = body.origin;
        const destination = body.destination;
        const lowerDateLimit = new Date(body.lowerDateLimit);
        const upperDateLimit = new Date(body.upperDateLimit);

        // Connect to the db
        const connectedClient = await clientPromise;
        const db = connectedClient.db();
        const collection = db.collection('commute_stats');
        
        // Define the query
        const query = {
            "computedAt": { 
                "$gte": lowerDateLimit,
                "$lt": upperDateLimit 
            },
            origin: origin,
            destination: destination
        }

        // Project the returned fields to ensure the query is covered
        const projection = {
            computedAt: 1,
            origin: 1,
            destination: 1,
            departureHour: 1,
            departureMinute: 1,
            statsByWeekday: 1
        }

        // Sort the documents prior to returning them
        const sorting = {
            departureHour: 1,
            departureMinute: 1
        }

        // Query the db
        const stats = await collection
            .find(query, projection)
            .sort(sorting)
            .toArray()

        return {
            status: 200,
            body: {
                stats
            }
        }
    } catch(err) {
        return {
            status: 500,
            body: {
                error: new Error(err)
            }
        }
    }
}