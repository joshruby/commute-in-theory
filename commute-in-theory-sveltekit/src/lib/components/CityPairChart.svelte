<script>
	// import Plotly from 'plotly.js-dist';
	import { afterUpdate } from 'svelte';
    import { ProcessedCommutes } from '$lib/stores/CommuteStore'
    import { Locations } from '$lib/stores/LocationStore'

    export let cityComb;  

    const cityPairs = [
        `${cityComb[0]}-${cityComb[1]}`,
        `${cityComb[1]}-${cityComb[0]}`
    ];

	function createChart() {
        // Structure the commutes in plotly trace objects
        // Make a trace for each day of recordings 
        let data = [];
        cityPairs.forEach((cityPair, i) => {
            // Retrive the commutes from the store
            const commutes = $ProcessedCommutes[cityPair]
            // Assign plot sub axis labels
            let xaxis;
            let yaxis;
            switch (i) {
                case 0:
                    xaxis = 'x';
                    yaxis = 'y';
                    break;
                case 1:
                    xaxis = 'x2';
                    yaxis = 'y2'; 
            }

            for (const [date, recordings] of Object.entries(commutes)) {
                let color;
                let legendgroup;
                if (date.includes('Sat') || date.includes('Sun')){
                    color = 'rgb(170, 170, 170)';
                    legendgroup = 'weekends';
                } else {
                    color = 'rgb(164, 194, 244)';
                    legendgroup = 'weekdays'
                }

                let trace = {
                    x: [],
                    y: [],
                    mode: 'lines+markers',
                    marker: {
                        color: color,
                        size: 6
                    },
                    name: `${date}`,
                    hovertemplate: '%{y} min<extra></extra>',
                    legendgroup: legendgroup,
                    showlegend: false,
                    xaxis: xaxis,
                    yaxis: yaxis
                };
                recordings.forEach((recording) => {
                    trace.x.push(
                        recording.departureTimeConstDate
                    );
                    trace.y.push(
                        Math.floor(recording.travelTimeInSeconds / 60)
                    );
                });
                data.push(trace);
            }
        });

        console.log(data)

		var layout = {
			width: 950,
			height: 500,
            y_title: 'Your master y-title',
			xaxis: {
				// title: 'Departure Time',
                tickformat: '%H:%M',
                anchor: 'y',
                domain: [0, 1]
			},
            xaxis2: {
				title: 'Departure Time',
                tickformat: '%H:%M',
                anchor: 'y2',
                domain: [0, 1]
			},
			yaxis: {
				// title: 'Travel Time (min)',
                anchor: 'x',
                domain: [0.52, 1]
			},
            yaxis2: {
				// title: 'Travel Time (min)',
                anchor: 'x2',
                domain: [0, 0.48]
			},
            hovermode:'closest',
			showlegend: true
		};

        var config = {
            scrollZoom: true,
            displayModeBar: false
        };

        // Plotly.purge(`plot-${cityPair}`);
        Plotly.newPlot(`plot`, data, layout, config);
	}

	afterUpdate(createChart);
</script>

<div id={`plot`}>
<!-- Plotly chart will be drawn inside this DIV -->
</div>