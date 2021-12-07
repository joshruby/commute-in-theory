import { writable } from 'svelte/store'

export const LocationStore = writable([])

const locations = {
    HOME_MTNVW: {
        name: 'Home, Mountain View',
        lat_lon: '37.403712687363814,-122.07814772790742'
    },
    WORK_CUP: {
        name: 'Work, Cupertino',
        lat_lon: '37.330227595678146,-122.03281591229046'
    },
}

LocationStore.set(locations)