<!-- TODO

 - Style axis and title labels
 - Figure out legend groups
 - Add date to over info -->


<script>
	// import Plotly from 'plotly.js-dist';
	import { afterUpdate } from 'svelte';
    import { ProcessedCommutes } from '$lib/stores/CommuteStore'
    import { Locations } from '$lib/stores/LocationStore'

    export let cityPair;

    let titles = {
        forward: 
            `${$Locations.home[cityPair.home].name} \u2013 ` +
            `${$Locations.work[cityPair.work].name}`,
        reverse:
            `${$Locations.work[cityPair.work].name} \u2013 ` +
            `${$Locations.home[cityPair.home].name}`
    };

	function createChart() {
        // All traces will be pushed into data
        let data = [];

        for (const [direction, route] of Object.entries(cityPair.routes)) {
            // Retrive the commutes from the store
            const commutes = $ProcessedCommutes[route]
            
            // Assign plot sub axis labels
            let xaxis;
            let yaxis;
            switch (direction) {
                case 'forward':
                    xaxis = 'x';
                    yaxis = 'y';
                    break;
                case 'reverse':
                    xaxis = 'x2';
                    yaxis = 'y2'; 
            }

            // Make a trace for each day of recordings 
            for (const [date, recordings] of Object.entries(commutes)) {
                let color;
                let legendgroup;
                if (date.includes('Sat') || date.includes('Sun')){
                    color = 'rgb(170, 170, 170)';
                    legendgroup = `Weekends - ${route}`;
                } else {
                    color = 'rgb(164, 194, 244)';
                    legendgroup = `Weekdays - ${route}`
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
                    hovertemplate: '%{y} min',
                    legendgroup: legendgroup,
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
        }

		var layout = {
			width: 950,
			height: 700,
            // title: `${title}`,
			xaxis: {
				title: 'Departure Time',
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
				title: 'Travel Time (min)',
                anchor: 'x',
                domain: [0.65, 1]
			},
            yaxis2: {
				title: 'Travel Time (min)',
                anchor: 'x2',
                domain: [0, 0.35]
			},
            annotations: [
                {
                    text: `${titles.forward}`,
                    font: {
                        size: '16',
                    },
                    showarrow: false,
                    x: 0,
                    xref: 'x domain',
                    y: 1.25,
                    yref: 'y domain'
                },
                {
                    text: `${titles.reverse}`,
                    font: {
                        size: '16',
                    },
                    showarrow: false,
                    x: 0,
                    xref: 'x2 domain',
                    y: 1.25,
                    yref: 'y2 domain'
                },
            ],
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

<div class="chart">
    <div id={`plot`}>
    <!-- Plotly chart will be drawn inside this DIV -->
    </div>
</div>

<style>
    .chart {
        max-width: 950px;
    }
</style>