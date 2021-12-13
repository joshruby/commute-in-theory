import { writable } from 'svelte/store'

export const LocationStore = writable([])

const locations = {
    MTV: {
        name: 'Mountain View',
        lat_lon: '37.403712687363814,-122.07814772790742'
    },
    SCZ: {
        name: 'Santa Cruz, Downtown',
        lat_lon: '36.974797779340655,-122.0290861946705'
    },
    CUP: {
        name: 'Cupertino',
        lat_lon: '37.330227595678146,-122.03281591229046'
    },
    STA: {
        name: 'Stanford',
        lat_lon: '37.42666339942809,-122.17649144765893'
    },

}

LocationStore.set(locations)