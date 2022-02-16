<!-- TODO

	X Make the header bar background white

	- Show a dynamic correlation chart between time of day and commute time
		- Use a slider or series of 7 radio buttons to control the day of the week

	- Multi select comparison tool
		- Show average of all data for each of the selected city combinations on one chart, each in a different color

	- Investigate data-forge package

	-X On a weekly basis, use the recording util to download all of the commutes, compute statistics for each route, and post them to a "commute-stats" collection
		X Compute the median, average, std, and percentiles (10th, 25, 50th, 75th, 90th) for each route and time
		X Investigate stat mismatch - something in the day type logic appears to be amiss
		X Change the document format to be statsByWeekday.<type of day>.[count, max, min, mean, quantiles.[10, 25, 50, 75, 90]]

	X Move "raw data" toggle inside of charts (top right corner)
		- Check the UnprocessedCommuteStore to see if the raw commutes already exist before fetching them

	X CityPairSubChart: show a solid line for the median and shade between quantiles

	X CityPairSubChart: add dashed traces for the min and max recordings

	- Figure out how to properly scope tailwind classes to individual components
-->

<script>
	import { onMount } from 'svelte';
	import { ProcessedCommutes, UnprocessedCommutes, CommuteCount, UnprocessedCommuteStats, ProcessedCommuteStats } from '$lib/stores/CommuteStore';
	import { CityPairs } from '$lib/stores/LocationStore';
	import CityPairSubChart from '$lib/components/CityPairSubChart.svelte';
	import data from './commutes.json'

	async function getCommutes(cityPair, dateLimits) {
		//////   Online   ////////////////////////////////////////////////////
		//////////////////////////////////////////////////////////////////////
		
		// // Find the date window length in days
		// // Set the page size
		// const pageSize = 10000;
		
		// const routes = [
		// 	{
		// 		origin: cityPair.home,
		// 		destination: cityPair.work
		// 	},
		// 	{
		// 		origin: cityPair.work,
		// 		destination: cityPair.home
		// 	},
		// ]
		// let commutes = [];
		// paging: for (const route of routes) {
		// 	let lastSeenDepartureTime = dateLimits.upper

		// 	while (lastSeenDepartureTime > dateLimits.lower) {
		// 		try {
		// 			const res = await fetch(`/recorded-commutes/paged`, {
		// 				method: 'POST',
		// 				body: JSON.stringify({
		// 					origin: route.origin,
		// 					destination: route.destination,
		// 					pageSize,
		// 					lowerDateLimit: dateLimits.lower,
		// 					lastSeenDepartureTime
		// 				})
		// 			});

		// 			if (res.ok) {
		// 				const data = await res.json();

		// 				// Update the array of commutes
		// 				commutes = commutes.concat(data.commutes)

		// 				// Update the date of the last seen id
		// 				lastSeenDepartureTime = new Date(data.lastSeenDepartureTime)

		// 				// Debugging
		// 				console.log('lastSeenDepartureTime: ', lastSeenDepartureTime)
		// 				console.log('Commutes fetched: ', commutes.length);
						
		// 			} else {
		// 				console.log('res not ok', res);
		// 				break paging;
		// 			}
		// 		} catch (err) {
		// 			console.log(new Error(err));
		// 			break paging;
		// 		}
		// 	}
		// }

		// // Add the new comutes to the Unprocessed commutes store
		// UnprocessedCommutes.update((val) => {
		// 	return val.concat(commutes);
		// });

		//////////////////////////////////////////////////////////////////////
		//////////////////////////////////////////////////////////////////////


		/////   Offline   ////////////////////////////////////////////////////
		//////////////////////////////////////////////////////////////////////
		
		// Load the offline commutes arr and save it in the UnprocessedStore
		const commutes = data.commutes;
		UnprocessedCommutes.set(commutes)
		CommuteCount.set(commutes.length);	

		//////////////////////////////////////////////////////////////////////
		//////////////////////////////////////////////////////////////////////


		// Process all of the commutes
		processCommutes();
	};

	function processCommutes() {
		// Convert the departureTime strings to Date objects and
		// simplify their minutes and seconds
		$UnprocessedCommutes.forEach((ele) => {
			// Make the departureTime into a Date obj
			// By default this will convert the UTC time to the local timezone
			// of the browser
			ele.departureTime = new Date(ele.departureTime);

			// Add another field that has a constant date for all points
			// This will make generating plot scales easier
			ele.departureTimeConstDate = new Date(
				2021, 5, 21, 
				ele.departureTime.getHours(), 
				ele.departureTime.getMinutes(), 
				0);
		});

		// Group all of the unprocessed commutes by city pairs
		let groupedCommutes = groupBy($UnprocessedCommutes, (ele) => ele.origin + '-' + ele.destination);

		// Make each city pair an obj
		Object.keys(groupedCommutes).forEach((key) => {
			let commutes = groupedCommutes[key];
		    groupedCommutes[key] = {
				ungrouped: commutes
			};
		});

		// Within each city pair arr, separately group commutes by date and time
		Object.keys(groupedCommutes).forEach((key) => {
			groupedCommutes[key]['grouped'] = {};

			groupedCommutes[key]['grouped']['byDate'] = groupBy(
				groupedCommutes[key]['ungrouped'], 
				(ele) => ele.departureTime.toDateString()
			);

			groupedCommutes[key]['grouped']['byTime'] = groupBy(
		        groupedCommutes[key]['ungrouped'],
		        ele => ele.departureTime.toLocaleTimeString()
		    );
		});

		// Set the Processed commutes store
		ProcessedCommutes.set(groupedCommutes);
	}

	async function getCommuteStats(cityPair) {
		// If route is empty all routes will be queried for
		let routes = []
		if (cityPair.home == null || cityPair.work == null) {
			routes.push({});
		} else {
			routes.push({ origin: cityPair.home, destination: cityPair.work });
			routes.push({ origin: cityPair.work, destination: cityPair.home })
		}

		for (const route of routes) {
			try {
				const res = await fetch(`/recorded-commutes/stats`, {
					method: 'POST',
					body: JSON.stringify({ route })
				});

				if (res.ok) {
					const data = await res.json();

					// Add the new comutes to the Unprocessed commutes store
					UnprocessedCommuteStats.update((val) => {
						return val.concat(data.stats);
					});
					
				} else {
					console.log('res not ok', res);
				}
			} catch (err) {
				console.log(new Error(err));
			}
		}

		processCommuteStats();
	}

	function processCommuteStats() {
		// Group all of the unprocessed commutes by city pairs
		const groupedCommuteStats = groupBy($UnprocessedCommuteStats, (ele) => ele.origin + '-' + ele.destination);

		// Set the Processed commutes store
		ProcessedCommuteStats.set(groupedCommuteStats);
	}

	// https://stackoverflow.com/questions/14446511/most-efficient-method-to-groupby-on-an-array-of-objects
	const groupBy = (x, f) => x.reduce((a, b) => ((a[f(b)] ||= []).push(b), a), {})
		
	let chartWidth = 850;
	let chartHeight = 600;
	let containerWidth;

	onMount(async() => {
		getCommuteStats({ home: 'SCZ', work: 'CUP' })
	});
	
	// getCommutes(
	// 	{
	// 		home: 'SCZ',
	// 		work: 'CUP'
	// 	},
	// 	{
	// 		lower: new Date(2022, 1, 0, 0),
	// 		upper: new Date() 
	// 	}
	// )
	
	
	// Debugging
	$: {
		// console.log('$UnprocessedCommutes: ', $UnprocessedCommutes)
		console.log('$ProcessedCommutes: ', $ProcessedCommutes)
		// console.log('$UnprocessedCommuteStats: ', $UnprocessedCommuteStats)
		console.log('$ProcessedCommuteStats: ', $ProcessedCommuteStats)
	}
</script>

<div class="flex justify-center items-center bg-white border-b">
	<div class="flex justify-between items-center w-full max-w-screen-xl p-4">
		<span class="text-2xl font-semibold">Commute in Theory</span>
	</div>
</div>

<div class="bg-slate-50 min-h-screen">
	<div class="flex justify-center p-4">
		<div class="container max-w-screen-xl" border-t bind:clientWidth={containerWidth}>
			{#if containerWidth > chartWidth && Object.entries($ProcessedCommuteStats).length > 0}
				<div class="grid grid-cols-1 place-items-center gap-4">
					{#each $CityPairs as cityPair}
						{#if cityPair.routes.forward in $ProcessedCommuteStats}
							<CityPairSubChart {cityPair} {chartWidth} {chartHeight} />
						{/if}
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>