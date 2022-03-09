<!-- TODO
	- Show a dynamic correlation chart between time of day and commute time
		- Use a slider or series of 7 radio buttons to control the day of the week

	- Properly scope grouped inputs
-->

<script>
	import { onMount } from 'svelte';
	import { ProcessedCommutes, UnprocessedCommutes, CommuteCount, UnprocessedCommuteStats, ProcessedCommuteStats } from '$lib/stores/CommuteStore';
	import { CityPairs } from '$lib/stores/LocationStore';
	import CityPairChart from '$lib/components/CityPairChart.svelte';
	import CityPairComparisonChart from '$lib/components/CityPairComparisonChart.svelte';
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
	}

	function processCommuteStats() {
		// Group all of the unprocessed commutes by city pairs
		const groupedCommuteStats = groupBy($UnprocessedCommuteStats, (ele) => ele.origin + '-' + ele.destination);

		// Set the Processed commutes store
		ProcessedCommuteStats.set(groupedCommuteStats);
	}

	// https://stackoverflow.com/questions/14446511/most-efficient-method-to-groupby-on-an-array-of-objects
	const groupBy = (x, f) => x.reduce((a, b) => ((a[f(b)] ||= []).push(b), a), {})
		
	
	let containerWidth;
	$: chartWidth = containerWidth > 1280 ? 1280: (containerWidth - 60)
	let chartHeight = 600;

	onMount(async () => {
		for (const home of ['SCZ', 'LGS', 'PCA', 'CAM']) {
			await getCommuteStats({ home, work: 'CUP' })
		}
		processCommuteStats();
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
	// processCommutes();

	let selectedCityPairs = [];
	$: {
		selectedCityPairs = $CityPairs.filter(
			cityPair => cityPair.routes.forward in $ProcessedCommuteStats
		);
		// Only show the first 6 pairs
		selectedCityPairs = selectedCityPairs.slice(0, 6)
	}
	
	// Debugging
	// $: {
	// 	console.log('$UnprocessedCommutes: ', $UnprocessedCommutes)
	// 	console.log('$ProcessedCommutes: ', $ProcessedCommutes)
		// console.log('$UnprocessedCommuteStats length: ', $UnprocessedCommuteStats.length)
		// console.log('$ProcessedCommuteStats: ', $ProcessedCommuteStats)
	// }
</script>

<div bind:clientWidth={containerWidth}>
	<div class="grid grid-cols-1 place-items-center gap-4">
		{#if selectedCityPairs.length > 0}
			<CityPairComparisonChart cityPairs={selectedCityPairs} {chartWidth} {chartHeight} />
		{/if}

		{#each $CityPairs as cityPair}
			{#if cityPair.routes.forward in $ProcessedCommuteStats}
				<CityPairChart {cityPair} {chartWidth} {chartHeight} />
			{/if}
		{/each}
	</div>
</div>
