
<script>
    import { processCommuteStats } from '$lib/utils';
    import { ProcessedCommuteStats } from '$lib/Stores/CommuteStore';
    import { CityPairs } from '$lib/Stores/LocationStore';
    import ChartCard from '$lib/Components/ChartCard.svelte';
    import CityPairComparisonChart from '$lib/Components/CityPairComparisonChart.svelte';
    import CityPairScatterChart from '$lib/Components/CityPairScatterChart.svelte';
    import CityPairHeatmapChart from '$lib/Components/CityPairHeatmapChart.svelte';

	export let data;

    // Fetch the commute stats on load(), process them, and then
    // set the ProcessedCommuteStats store
    const processedCommuteStats = processCommuteStats(data.stats)
    ProcessedCommuteStats.set(processedCommuteStats);

    let containerWidth;
    $: chartWidth = containerWidth > 1024 ? 1024 : (containerWidth - 60)
	let chartHeight = 400;
</script>

<div bind:clientWidth={containerWidth}>
	<div class="grid grid-cols-1 place-items-center gap-4">	   
        <ChartCard>
            <CityPairComparisonChart cityPairs={$CityPairs} {chartWidth} {chartHeight} />
        </ChartCard>
        {#each $CityPairs as cityPair}
            <ChartCard>
                <CityPairScatterChart {cityPair} {chartWidth} {chartHeight} />
                <div class="my-8 border-b w-3/4"></div>
                <CityPairHeatmapChart {cityPair} {chartWidth} {chartHeight} />
            </ChartCard>	
        {/each} 
	</div>
</div>