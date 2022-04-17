import clientPromise from '$lib/db'

// https://stackoverflow.com/questions/31826760/how-to-get-data-in-batches-in-mongodb
export async function post({ request }) {
    try {
        // Parse the request
        const body = await request.json();

        // Connect to the db
        const connectedClient = await clientPromise;
        const db = connectedClient.db();
        const collection = db.collection('commute_stats');

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

        // Define the query
        query = { "computedAt": lastComputedAt }
        // Limit the query to the passed route
        if (Object.keys(body.route).length != 0) {
            query.origin = body.route.origin;
            query.destination = body.route.destination;
        }

        // Project the returned fields to ensure the query is covered
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