import clientPromise from '$lib/db'

export async function get() {
    try {
        // Connect to the db
        const connectedClient = await clientPromise;
        const db = connectedClient.db();
        const collection = db.collection('commutes');

        // Estimate the total number of documents in the collection
        const countEstimate = await collection.estimatedDocumentCount();

        return {
            status: 200,
            body: {
                count: countEstimate
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