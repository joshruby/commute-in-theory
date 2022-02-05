import { writable } from 'svelte/store'

export const ProcessedCommutes = writable([]);
export const UnprocessedCommutes = writable([]);
export const CommuteCount = writable([]);
export const ProcessedCommuteStats = writable([]);
export const UnprocessedCommuteStats = writable([]);