export async function post({ request }) {
    try {
        // Parse the request
        const commuteRequest = await request.json();

        // Build the URL
        const url = new URL(`https://api.tomtom.com/routing/1/calculateRoute/${commuteRequest.origin.lat_lon}:${commuteRequest.destination.lat_lon}/json?`);
        url.searchParams.append('sectionType', 'traffic');
        url.searchParams.append('traffic', true);
        url.searchParams.append('travelMode', 'car');
        url.searchParams.append('vehicleCommercial', false);
        url.searchParams.append('vehicleEngineType', 'combustion');
        url.searchParams.append('report', 'effectiveSettings'); 
        url.searchParams.append('key', process.env['TOMTOM_KEY']);

        // Query the TomTom API
        const res = await fetch(url);
        const data = await res.json();

        // Keep only the relevant information
        const commute = {
            origin: commuteRequest.origin,
            destination: commuteRequest.destination,
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