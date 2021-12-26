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
    import { fly } from "svelte/transition";
    import { extent, scaleLinear, scaleTime, line, curveMonotoneX } from 'd3'
    import ChartAxis from './ChartAxis.svelte'

    export let data;

    const xLabel = 'Time of Day';
    const yLabel = 'Travel Time [s]';

	const width = 1200;
	const height = 500;
    const margin = { left: 60, right: 20, top: 60, bottom: 20 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

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
    $: yExtent = extent([0, 7200]);
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
        .y((d) => yScale(d.travelTimeInSeconds));
</script>

<svg>
    <g transform={`translate(${margin.left} ${margin.top})`}>
        <rect 
            width={innerWidth} 
            height={innerHeight} 
            fill="none" 
            stroke="blue" 
            stroke-width="1"
        />

        <ChartAxis {innerHeight} {margin} scale={xScale} position="bottom" />
        <ChartAxis {innerHeight} {margin} scale={yScale} position="left" />

        {#each Object.entries(data) as [date, recordings]}
            {#if date.includes('Sat') || date.includes('Sun')}
                <path class="weekends"
                    d={path(recordings)}
                />
                {#each recordings as item}
                    <!-- To get the points to animate when changed we need to position
                    them using transform rather than cx and cy -->
                    <circle class="weekends"
                        transform={`translate(${xScale(item.departureTimeConstDate)} ${yScale(item.travelTimeInSeconds)})`}
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
                        cy={yScale(item.travelTimeInSeconds)}
                    />
                {/each}
            {/if}
        {/each}

        <text 
            class='axis-label' 
            transform={`translate(${innerWidth / 2} ${innerHeight + margin.bottom})`} 
            dy="1.5em"
            text-anchor="middle" 
            dominant-baseline="hanging"
        >
            {xLabel}
        </text>

        <text 
            class='axis-label' 
            transform={`translate(${-margin.left} ${innerHeight / 2}) rotate(-90)`} text-anchor="middle"
            dominant-baseline="hanging"
        >
            {yLabel}
        </text>
    </g>
</svg>

<style>
    circle.weekdays {
        r: 3;
        fill: black;
    }
    circle.weekends {
        r: 3;
        fill: #aaa;
    }
    path.weekdays {
        stroke: black; 
        stroke-width: 1;
        fill: none;
    }
    path.weekends {
        stroke: #aaa; 
        stroke-width: 1;
        fill: none;
    }

    svg {
        border: 1px solid red;
        width: 100%;
        height: 600px;
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

