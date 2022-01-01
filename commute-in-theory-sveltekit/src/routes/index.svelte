<!-- 

TODO

- Figure out if stores can be used across routes
- Save unprocessed commutes in browser local storage 
	- Check local storage before fetching new commutes
	- Only fetch those that are newer than the latest one in local storage
	- Update local storage with the new commutes
	- Update the UnprocessedCommutes store
	- Reprocess all commutes
	- Update the ProcessedCommutes store
-->

<script>
	import { ProcessedCommutes, UnprocessedCommutes } from '$lib/stores/CommuteStore'
	import { onMount } from 'svelte'

	function processCommutes(commutes) {
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

		return groupedCommutes;
	}
	
	onMount(async () => {
		const res = await fetch('/recorded-commutes/count');
		const data = await res.json();
		const totalDocumentCount = data.count;

		let pageSize = 50;
		let lastSeenId = null;
		let commutes = [];


		console.log('totalDocumentCount: ', totalDocumentCount);
		console.log('Fetching commutes...');
		while (commutes.length < totalDocumentCount) {
			const resTemp = await fetch(
				`/recorded-commutes/paged`,
				{
					method: 'POST',
					body: JSON.stringify(
						{
							pageSize,
							lastSeenId
						}
					)
				}
			);

			if (resTemp.ok) {
				const data = await resTemp.json();

				lastSeenId = data.lastSeenId;
				commutes = commutes.concat(data.commutes);
			} else {
				console.log('res not ok')
			}

			console.log('Commutes fetched: ', commutes.length);
		}

		// Save the unprocessed commutes in a store
		UnprocessedCommutes.set(commutes);

		// Process all of the commutes
		if (commutes.length > 0) {
			const groupedCommutes = processCommutes(commutes);

			// Save the processed commutes in a store
			ProcessedCommutes.set(groupedCommutes);
		}
	});
</script>

<h1>Commute in Theory</h1>

{#each $UnprocessedCommutes as commute, i}
	<h3>{i}: {commute.origin}</h3>
{/each}