import * as db from '$lib/db';

export async function load({ setHeaders }) {
    const response = await db.getStats()

    if (response.ok) {
        const stats = await response.json()

        // Cache the page for N seconds
        setHeaders({
            'cache-control': `max-age=${60 * 60 * 24 * 7}`
        });

        return { stats }
    }   
}