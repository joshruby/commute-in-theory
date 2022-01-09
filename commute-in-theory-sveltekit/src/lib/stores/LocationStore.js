import { writable } from 'svelte/store'

export const Locations = writable([])
export const CityPairs = writable([])

const locations = {
    work: {
        CUP: {
            code: 'CUP',
            name: 'Cupertino, MA',
            lat_lon: '37.330227595678146,-122.03281591229046'
        },
        STA: {
            code: 'STA',
            name: 'Stanford, Roble Field',
            lat_lon: '37.42666339942809,-122.17649144765893'
        },
    },
    home: {
        SCZ: {
            code: 'SCZ',
            name: 'Santa Cruz, Downtown',
            lat_lon: '36.974797779340655,-122.0290861946705'
        },
  
        CAM: {
            code: 'CAM',
            name: 'Campbell, Downtown',
            lat_lon: '37.28750197556045,-121.94487365182788'
        },
        SCU: {
            code: 'SCU',
            name: 'Santa Clara, SCU',
            lat_lon: '37.34887015070597,-121.94401506069336'
        },
        SJC: {
            code: 'SJC',
            name: 'San Jose, Downtown',
            lat_lon: '37.33481534485126,-121.88822099401446'
        },
        SFP: {
            code: 'SFP',
            name: 'San Francisco, Pacific Heights',
            lat_lon: '37.79427344559132,-122.43493160658136'
        },
        LGS: {
            code: 'LGS',
            name: 'Los Gatos, Downtown',
            lat_lon: '37.22473891235269,-121.98375589032867'
        },
        MLP: {
            code: 'MLP',
            name: 'Menlo Park, West MP',
            lat_lon: '37.431029416205284,-122.20217060835637'
        },
        BER: {
            code: 'BER',
            name: 'Berkeley, Downtown',
            lat_lon: '37.87075376688075,-122.27199562287598'
        },
        CPA: {
            code: 'CPA',
            name: 'Capitola, Mall',
            lat_lon: '36.97371780004841,-121.95931307716036'
        },
        PCA: {
            code: 'PCA',
            name: 'Pacifica, Linda Mar',
            lat_lon: '37.594122784571354,-122.5015289019967'
        },
        // FEL: {
        //     code: 'FEL',
        //     name: 'Felton, Downtown',
        //     lat_lon: '37.05131035573837,-122.07406272553854'
        // },
        // WLG: {
        //     code: 'WLG',
        //     name: 'Willow Glen, Doerr Park',
        //     lat_lon: '37.2739703906996,-121.91368527984521'
        // },
        // SFM: {
        //     code: 'SFM',
        //     name: 'San Francisco, Mission District',
        //     lat_lon: '37.75870633260038,-122.41794365829263'
        // },
        // MTV: {
        //     code: 'MTV',
        //     name: 'Mountain View, Shoreline',
        //     lat_lon: '37.403712687363814,-122.07814772790742'
        // },
    }
}
Locations.set(locations)

// let cityPairs = [];
// Object.keys(locations['work']).forEach((work) => {
//     Object.keys(locations['home']).forEach((home) => {
//         cityPairs.push({
//             home: home,
//             work: work,
//             routes: {
//                 forward: `${home}-${work}`,
//                 reverse: `${work}-${home}`
//             }
//         });
//     })
// })
// CityPairs.set(cityPairs);

let cityPairs = [];
for (const [wkey, work] of Object.entries(locations['work'])) {
    for (const [hkey, home] of Object.entries(locations['home'])) {
        cityPairs.push({
            home: home,
            work: work,
            routes: {
                forward: `${hkey}-${wkey}`,
                reverse: `${wkey}-${hkey}`
            }
        });
    }
}
CityPairs.set(cityPairs);