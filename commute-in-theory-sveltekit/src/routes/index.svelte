<!-- TODO

	- Make a section for each city combination
		- Only draw the plots when each section is opened 
		- Show all traces but make them somewhat thinner and less opaque and have a darker, thicker trace for the average at each time as well as lines for the 25th/75th and 10th/90th percentiles (like weatherspark)
		- Show a dynamic correlation chart between time of day and commute time
			- Use a slider or series of 7 radio buttons to control the day of the week

	- Multi select comparison tool
		- Show average of all data for each of the selected city combinations on one chart, each in a different color

	- Investigate data-forge package
	
-->

<script context="module">
	export async function load({ fetch }) {
		const res = await fetch('/recorded-commutes/count');
		const data = await res.json();
		const totalCommuteCount = data.count;

		return {
			props: { totalCommuteCount }
		}
	}
</script>

<script>
	import { ProcessedCommutes, UnprocessedCommutes, CommuteCount } from '$lib/stores/CommuteStore';
	import { CityPairs } from '$lib/stores/LocationStore';
	import CityPairSubChart from '$lib/components/CityPairSubChart.svelte';
	import data from './commutes.json'

	export let totalCommuteCount;
	CommuteCount.set(totalCommuteCount);

	async function getCommutes(cityA, cityB, dateLimits) {
		//////   Online   ////////////////////////////////////////////////////
		//////////////////////////////////////////////////////////////////////
		
		// Find the date window length in days
		// Set the page size
		const pageSize = 10000;
		
		const routes = [
			{
				origin: cityA,
				destination: cityB
			},
			{
				origin: cityB,
				destination: cityA
			},
		]
		let commutes = [];
		paging: for (const route of routes) {
			let lastSeenDepartureTime = dateLimits.upper

			while (lastSeenDepartureTime > dateLimits.lower) {
				try {
					const res = await fetch(`/recorded-commutes/paged`, {
						method: 'POST',
						body: JSON.stringify({
							origin: route.origin,
							destination: route.destination,
							pageSize,
							lowerDateLimit: dateLimits.lower,
							lastSeenDepartureTime
						})
					});

					if (res.ok) {
						const data = await res.json();

						// Update the array of commutes
						commutes = commutes.concat(data.commutes)

						// Update the date of the last seen id
						lastSeenDepartureTime = new Date(data.lastSeenDepartureTime)

						// Debugging
						console.log('lastSeenDepartureTime: ', lastSeenDepartureTime)
						console.log('Commutes fetched: ', commutes.length);
						
					} else {
						console.log('res not ok', res);
						break paging;
					}
				} catch (err) {
					console.log(new Error(err));
					break paging;
				}
			}
		}

		// Add the new comutes to the Unprocessed commutes store
		UnprocessedCommutes.update((val) => {
			return val.concat(commutes);
		});

		//////////////////////////////////////////////////////////////////////
		//////////////////////////////////////////////////////////////////////


		/////   Offline   ////////////////////////////////////////////////////
		//////////////////////////////////////////////////////////////////////
		
		// // Load the offline commutes arr and save it in the UnprocessedStore
		// const commutes = data.commutes;
		// UnprocessedCommutes.set(commutes)
		// CommuteCount.set(commutes.length);	

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
		// https://stackoverflow.com/questions/14446511/most-efficient-method-to-groupby-on-an-array-of-objects
		const groupBy = (x, f) => x.reduce((a, b) => ((a[f(b)] ||= []).push(b), a), {});
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

	let chartWidth = 850;
	let chartHeight = 600;
	let containerWidth;

	getCommutes(
		'SCZ',
		'CUP',
		{
			lower: new Date(2022, 0, 25, 6),
			upper: new Date(2022, 0, (26 + 1)) 
		}
	)

	$: {
		// console.log('$UnprocessedCommutes: ', $UnprocessedCommutes)
		// console.log('$ProcessedCommutes: ', $ProcessedCommutes)
	}
</script>

<div class="flex justify-center items-center border-b">
    <div class="flex justify-between items-center w-full max-w-screen-xl m-4">
        <span class="text-2xl font-semibold">Commute in Theory</span>
        <div class="bg-slate-50/50 p-2 border rounded-xl shadow-sm">
            <span class="mr-1">Commutes Loaded</span>
            <span class="font-semibold">{$UnprocessedCommutes.length} / {$CommuteCount}</span>
        </div>
    </div>
</div>


<div class="flex justify-center bg-slate-50/50 p-4">
	<div class="container max-w-screen-xl" bind:clientWidth={containerWidth}>
		{#if containerWidth > chartWidth && Object.entries($ProcessedCommutes).length > 0}
			<div class="grid grid-cols-1 place-items-center gap-4">
				{#each $CityPairs as cityPair}
					{#if cityPair.routes.forward in $ProcessedCommutes}
						<div class="grid place-items-center bg-white border rounded-3xl shadow-sm">
							<CityPairSubChart {cityPair} {chartWidth} {chartHeight} />
						</div>
					{/if}
				{/each}
			</div>
		{/if}
	</div>
</div>
