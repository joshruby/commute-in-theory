<script context="module">
	export const load = async ({ fetch }) => {
		const res = await fetch('/recorded-commutes', { credentials: 'omit' });
        
        // const query = {
        //     origin: 'CUP',
        //     destination: 'SCZ'
        // };
        // const res = await fetch(
        //     '/recorded-commutes',
        //     { 
        //         method: 'POST',
        //         request: JSON.stringify(query),
        //         credentials: 'omit',
        //     }
        // );

		if (res.ok) {
			const commuteData = await res.json();
			let commutes = commuteData.commutes;

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