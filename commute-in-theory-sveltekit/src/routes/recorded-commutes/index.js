import clientPromise from '$lib/db'

export async function get() {
    try {
        // Connect to the db
        const connectedClient = await clientPromise;
        const db = connectedClient.db();
        const collection = db.collection('commutes');

        // Define the query
        const query = {
            origin: { $in: ['CUP','SCZ', 'LGS', 'MLP'] },
            destination: { $in: ['CUP', 'STA', 'SCZ', 'LGS', 'MLP'] }
        };

        // Project the returned fields to ensure the query is covered
        const projection = {
            origin: 1,
            destination: 1,
            departureTime: 1,
            "departureTimeLocalizedSimplified.hour": 1,
            "departureTimeLocalizedSimplified.minute": 1,
            travelTimeInSeconds: 1 
        };

        // Query the db
        const commutes = await collection
            .find(query, projection)
            .limit(10)
            .toArray()

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