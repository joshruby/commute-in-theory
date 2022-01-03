<script>
	import { ProcessedCommutes, UnprocessedCommutes } from '$lib/stores/CommuteStore';
	import { CityPairs } from '$lib/stores/LocationStore';
	import { onMount } from 'svelte';
	import CityPairSubChart from '$lib/components/CityPairSubChart.svelte';

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

		const pageSize = 10000;

		let lastSeenId;
		if ($UnprocessedCommutes.length > 0) {
			lastSeenId = $UnprocessedCommutes[$UnprocessedCommutes.length - 1]._id;
		} else {
			lastSeenId = null;
		}

		console.log('Commutes in db: ', totalDocumentCount);

		outerWhile: while ($UnprocessedCommutes.length < totalDocumentCount) {
			const res = await fetch(`/recorded-commutes/paged`, {
				method: 'POST',
				body: JSON.stringify({
					pageSize,
					lastSeenId
				})
			});

			if (res.ok) {
				const data = await res.json();
				lastSeenId = data.lastSeenId;

				try {
					// Update the store
					UnprocessedCommutes.update((val) => {
						return val.concat(data.commutes);
					});
				} catch (err) {
					console.log(new Error(err));
					break outerWhile;
				}

				console.log('Commutes now in store: ', $UnprocessedCommutes.length);
				console.log('lastSeenId now in store: ', lastSeenId);
			} else {
				console.log('res not ok', res);
			}
		}

		// Process all of the commutes
		const groupedCommutes = processCommutes($UnprocessedCommutes);
		// Save the processed commutes in a store
		ProcessedCommutes.set(groupedCommutes);
	});

	let chartWidth = 850;
	let chartHeight = 600;

	let containerWidth;
</script>



<div class="container" bind:clientWidth={containerWidth}>
	<div class="mx-8 my-4">
		<div class="mb-8">
			<h1 class="inline">Commute in Theory</h1>
			<h3 class="mt-2 text-gray-400 float-right">
					Commutes: 
					<span class="font-semibold">
						{$UnprocessedCommutes.length}
					</span>
			</h3>
			<hr>
		</div>
		
		{#if containerWidth > 768}
			{#if Object.entries($ProcessedCommutes).length > 0}
				<div class="grid grid-cols-1 place-items-center gap-4">
					{#each $CityPairs as cityPair}
						{#if cityPair.home === 'SCZ'}
							<div class="grid place-items-center border-2 rounded-3xl shadow-sm hover:shadow-md">
								<CityPairSubChart {cityPair} {chartWidth} {chartHeight} />
							</div>
						{/if}
					{/each}
				</div>
			{/if}
		{/if}
	</div>
</div>