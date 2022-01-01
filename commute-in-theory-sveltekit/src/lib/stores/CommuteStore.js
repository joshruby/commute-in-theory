import { writable } from 'svelte/store'
import { browser } from '$app/env'

export const ProcessedCommutes = writable([]);

export const UnprocessedCommutes = writable(
    browser &&
    (JSON.parse(localStorage.getItem('UnprocessedCommutes')) || [])
);
// Keep the localStorage value in sync with the store
UnprocessedCommutes.subscribe(
    (val) => browser && (localStorage.UnprocessedCommutes = JSON.stringify(val))
);