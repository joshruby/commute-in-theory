import clientPromise from '$lib/db'

export async function get() {
    try {
        // Connect to the db
        const connectedClient = await clientPromise;
        const db = connectedClient.db();
        const collection = db.collection('commutes');

        const query = {
            origin: { $in: ['CUP','SCZ', 'LGS', 'MLP'] },
            destination: { $in: ['CUP', 'STA', 'SCZ', 'LGS', 'MLP'] }
        };

        // Retrieve db items and put into an array
        const commutes = await collection.find(query).limit(10).toArray()

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

// https://stackoverflow.com/questions/31826760/how-to-get-data-in-batches-in-mongodb
// or https://docs.mongodb.com/manual/reference/method/cursor.batchSize/#example
export async function post(request) {
    try {
        // Parse the request
        const query = JSON.parse(request.body);

        console.log(query);

        // Connect to the db
        const connectedClient = await clientPromise;
        const db = connectedClient.db();
        const collection = db.collection('commutes');

        // Fetch the commutes from mongodb
        const commutes = await collection.find(query).limit(10000)

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
                error: 'POST server error'
            }
        }
    }
}