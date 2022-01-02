<script>
	// import Plotly from 'plotly.js-dist';
	import { afterUpdate } from 'svelte';

    export let commutes;

	function createChart() {
        // Prepare the trace data
        const testCommutes = [
            { x: 1, y: 5 },
            { x: 2, y: 8 },
            { x: 3, y: 10 },
            { x: 4, y: 1 },
        ];
        let trace1 = {
            x: [],
            y: [],
            mode: "scatter"
        };
        testCommutes.forEach((val) => {
            trace1.x.push(val['x']);
            trace1.y.push(val['y']);
        });
        var data = [trace1];

		var layout = {
			autosize: true,
			width: 800,
			height: 500,
			xaxis: {
				title: 'Test',
			},
			yaxis: {
				title: 'Test',

			},
			showlegend: true
		};

        var config = {
            scrollZoom: true,
            displayModeBar: false
        };

        Plotly.newPlot(plot, data, layout, config);
	}

	afterUpdate(createChart);
</script>

<div class="container">
    <div id="plot">
    <!-- Plotly chart will be drawn inside this DIV -->
    </div>
</div>

<style>
    .container {
        border: 2px solid red;
        border-radius: 6px;
        max-width: 850px;
    }
</style>