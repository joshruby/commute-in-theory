<!-- TODO
	- 3D time series: travel time by departure time by week
	- Properly scope grouped inputs
-->

<script>
	import { beforeUpdate } from 'svelte';
	import { ProcessedCommutes, UnprocessedCommutes, CommuteCount, UnprocessedCommuteStats, ProcessedCommuteStats } from '$lib/stores/CommuteStore';
	import { CityPairs } from '$lib/stores/LocationStore';
	import HomeCitySelector from '$lib/components/HomeCitySelector.svelte';
	import ChartCard from '$lib/components/ChartCard.svelte';
	import CityPairComparisonChart from '$lib/components/CityPairComparisonChart.svelte';
	import CityPairScatterChart from '$lib/components/CityPairScatterChart.svelte';
	import CityPairHeatmapChart from '$lib/components/CityPairHeatmapChart.svelte';
	// import data from './commutes.json'

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
	$: chartWidth = containerWidth > 1024 ? 1024 : (containerWidth - 60)
	let chartHeight = 400;

	let selectedCityPairs = [];
	let selectedHomeCityCodes = [];
	let prevSelectedHomeCityCodes = [];
	let newSelectedHomeCityCodes = [];
	beforeUpdate(() => {
		// console.log('selectedHomeCityCodes', selectedHomeCityCodes)
		// Determine which of the home city code selections is new
		newSelectedHomeCityCodes = selectedHomeCityCodes.filter(
			ele => !prevSelectedHomeCityCodes.includes(ele)
		);
		// console.log('newSelectedHomeCityCodes', newSelectedHomeCityCodes)
		prevSelectedHomeCityCodes = selectedHomeCityCodes;

		selectedCityPairs = $CityPairs.filter(
			cityPair => cityPair.work.code === 'CUP' 
						&& selectedHomeCityCodes.includes(cityPair.home.code)
		);
		// console.log('selectedCityPairs', selectedCityPairs)

		const work = 'CUP';
		for (const home of newSelectedHomeCityCodes) {
			// Fetch commute stats for this cityPair if they aren't already
			// in the stats store
			if (!$ProcessedCommuteStats.hasOwnProperty(`${home}-${work}`)) {
				// console.log('Getting stats for', home);
				getCommuteStats({ home, work })
			}

			// Remove the current home code from the new home codes array
			// so it doesn't get processed multiple times before its promise is resolved
			newSelectedHomeCityCodes = newSelectedHomeCityCodes.filter(
				ele => ele !== home
			)
		}

		processCommuteStats();
		// console.log('$ProcessedCommuteStats: ', $ProcessedCommuteStats)
		// console.log('')
	})
</script>

<div bind:clientWidth={containerWidth}>
	<div class="grid grid-cols-1 place-items-center gap-4">	
		<HomeCitySelector bind:selectedCities={selectedHomeCityCodes} />

		{#if selectedCityPairs.length > 0}
			<ChartCard>
				<CityPairComparisonChart cityPairs={selectedCityPairs} {chartWidth} {chartHeight} />
			</ChartCard>	

			{#each selectedCityPairs as cityPair}
				<ChartCard>
					<CityPairScatterChart {cityPair} {chartWidth} {chartHeight} />
					<div class="my-8 border-b w-3/4"></div>
					<CityPairHeatmapChart {cityPair} {chartWidth} {chartHeight} />
				</ChartCard>	
			{/each}
		{/if}
	</div>
</div>
