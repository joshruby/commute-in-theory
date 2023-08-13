// From https://github.com/vercel/next.js/blob/canary/examples/with-mongodb/lib/mongodb.js
// https://youtu.be/P6gEnVlJPOc?t=705

// https://docs.atlas.mongodb.com/best-practices-connecting-from-vercel/

import { MongoClient } from 'mongodb'
import { MONGODB_URI, NODE_ENV } from '$env/static/private';

const options = {}
let client
let clientPromise: Promise<MongoClient>;

if (!MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env')
}

if (NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI, options)

    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(MONGODB_URI, options)

  clientPromise = client.connect()
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise