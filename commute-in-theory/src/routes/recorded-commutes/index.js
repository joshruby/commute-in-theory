import clientPromise from '$lib/db'
import { ObjectId } from 'mongodb'

export async function get(request) {
    try {
        const connectedClient = await clientPromise;
        const db = connectedClient.db();
        const collection = db.collection('commutes');
        const commutes = await collection.find().toArray();

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
        const connectedClient = await clientPromise;
        const db = connectedClient.db();
        const collection = db.collection('commutes');
        
        // The commute object was stringified on the client side before being transmitted
        const commute = JSON.parse(request.body);

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

export async function put(request) {
    try {
        const connectedClient = await clientPromise;
        const db = connectedClient.db();
        const collection = db.collection('commutes');

        return {
            status: 200,
            body: {
                status: 'Successful PUT'
            }
        }
    } catch(err) {
        return {
            status: 500,
            body: {
                error: 'PUT server error'
            }
        }
    }
}

export async function del(request) {
    try {
        const connectedClient = await clientPromise;
        const db = connectedClient.db();
        const collection = db.collection('commutes');

        return {
            status: 200,
            body: {
                status: 'Successful DEL'
            }
        }
    } catch(err) {
        return {
            status: 500,
            body: {
                error: 'DEL server error'
            }
        }
    }
}