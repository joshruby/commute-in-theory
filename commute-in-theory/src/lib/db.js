// From https://github.com/vercel/next.js/blob/canary/examples/with-mongodb/lib/mongodb.js
// https://youtu.be/P6gEnVlJPOc?t=705

// https://docs.atlas.mongodb.com/best-practices-connecting-from-vercel/

import { MongoClient } from 'mongodb'

// Using npm env-cmd to expose all env vars, not just those prefixed with VITE_
// https://kit.svelte.dev/faq#env-vars
// Vite 2.7 will expose all env vars on the server side without exposing them to the client. It should be released soon https://github.com/vitejs/vite/pull/5404 (written 12/4/21)
// To load the vars in the dev environment, you have to modify package.json: "dev": "env-cmd svelte-kit dev"
// Additionally, access all env vars using the [''] syntax rather than object syntax

const uri = process.env['MONGODB_URI'];
const options = {}

let client
let clientPromise

if (!process.env['MONGODB_URI']) {
  throw new Error('Please add your Mongo URI to .env.local')
}

if (process.env['NODE_ENV'] === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise