<!-- 
    
    Resources

    https://svelte.dev/examples/scatterplot
    https://bl.ocks.org/curran/3f2ff2e32652397de94d406460e240ce
    https://github.com/TomFevrier/svelte-d3-demo
    https://dev.to/learners/line-chart-with-svelte-and-d3-3086 
    https://github.com/TomFevrier/svelte-d3-demo/
    https://github.com/AnupJoseph/svelteLearn

-->


<script>
    import { CommuteStore } from '$lib/stores/CommuteStore'
    import { fly } from "svelte/transition";
    import { extent, scaleLinear, scaleTime, line, curveMonotoneX } from 'd3'
    import ChartAxis from './ChartAxis.svelte'

    export let cityPair;
    
    const data = $CommuteStore[cityPair]

    const xLabel = 'Time of Day';
    const yLabel = 'Travel Time (min)';

	let width = 700;
	let height = 400;
    const margin = { left: 60, right: 15, top: 50, bottom: 15 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const dotSize = 2;

    let sampleDay;
    // Select a full day of recordings to set the extents
    Object.values(data).some((value) => {
        sampleDay = value;
        return value.length >= 60;
    });

    $: xExtent = extent(sampleDay, (d) => d.departureTimeConstDate);
    // The sampleDay will most likely not happen to be the day with the min or
    // max travel time. That's ok though. Having a consistent scale between city 
    // pair charts is probably better 
    $: yExtent = extent([0, 7200 / 60]);
	// $: yExtent = extent(sampleDay, (d) => d.travelTimeInSeconds);

    // Create a scale for each axis by interpolating each range
	// d3 scales are functions. If you pass in a value in the
	// domain interval, you'll get back its corresponding value
	// in the range interval
	$: xScale = scaleTime()
		.domain(xExtent)
		.range([0, innerWidth])
        .nice();
	// yScale range is flipped so that increasing y is viewed as going "up"
	// (pos y is downward by convention in browser coordinate space)
	$: yScale = scaleLinear()
		.domain(yExtent)
		.range([innerHeight, 0])
        .nice();

    $: path = line()
        .curve(curveMonotoneX)
        .x((d) => xScale(d.departureTimeConstDate))
        .y((d) => yScale(d.travelTimeInSeconds / 60));
</script>

<div class="chart">
    <svg>
        <g transform={`translate(${margin.left} ${margin.top})`}>
            <!-- <rect
                width={innerWidth}
                height={innerHeight}
                fill="none"
                stroke="blue"
                stroke-width="1"
            /> -->
    
            <ChartAxis {innerHeight} {innerWidth} scale={xScale} position="bottom" />
            <ChartAxis {innerHeight} {innerWidth} scale={yScale} position="left" />
    
            <!-- Chart title -->
            <text class="title"
                transform={`translate(${innerWidth / 50} -10)`}
                text-anchor="start"
            >
                {cityPair}
            </text>
    
            {#each Object.entries(data) as [date, recordings]}
                {#if date.includes('Sat') || date.includes('Sun')}
                    <path class="weekends"
                        d={path(recordings)}
                    />
                    {#each recordings as item}
                        <!-- To get the points to animate when changed we need to position
                        them using transform rather than cx and cy -->
                        <circle class="weekends"
                            cx={xScale(item.departureTimeConstDate)}
                            cy={yScale(item.travelTimeInSeconds / 60)}
                            r={dotSize}
                        />
                    {/each}
                {:else}
                    <path class="weekdays"
                        d={path(recordings)}
                    />
                    {#each recordings as item, i}
                        <!-- To get the points to animate when changed we need to position
                        them using transform rather than cx and cy -->
                        <circle class="weekdays"
                            cx={xScale(item.departureTimeConstDate)}
                            cy={yScale(item.travelTimeInSeconds / 60)}
                            r={dotSize}
                        />
                    {/each}
                {/if}
            {/each}
    
            <text
                class='axis-label'
                transform={`translate(${innerWidth / 2} ${innerHeight + margin.bottom})`}
                dy="1em"
                text-anchor="middle"
                dominant-baseline="hanging"
            >
                {xLabel}
            </text>
    
            <text
                class='axis-label'
                transform={`translate(${-margin.left} ${innerHeight / 2}) rotate(-90)`}
                dy="1em"
                text-anchor="middle"
                dominant-baseline="bottom"
            >
                {yLabel}
            </text>
        </g>
    </svg>
</div>

<style>
    /* .chart {
		width: 100%;
		max-width: 800px;
	} */

    circle.weekdays {
        fill: #0b4f6c;
    }
    
    circle.weekends {
        fill: #757575;
    }
    
    path.weekdays {
        stroke: #0b4f6c; 
        stroke-width: 1px;
        fill: none;
    }
    
    path.weekends {
        stroke: #757575; 
        stroke-width: 1px;
        fill: none;
    }

    svg {
        width: 715px;
        height: 440px;
    }

    text.axis-label {
        font-size: 1.2em;
    }

    .title {
        font-size: 1.75rem;
    }

    /* .weekdays, .weekends {
        animation: fadeInAnimation ease 2s;
        animation-iteration-count: 1;
        animation-fill-mode: forwards;
    }

    @keyframes fadeInAnimation {
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
     }
    } */
</style>

