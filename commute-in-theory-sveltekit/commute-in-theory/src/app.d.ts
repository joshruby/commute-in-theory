import type { MongoClient } from 'mongodb'

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}
	namespace globalThis {
		var _mongoClientPromise: Promise<MongoClient>
	  }
}

export {};
