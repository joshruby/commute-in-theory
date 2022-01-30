import clientPromise from '$lib/db'
import { ObjectId } from 'mongodb'

// https://stackoverflow.com/questions/31826760/how-to-get-data-in-batches-in-mongodb
export async function post(request) {
    try {
        // Parse the request
        const body = JSON.parse(request.body);
        const origin = body.origin;
        const destination = body.destination;
        const pageSize = body.pageSize;
        const lowerDateLimit = new Date(body.lowerDateLimit);
        let lastSeenDepartureTime = new Date(body.lastSeenDepartureTime);
       
        // Connect to the db
        const connectedClient = await clientPromise;
        const db = connectedClient.db();
        const collection = db.collection('commutes');

        // Query the db
        let commutes = [];
        commutes = await collection
            .find({
                "departureTime": { 
                    "$gte": lowerDateLimit,
                    "$lt": lastSeenDepartureTime 
                },
                origin: origin,
                destination: destination 
            })
            .sort({ "departureTime": -1 })
            .limit(pageSize)
            .toArray()

        // Update lastSeenId to the last document's departure time
        lastSeenDepartureTime = commutes[commutes.length - 1].departureTime

        return {
            status: 200,
            body: {
                commutes,
                lastSeenDepartureTime
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