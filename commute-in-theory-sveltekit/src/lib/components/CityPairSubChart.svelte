<script>
	// import Plotly from 'plotly.js-dist';
	import { afterUpdate } from 'svelte';
    import { ProcessedCommutes } from '$lib/stores/CommuteStore'

    export let cityPair;
    export let chartWidth;
    export let chartHeight;

    let titles = {
        forward: `${cityPair.home.name}   \u2b62   ${cityPair.work.name}`,
        reverse: `${cityPair.work.name}   \u2b62   ${cityPair.home.name}`
    };

	function createChart() {
        // All traces will be pushed into data
        let data = [];

        for (const [direction, route] of Object.entries(cityPair.routes)) {
            // Retrive the commutes from the store
            const commutes = $ProcessedCommutes[route].grouped.byDate
            
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
                    mode: 'lines',
                    // marker: {
                    //     color: color,
                    //     size: 5
                    // },
                    line: {
                        shape: 'spline',
                        width: 2,
                        color: color,
                    },
                    name: `${date}`,
                    hovertemplate: '%{y:.0f} min',
                    legendgroup: legendgroup,
                    xaxis: xaxis,
                    yaxis: yaxis
                };
                recordings.forEach((recording) => {
                    trace.x.push(
                        recording.departureTimeConstDate
                    );
                    trace.y.push(
                        recording.travelTimeInSeconds / 60
                    );
                });
                data.push(trace);
            }
        }

		var layout = {
			width: chartWidth,
			height: chartHeight,
            margin: {
                l: 60,
                r: 0,
                b: 60,
                t: 60,
                // pad: 4
            },
            // title: `${title}`,
			xaxis: {
				title: 'Departure Time',
                titlefont: {
                    color: 'rgb(107, 107, 107)',
                },
                tickformat: '%H:%M',
                tickfont: {
                    color: 'rgb(107, 107, 107)',
                },
                anchor: 'y',
                domain: [0, 1]
			},
            xaxis2: {
				title: 'Departure Time',
                titlefont: {
                    color: 'rgb(107, 107, 107)',
                },
                tickformat: '%H:%M',
                tickfont: {
                    color: 'rgb(107, 107, 107)',
                },
                anchor: 'y2',
                domain: [0, 1]
			},
			yaxis: {
				title: 'Travel Time (min)',
                titlefont: {
                    color: 'rgb(107, 107, 107)',
                },
                tickfont: {
                    color: 'rgb(107, 107, 107)',
                },
                anchor: 'x',
                domain: [0.64, 1]
			},
            yaxis2: {
				title: 'Travel Time (min)',
                titlefont: {
                    color: 'rgb(107, 107, 107)',
                },
                tickfont: {
                    color: 'rgb(107, 107, 107)',
                },
                anchor: 'x2',
                domain: [0, 0.36]
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

        // Give each chart a unique ID
        Plotly.newPlot(`plot-${cityPair.home.code}-${cityPair.work.code}`, data, layout, config);
	}

	afterUpdate(createChart);
</script>

<div 
    id={`plot-${cityPair.home.code}-${cityPair.work.code}`} 
    class="plot"
>
    <!-- Plotly chart will be drawn inside this DIV -->
</div>

<style>
    .plot {
        padding: 10px;
    }
</style>