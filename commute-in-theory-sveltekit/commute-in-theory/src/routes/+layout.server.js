import * as db from '$lib/db';
import { processCommuteStats } from '$lib/utils';

export async function load() {
    const response = await db.getStats()
    
    if (response.ok) {
        const data = await response.json()

        // Process the commutes
        let processedCommuteStats = processCommuteStats(data.stats);

        return { processedCommuteStats }
    }   
}