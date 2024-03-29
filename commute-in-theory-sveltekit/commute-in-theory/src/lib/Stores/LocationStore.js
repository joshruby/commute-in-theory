import { writable } from 'svelte/store'

export const Locations = writable([])
export const CityPairs = writable([])

const locations = {
    BayArea: {
        work: {
            CUP: {
                'code': 'CUP',
                'name': 'Cupertino, MA',
                'lat_lon': '37.330227595678146,-122.03281591229046',
            }
        },
        home: {
            SCZ: {
                'code': 'SCZ',
                'name': 'Santa Cruz, Downtown',
                'lat_lon': '36.974797779340655,-122.0290861946705',
                'color': '#a4c2f4', // blue
            },
            OAK: {
                'code': 'OAK',
                'name': 'Oakland, West',
                'lat_lon': '37.812088988762454,-122.29942506950347',
                'color': '#c4bcdc', // purple
            },
            SJC: {
                'code': 'SJC',
                'name': 'Santa Jose, Downtown',
                'lat_lon': '37.33481534485126,-121.88822099401446',
                'color': '#ffcdb2', // peach
            },
            SFP: {
                'code': 'SFP',
                'name': 'San Francisco, Pacific Heights',
                'lat_lon': '37.79427344559132,-122.43493160658136',
                'color': '#d5a6bd', // magenta
            },
            LGS: {
                'code': 'LGS',
                'name': 'Los Gatos, Downtown',
                'lat_lon': '37.22473891235269,-121.98375589032867',
                'color': '#e3d3b8', // beige
            },
            RWC: {
                'code': 'RWC',
                'name': 'Redwood City, Oxford',
                'lat_lon': '37.46947269135535,-122.2284655255091',
                'color': '#95b19a', // dark green
            },
            PCA: {
                'code': 'PCA',
                'name': 'Pacifica, Linda Mar',
                'lat_lon': '37.594122784571354,-122.5015289019967',
                'color': '#f9cb9c', // orange 
            },
        }
    },
    SanDiego: {
        work: {
            RBO: {
                'code': 'RBO',
                'name': 'Rancho Bernardo, VF',
                'lat_lon': '33.01199872926068,-117.09188697836275',
            }
        },
        home: {
            SAN: {
                'code': 'SAN',
                'name': 'San Diego Airport, T1 Ride Share',
                'lat_lon': '32.73183061880728,-117.19766417435267',
                'color': '#b8e3d8', // aqua-blue
            },
            CLM: {
                'code': 'CLM',
                'name': 'Clairemont, Town Square',
                'lat_lon': '32.8265288909409,-117.20598237549127',
                'color': '#ccb8e3', // light-purple
            },
            CBD: {
                'code': 'CBD',
                'name': 'Carlsbad, Village',
                'lat_lon': '33.160773694686696,-117.34669932279765',
                'color': '#9edba0', // light-green
            },
            NPK: {
                'code': 'NPK',
                'name': 'North Park',
                'lat_lon': '32.750866591339886,-117.13018958965476',
                'color': '#adadad', // gray
            },
            CDO: {
                'code': 'CDO',
                'name': 'Casa de Oro-Mount Helix',
                'lat_lon': '32.767445120760335,-116.97276250515775',
                'color': '#bcb8e3', // lavender
            },
            DMH: {
                'code': 'DMH',
                'name': 'Del Mar Heights',
                'lat_lon': '32.95442922821245,-117.23444297327268',
                'color': '#e3d8b8', // yellow
            },
            RPO: {
                'code': 'RPO',
                'name': 'Rancho Ponderosa',
                'lat_lon': '33.070781939107064,-117.24470653655378',
                'color': '#bccedc', // flat-blue
            },
            FBK: {
                'code': 'FBK',
                'name': 'Fallbrook, South',
                'lat_lon': '33.317818161062206,-117.21989626093905',
                'color': '#e3b8c3', // pink-red
            }
        }
    }
}
Locations.set(locations)

let cityPairs = [];
for (const locality of Object.values(locations)) {
    for (const [wkey, work] of Object.entries(locality.work)) {
        for (const [hkey, home] of Object.entries(locality.home)) {
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
}
CityPairs.set(cityPairs);