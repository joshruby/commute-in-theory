<!-- 

Resources

https://bl.ocks.org/mbostock/3371592

 -->

<script>
	import { onMount } from 'svelte';
	import { select, selectAll, axisBottom, axisLeft, timeMinute, timeFormat } from 'd3';

	export let innerHeight;
	export let innerWidth;
	export let position;
	export let scale;

	let transform;
	let gAxis;
	let gGrid;
    
	onMount(() => {
		let axis;
        let grid;

        select(gAxis).selectAll('*').remove();
		select(gGrid).selectAll('*').remove();

		switch (position) {
			case 'bottom':
				transform = `translate(0, ${innerHeight})`;

				// Configure the axis and ticks
				axis = axisBottom(scale).ticks(timeMinute.every(60), timeFormat('%-I %p')).tickSizeOuter(0);
				select(gAxis).call(axis);
				// .selectAll("text")  // Rotate the tick labels for readability
				//     //     .style("text-anchor", "end")
				//     //     .attr("dx", "-1em")
				//     //     .attr("dy", "0em")
				//     //     .attr("transform", "rotate(-65)");

				// Configure the grid lines
				grid = axisBottom(scale).tickSize(-innerHeight).tickFormat('').tickSizeOuter(0);
				select(gGrid).attr('id', 'gridX').call(grid);
				// select("g#gridX").select("domain").remove();

				// Remove the duplicate paths (the x = and y = 0 axis lines)
				selectAll('g#gridX').select('path').remove();

				// Remove the first and last grid lines
				selectAll('g.grid')
					.selectAll('.tick')
					.filter((tick, i, list) => {
						if (i === 0 || i === list.length - 1) {
							return true;
						}
					})
					.attr('visibility', 'hidden');

				break;

			case 'left':
				// transform = `translate(0 0)`;

				// Configure the axis and ticks
				axis = axisLeft(scale).ticks();
				select(gAxis).call(axis);

				// Configure the grid lines
				grid = axisLeft(scale).tickSize(-innerWidth).tickFormat('');
				select(gGrid).attr('id', 'gridY').call(grid);

				// Remove the duplicate paths (the x = and y = 0 axis lines)
				selectAll('g#gridY').select('path').remove();

				// Remove the first and last grid lines
				selectAll('g.grid')
					.selectAll('.tick')
					.filter((tick, i, list) => {
						if (i === 0 || i === list.length - 1) {
							return true;
						}
					})
					.attr('visibility', 'hidden');

				break;
		}

		// Style the grids
		selectAll('g.grid').selectAll('line').attr('stroke', '#aaa').style('stroke-dasharray', '2');
	});
</script>

<g class="axis" bind:this={gAxis} {transform} />
<g class="grid" bind:this={gGrid} {transform} />
