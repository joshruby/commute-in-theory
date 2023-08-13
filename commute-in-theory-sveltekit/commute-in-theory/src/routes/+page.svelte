
<script>
    import { processCommuteStats } from '$lib/utils';
    import { ProcessedCommuteStats } from '$lib/Stores/CommuteStore';
    import { CityPairs } from '$lib/Stores/LocationStore';
    import HomeCitySelector from '$lib/Components/HomeCitySelector.svelte';
    import ChartCard from '$lib/Components/ChartCard.svelte';
    import CityPairComparisonChart from '$lib/Components/CityPairComparisonChart.svelte';
    import CityPairScatterChart from '$lib/Components/CityPairScatterChart.svelte';
    import CityPairHeatmapChart from '$lib/Components/CityPairHeatmapChart.svelte';

	export let data;

    // Fetch the commute stats on load(), process them, and then
    // set the ProcessedCommuteStats store
    const processedCommuteStats = processCommuteStats(data.stats)
    ProcessedCommuteStats.set(processedCommuteStats);

    let selectedCities = [];
    $: selectedCityPairs = $CityPairs.filter(
        cityPair => selectedCities.includes(cityPair.home.code)
    );

    let containerWidth;
    $: chartWidth = containerWidth > 1024 ? 1024 : (containerWidth - 60)
	let chartHeight = 400;
</script>

<div bind:clientWidth={containerWidth}>
	<div class="grid grid-cols-1 place-items-center gap-4">
        <HomeCitySelector bind:selectedCities={selectedCities} />

        {#if selectedCityPairs.length}
            <ChartCard>
                <CityPairComparisonChart cityPairs={selectedCityPairs} {chartWidth} {chartHeight} />
            </ChartCard>
        {/if}
        {#each selectedCityPairs as cityPair}
            <ChartCard>
                <CityPairScatterChart {cityPair} {chartWidth} {chartHeight} />
                <div class="my-8 border-b w-3/4"></div>
                <CityPairHeatmapChart {cityPair} {chartWidth} {chartHeight} />
            </ChartCard>	
        {/each} 
	</div>
</div>