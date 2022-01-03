import { writable } from 'svelte/store'

export const Locations = writable([])
export const CityPairPermutations = writable([])
export const CityPairCombinations = writable([])

const locations = {
    work: {
        CUP: {
            name: 'Cupertino, MA',
            lat_lon: '37.330227595678146,-122.03281591229046'
        },
        STA: {
            name: 'Stanford, Roble Field',
            lat_lon: '37.42666339942809,-122.17649144765893'
        },
    },
    home: {
        SCZ: {
            name: 'Santa Cruz, Downtown',
            lat_lon: '36.974797779340655,-122.0290861946705'
        },
  
        CAM: {
            name: 'Campbell, Downtown',
            lat_lon: '37.28750197556045,-121.94487365182788'
        },
        SCU: {
            name: 'Santa Clara, SCU',
            lat_lon: '37.34887015070597,-121.94401506069336'
        },
        SJC: {
            name: 'Santa Jose, Downtown',
            lat_lon: '37.33481534485126,-121.88822099401446'
        },
        SFP: {
            name: 'San Francisco, Pacific Heights',
            lat_lon: '37.79427344559132,-122.43493160658136'
        },
        
        LGS: {
            name: 'Los Gatos, Downtown',
            lat_lon: '37.22473891235269,-121.98375589032867'
        },
        MLP: {
            name: 'Menlo Park, West MP',
            lat_lon: '37.431029416205284,-122.20217060835637'
        },
        BER: {
            name: 'Berkeley, Downtown',
            lat_lon: '37.87075376688075,-122.27199562287598'
        },
        CPA: {
            name: 'Capitola, Mall',
            lat_lon: '36.97371780004841,-121.95931307716036'
        },
        PCA: {
            name: 'Pacifica, Linda Mar',
            lat_lon: '37.594122784571354,-122.5015289019967'
        },
        // FEL: {
        //     name: 'Felton, Downtown',
        //     lat_lon: '37.05131035573837,-122.07406272553854'
        // },
        // WLG: {
        //     name: 'Willow Glen, Doerr Park',
        //     lat_lon: '37.2739703906996,-121.91368527984521'
        // },
        // SFM: {
        //     name: 'San Francisco, Mission District',
        //     lat_lon: '37.75870633260038,-122.41794365829263'
        // },
        // MTV: {
        //     name: 'Mountain View, Shoreline',
        //     lat_lon: '37.403712687363814,-122.07814772790742'
        // },
    }
}
Locations.set(locations)

let cityPairPermutations = [];
let cityPairCombinations = []
Object.keys(locations['work']).forEach((workKey) => {
    Object.keys(locations['home']).forEach((homeKey) => {
        cityPairCombinations.push([homeKey, workKey])
        
        cityPairPermutations.push(`${homeKey}-${workKey}`)
        cityPairPermutations.push(`${workKey}-${homeKey}`)
    })
})
CityPairPermutations.set(cityPairPermutations);
CityPairCombinations.set(cityPairCombinations);