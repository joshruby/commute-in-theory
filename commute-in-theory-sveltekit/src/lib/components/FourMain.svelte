<script>
	import FourDropdown from './FourDimensionSelector.svelte';
	import data from './iris.json';
	import { scaleLinear, scaleOrdinal } from 'd3-scale';
	import { extent } from 'd3-array';
	import FourDimensionSelector from './FourDimensionSelector.svelte';

	// Allow the height and width to be specified
	export let width = 600;
	export let height = 600;
	// Allow the chart dimensions to be specified
	export let xDimension = 'petalLength';
	export let yDimension = 'petalWidth';

	// Image size
	const buffer = 10;
	const axesSpace = 50;

	// User a different color for each flower species
	const colors = ['red', 'green', 'blue'];
	const species = Array.from(new Set(data.map((d) => d.species)));
	// Now maps the colors to the species
	// scaleOrdinal matches values from the domain and range up elementwise
	let colorScale = scaleOrdinal().domain(species).range(colors);

	// Since the extents and scales need to be updated when the dimensions are
	// changed by the user we need to make them reactive
	// Get the range of the data
	$: xExtent = extent(data, (d) => d[xDimension]);
	$: yExtent = extent(data, (d) => d[yDimension]);

	// Create a scale for each axis by interpolating each range
	// d3 scales are functions. If you pass in a value in the
	// domain interval, you'll get back its corresponding value
	// in the range interval
	$: xScale = scaleLinear()
		.domain(xExtent)
		.range([buffer + axesSpace, width - buffer]);
	// yScale range is flipped so that increasing y is viewed as going "up"
	// (pos y is downward by convention in browser coordinate space)
	$: yScale = scaleLinear()
		.domain(yExtent)
		.range([height - buffer - axesSpace, buffer]);
</script>

<!-- The svelte await control structure is irrelevant here since the data 
is being loaded from a local .json file. I'm keeping it in the code 
for future reference -->
{#await data}
	<p>Loading...</p>
{:then iris}
	<svg {height} {width}>
		{#each iris as item}
            <!-- To get the points to animate when changed we need to position
            them using transform rather than cx and cy -->
			<circle
				r="3"
                transform={`translate(${xScale(item[xDimension])} ${yScale(item[yDimension])})`}
				fill={colorScale(item.species)}
			/>
		{/each}

		<!-- Add axes ticks -->
		{#each xScale.ticks() as tick}
			<g transform={`translate(${xScale(tick)} ${height - 20})`}>
				<line y1="-5" y2="0" stroke="black" />
				<text text-anchor="middle" y="20">{tick}</text>
			</g>
		{/each}

		{#each yScale.ticks() as tick}
			<g transform={`translate(0 ${yScale(tick)})`}>
				<line x1="35" x2="40" stroke="black" />
				<text text-anchor="end" dominant-baseline="middle" x="30">{tick}</text>
			</g>
		{/each}

		<!-- Add a legend -->
		<g transform={`translate(${width - 100}, ${height - 100})`}>
			{#each species as species, i}
				<g transform={`translate(0 ${i * 20})`}>
					<rect height="10" width="10" fill={colorScale(species)} />
					<text dominant-baseline="middle" y="5" x="20">{species}</text>
				</g>
			{/each}
		</g>
	</svg>

    <!-- We pass in the dimensions and bind to them so that we can detect when
    they're changed and update the axes -->
	<p>X Dimension: <FourDimensionSelector bind:selectedColumn={xDimension} /></p>
	<p>Y Dimension: <FourDimensionSelector bind:selectedColumn={yDimension} /></p>
{/await}

<style>
    /* Animate all objects when their transform property is changed */
    svg * {
        transition: transform 0.4s;
    }
</style>