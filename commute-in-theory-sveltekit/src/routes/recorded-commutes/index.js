import clientPromise from '$lib/db'
import { ObjectId } from 'mongodb'

export async function get() {
    try {
        // Connect to the db
        const connectedClient = await clientPromise;
        const db = connectedClient.db();
        const collection = db.collection('commutes');

        // Retrieve db items and put into an array
        const commutes = await collection.find().limit(2000).toArray();

        return {
            status: 200,
            body: {
                commutes
            }
        }
    } catch(err) {
        return {
            status: 500,
            body: {
                error: 'GET server error'
            }
        }
    }
}

export async function post(request) {
    try {
        // Parse the request
        const commute = JSON.parse(request.body);

        // Connect to the db
        const connectedClient = await clientPromise;
        const db = connectedClient.db();
        const collection = db.collection('commutes');

        // POST the new item
        await collection.insertOne(commute)

        return {
            status: 200,
            body: {
                status: 'Successful POST'
            }
        }
    } catch(err) {
        return {
            status: 500,
            body: {
                error: 'POST server error'
            }
        }
    }
}