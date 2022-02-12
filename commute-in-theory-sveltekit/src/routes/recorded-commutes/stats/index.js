import clientPromise from '$lib/db'

// https://stackoverflow.com/questions/31826760/how-to-get-data-in-batches-in-mongodb
export async function post(request) {
    try {
        // Parse the request
        const body = JSON.parse(request.body);

        // Define the query
        let query = {
            "computedAt": { 
                "$gte": new Date(body.dateLimit.lower),
                "$lt": new Date(body.dateLimit.upper) 
            }
        }
        // Limit the query to the passed route
        if (Object.keys(body.route).length != 0) {
            query.origin = body.route.origin;
            query.destination = body.route.destination;
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

        // Connect to the db
        const connectedClient = await clientPromise;
        const db = connectedClient.db();
        const collection = db.collection('commute_stats');

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