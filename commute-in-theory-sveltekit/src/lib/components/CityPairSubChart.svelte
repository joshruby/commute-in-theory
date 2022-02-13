<script>
	// import Plotly from 'plotly.js-dist';
	import { afterUpdate } from 'svelte';
    import { ProcessedCommutes, ProcessedCommuteStats } from '$lib/stores/CommuteStore'
    import ChartWeekdaySelector from '$lib/components/ChartWeekdaySelector.svelte';
    import ToggleBtn from '$lib/components/ToggleBtn.svelte';

    export let chartWidth;
    export let chartHeight;
    export let cityPair;

    let weekdaySelection = 'All';
    let showRaw = false;

    let titles = {
        forward: `${cityPair.home.name}   \u2b62   ${cityPair.work.name}`,
        reverse: `${cityPair.work.name}   \u2b62   ${cityPair.home.name}`
    };

	function createChart(weekday) {
        // All traces will be pushed into data
        let data = [];

        // Set the chart hovermode
        let hovermode = 'compare'

        for (const [direction, route] of Object.entries(cityPair.routes)) {
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

            // Retrive the commutes from the store
            const commuteStats = $ProcessedCommuteStats[route]

            // Append the traces in logical order so fill "tonexty" can be used
            const quantiles = [10, 90, 25, 75, 50]
            for (const q of quantiles) {
                // Plot a line for the median and shade between the 10-90 and 25-75 quantiles
                let fill = 'none';
                let mode = 'none';
                let line = 'none';
                let fillcolor = 'none';
                let color = '#a4c2f4';
                if (q == 50) {
                    mode = 'lines';
                    line = { shape: 'spline', width: 3, color};
                } else if (q == 10 || q == 90 ||q == 25 ||q == 75) {
                    line = { shape: 'spline', width: 0, color };
                    
                    if (q == 75 || q == 90) {
                        fill = 'tonexty';
                        fillcolor = color + '50';
                    }
                }

                // Make a trace for each quantile
                let trace = {
                    x: [],
                    y: [],
                    // mode,
                    line,
                    fill,
                    fillcolor,
                    name: `${q}th Quantile`,
                    hovertemplate: '%{y:.0f} min',
                    xaxis: xaxis,
                    yaxis: yaxis
                };

                commuteStats.forEach((ele) => {
                    trace.x.push(
                        // Use a constant date for each departure time
                        new Date(2021, 5, 21, ele.departureHour, ele.departureMinute)
                    );
                    trace.y.push(
                        ele.statsByWeekdayInSeconds[weekday].quantiles[q.toString()] / 60
                    );
                });

                // Add the trace to the list of traces
                data.push(trace);
            }
                    
            if (showRaw === true) {
                // Retrive the commutes from the store
                const commutes = $ProcessedCommutes[route].grouped.byDate

                // Make a trace for each day of recordings 
                for (const [date, recordings] of Object.entries(commutes)) {
                    let color;
                    let legendgroup;
                    
                    if (date.includes('Sat') || date.includes('Sun')){
                        color = '#c8c8c8';
                        legendgroup = `Weekends - ${route}`;
                    } else {
                        color = '#a4c2f4';
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
                            width: 1,
                            color: color,
                        },
                        opacity: 0.4,
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
                
                // Change the hovermode
                hovermode='closest'
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
            hovermode,
			showlegend: false
		};

        var config = {
            scrollZoom: true,
            displayModeBar: false
        };

        // Give each chart a unique ID
        Plotly.newPlot(`plot-${cityPair.home.code}-${cityPair.work.code}`, data, layout, config);
	    
    }

	afterUpdate(() => {
        createChart(weekdaySelection)
    });
</script>

<div class="grid place-items-center p-4 bg-white border rounded-3xl shadow-sm">
    <div class="flex items-center justify-around w-full mb-4">
        <div>
            <ChartWeekdaySelector bind:weekdaySelection={weekdaySelection} />
        </div>
        <!-- <div>
            <ToggleBtn bind:toggleChecked={showRaw} name="showRaw" label="Show Raw Data" />
        </div> -->
    </div>
    <div id={`plot-${cityPair.home.code}-${cityPair.work.code}`}>
        <!-- Plotly chart will be drawn inside this DIV -->
    </div>
</div>
