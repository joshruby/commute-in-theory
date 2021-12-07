export async function get() {
    try {
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

        const request = {
            origin: locations.HOME_MTNVW,
            destination: locations.WORK_CUP
        }     

        // Build the URL
        const url = new URL(`${process.env['TOMTOM_BASE_URI']}/${request.origin.lat_lon}:${request.destination.lat_lon}/json?`);
        url.searchParams.append('sectionType', 'traffic');
        url.searchParams.append('traffic', true);
        url.searchParams.append('travelMode', 'car');
        url.searchParams.append('vehicleCommercial', false);
        url.searchParams.append('vehicleEngineType', 'combustion');
        url.searchParams.append('report', 'effectiveSettings'); 
        url.searchParams.append('key', process.env['TOMTOM_KEY']);

        // Query the API
        const res = await fetch(url);
        const data = await res.json();

        // Keep only the relevant information
        const commute = {
            origin: request.origin,
            destination: request.destination,
            departureTime: data.routes[0].summary.departureTime,
            travelTimeInSeconds: data.routes[0].summary.travelTimeInSeconds
        }

        return {
            status: 200,
            body: {
                commute
            }
        }
    } catch(err) {
        return {
            status: 500,
            body: {
                error: `GET error`
            }
        }
    }
}