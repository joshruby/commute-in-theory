import * as db from '$lib/db';

export async function load() {
    const response = await db.getStats()

    if (response.ok) {
        const stats = await response.json()

        return { stats }
    }   
}