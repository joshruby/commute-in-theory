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