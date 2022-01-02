import clientPromise from '$lib/db'
import { ObjectId } from 'mongodb'

// https://stackoverflow.com/questions/31826760/how-to-get-data-in-batches-in-mongodb
export async function post(request) {
    try {
        // Parse the request
        const body = JSON.parse(request.body);
        const pageSize = body.pageSize;
        let lastSeenId = body.lastSeenId;
        
        // Connect to the db
        const connectedClient = await clientPromise;
        const db = connectedClient.db();
        const collection = db.collection('commutes');

        let commutes = [];
        if (lastSeenId) {
            // If a non-null lastSeenId str was passed in the request
            // convert it into a mongodb ObjectId
            lastSeenId = new ObjectId(lastSeenId)

            // Fetch from the last seen commute
            commutes = await collection
                .find({ "_id": { "$gt": lastSeenId } })
                .sort({"_id": 1 })
                .limit(pageSize)
                .toArray()

                // .find({ "_id": { "$gt": lastSeenId } })
            
        } else {
            // Fetch from the beginning
            commutes = await collection.find()
                .sort({ "_id": 1 })
                .limit(pageSize)
                .toArray()
        }
            
        // Update lastSeenId to the last document's id
        lastSeenId = commutes[commutes.length - 1]._id

        return {
            status: 200,
            body: {
                commutes,
                lastSeenId
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