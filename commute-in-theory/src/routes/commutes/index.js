import clientPromise from '$lib/db'
import { ObjectId } from 'mongodb'

export async function get() {
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
                error: 'Server error'
            }
        }
    }
}

export async function post() {
    
}

export async function put() {
    
}

export async function del() {
    
}