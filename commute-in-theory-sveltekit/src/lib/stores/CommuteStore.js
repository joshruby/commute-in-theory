import { writable } from 'svelte/store'
// import clientPromise from '$lib/db'

export const CommuteStore = writable([]);

const fetchCommutes = async () => {
    // Method 1: fetch data from my own endpoint
    // Getting 'ERR_INVALID_URL'
    // const res = await fetch('src/routes/recorded-commutes');
    // const commutes = await res.json();

    // Method 2: connect to the db directly
    // Getting "global is undefined" most likely from 
    // import { MongoClient } from 'mongodb' in db.js
    // I know the fetch request did make it through to mongo though since it
    // should up in the db monitor graphs
    // const connectedClient = await clientPromise;
    // const db = connectedClient.db();
    // const collection = db.collection('commutes');

    // // Retrieve db items and put into an array
    // const commutes = await collection.find().toArray();

    CommuteStore.set(commutes)
}

fetchCommutes();