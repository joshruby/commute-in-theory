<!-- TODO
	- Make a section for each city combination
		- Only draw the plots when each section is opened 
		- Show all traces but make them somewhat thinner and less opaque and have a darker, thicker trace for the average at each time
		- Change subchart title en dashes to arrows
		- Show a table of statistics for each route
		- Show a dynamic correlation chart between time of day and commute time
			- Use a slider or series of 7 radio buttons to control the day of the week

	- Multi select comparison tool
		- Show average of all data for each of the selected city combinations on one chart, each in a different color
-->

<script>
	import { ProcessedCommutes, UnprocessedCommutes, CommuteCount } from '$lib/stores/CommuteStore';
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
		CommuteCount.set(data.count);

		const pageSize = 200;

		let lastSeenId;
		if ($UnprocessedCommutes.length > 0) {
			lastSeenId = $UnprocessedCommutes[$UnprocessedCommutes.length - 1]._id;
		} else {
			lastSeenId = null;
		}

		console.log('Commutes in db: ', $CommuteCount);

		outerWhile: while ($UnprocessedCommutes.length < pageSize) {
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

	let searchFilter = 'Santa Cruz';
</script>


<div class="flex justify-center items-center mb-6 border-b">
    <div class="flex justify-between items-center w-full max-w-screen-xl p-4">
        <span class="text-2xl font-semibold">Commute in Theory</span>
        <div>
            <span class="mr-2">Commutes Loaded</span>
            <span class="font-semibold">{$UnprocessedCommutes.length} / {$CommuteCount}</span>
        </div>
    </div>
</div>



<div class="flex justify-center">
	<div class="container max-w-screen-xl" bind:clientWidth={containerWidth}>
		{#if containerWidth > chartWidth && Object.entries($ProcessedCommutes).length > 0}
			<div class="grid grid-cols-1 place-items-center gap-4">
			
				<div class="form-control w-64">
					<label for="searchFilter" class="label">
						<span class="label-text text-lg font-semibold">Filter</span>
					</label>
					<input type="text" bind:value={searchFilter} id="searchFilter" placeholder={searchFilter} class="input input-bordered">
				</div>

				{#each $CityPairs as cityPair}
					{#if
						cityPair.home.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
						cityPair.work.name.toLowerCase().includes(searchFilter.toLowerCase())
					}
						<div class="grid place-items-center border rounded-3xl shadow-sm hover:shadow-md">
							<CityPairSubChart {cityPair} {chartWidth} {chartHeight} />
						</div>
					{/if}
				{/each}
			</div>
		{/if}
	</div>
</div>