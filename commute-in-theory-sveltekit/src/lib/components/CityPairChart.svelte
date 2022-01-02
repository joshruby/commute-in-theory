<script>
	// import Plotly from 'plotly.js-dist';
	import { afterUpdate } from 'svelte';

	function createChart() {
        var trace1 = {
            x: [1, 2, 3, 4],
            y: [10, 15, 13, 17],
            type: 'scatter'
	    };
        var trace2 = {
            x: [1, 2, 3, 4],
            y: [16, 5, 11, 9],
            type: 'scatter'
        };
        var data = [trace1, trace2];

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

<main>
    <div id="plot">
    <!-- Plotly chart will be drawn inside this DIV -->
    </div>
</main>

<style>
    #plot {
        border: 1px solid red;
        max-width: 800px;
    }
</style>