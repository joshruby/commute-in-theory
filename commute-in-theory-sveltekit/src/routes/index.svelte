<script context="module">
	export const load = async ({ page, fetch }) => {
		let commutes = [];

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

		// Build up the queries of interest
		// const workCities = ['CUP', 'STA'];
        // const homeCities = ['SCZ', 'PCA', 'MLP', 'LGS'];
        let queries = [];
        for (const home of Object.keys(locations.home)) {
            for (const work of Object.keys(locations.work)) {
                queries.push({
					origin: home,
					destination: work
				});
				queries.push({
					origin: work,
					destination: home
				});
            }
        }

		// Fetch with each query
		for (const query of queries) {
			const res = await fetch(
				`/recorded-commutes/${query.origin}-${query.destination}`, 
				{ credentials: 'omit' }
			);
    
			if (res.ok) {
				const commuteData = await res.json();
				commutes = commutes.concat(commuteData.commutes);
			}
		}

		console.log(commutes.length);

		// console.log(commutes);
		
		// Process all of the commutes
		if (commutes.length > 0) {
			// Convert the departureTime strings to Date objects and
			// simplify their minutes and seconds
			commutes.forEach((ele) => {
				const minuteThresh = 7;
				const recordingTimes = [0, 15, 30, 45];

				let date = new Date(ele.departureTime);

				recordingTimes.forEach((t) => {
					const diff = Math.abs(date.getMinutes() - t);

					if (diff <= minuteThresh) {
						date.setMinutes(t, 0);
					} else if (diff >= 60 - minuteThresh) {
						// E.g 07:54 should be set to 08:00, not 07:00
						// This could lead to a day having multiple commutes attributed
						// to the same recording time. I think that's fine for now
						date.setHours(date.getHours() + 1, t, 0);
					}
				});

				// Make the departureTime values Date objects
				ele.departureTime = date;

				// Add a new field for the locale time to ease grouping later on
				ele.departureTimeLocaleString = date.toLocaleTimeString();

				// Add another field that has a constant date for all points
				// This will make generating plot scales easier
				ele.departureTimeConstDate = new Date(2021, 5, 21, date.getHours(), date.getMinutes(), 0);
			});

			// Group the commutes by city pairs
			// https://stackoverflow.com/questions/14446511/most-efficient-method-to-groupby-on-an-array-of-objects
			const groupBy = (x, f) => x.reduce((a, b) => ((a[f(b)] ||= []).push(b), a), {});
			let groupedCommutes = groupBy(commutes, (ele) => ele.origin + '-' + ele.destination);
			// // Within each city pair arr group commutes by hour and minute
			// Object.keys(groupedCommutes).forEach((key) => {
			//     groupedCommutes[key] = groupBy(
			//         groupedCommutes[key],
			//         ele => ele.departureTime.toLocaleTimeString()
			//     )
			// });

			// Within each city pair arr group commutes by date
			Object.keys(groupedCommutes).forEach((key) => {
				groupedCommutes[key] = groupBy(groupedCommutes[key], (ele) =>
					ele.departureTime.toDateString()
				);
			});

			// console.log(groupedCommutes);

			// Save the commutes in a store
			CommuteStore.set(groupedCommutes);

			// Cache the page for this many seconds
			// https://github.com/sveltejs/kit/issues/793
			return {
				// props: {
				//     commuteData: await res.json()
				// },
				maxage: 60 * 15 // Cache the page in the cdn for this many seconds
			};
		}

		return {
			status: res.status,
			error: new Error('Could not load the recorded commutes.')
		};
	};
</script>

<script>
	import { CommuteStore } from '$lib/stores/CommuteStore'
</script>

<h1>Commute in Theory</h1>