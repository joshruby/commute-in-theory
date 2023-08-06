import clientPromise from '$lib/dbConnection'
import { json } from '@sveltejs/kit';

export async function getCount(collectionName: string) {
    try {
        // Connect to the db
        const connectedClient = await clientPromise;
        const db = connectedClient.db();
        const collection = db.collection(collectionName);

        // Estimate the total number of documents in the collection
        const countEstimate = await collection.estimatedDocumentCount();

        return json({ countEstimate }, { status: 201 });
    } catch(err) {
        return json(null, { status: 500 });
    }
}

// https://stackoverflow.com/questions/31826760/how-to-get-data-in-batches-in-mongodb
export async function getStats() {
    try {
        // Connect to the db
        const connectedClient = await clientPromise;
        const db = connectedClient.db();
        const collection = db.collection('commute_stats');

        // Query the most recent last computedAt datetime
        // Define the query
        let query = {};
        // Project the returned fields to ensure the query is covered
        let projection = { computedAt: 1, _id: 0 };
        // Sort the documents prior to returning them (last first)
        let sorting = { computedAt: -1 };
        // Query the db
        const res = await collection
            .find(query)
            .project(projection)
            .sort(sorting)
            .limit(1)
            .toArray()
        const lastComputedAt = res[0].computedAt

        // Query all of the stats computed at the most recent datetime
        // Define the query
        query = { "computedAt": lastComputedAt }

        // Project the fields to ensure the query is covered by an index
        projection = {
            computedAt: 1,
            origin: 1,
            destination: 1,
            departureHour: 1,
            departureMinute: 1,
            statsByWeekdayInSeconds: 1
        }

        // Sort the documents prior to returning them
        sorting = {
            departureHour: 1,
            departureMinute: 1
        }

        // Query the db
        const stats = await collection
            .find(query)
            .project(projection)
            .sort(sorting)
            .toArray()

        return json({ stats }, { status: 201 });
    } catch(err) {
        return json(null, { status: 500 });
    }
}