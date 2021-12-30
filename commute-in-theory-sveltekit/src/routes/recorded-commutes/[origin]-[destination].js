// TODO
// - Figure out how to get around the 10k limit


import clientPromise from '$lib/db'
import { TopologyDescription } from 'mongodb';

export async function get({ params }) {
    try {
        // Connect to the db
        const connectedClient = await clientPromise;
        const db = connectedClient.db();
        const collection = db.collection('commutes');

        // Query for documents that match the provided 
        // origin and destination
        const query = { 
            origin: params.origin, 
            destination: params.destination 
        };

        // Retrieve the documents and put them into an array
        const commutes = await collection.find(query).limit(10000).toArray();

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
                error: 'GET count server error'
            }
        }
    }
}