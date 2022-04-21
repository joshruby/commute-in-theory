<script>
	import { afterUpdate } from 'svelte';
    import { ProcessedCommuteStats } from '$lib/stores/CommuteStore'
    import WeekdaySelector from '$lib/components/WeekdaySelector.svelte';

    export let chartWidth;
    export let chartHeight;
    export let cityPairs;

    let weekdaySelection = 'Business';

    let titles = {
        forward: `Home   \u2b62   Work`,
        reverse: `Work   \u2b62   Home`
    };

	function createChart(weekday) {
        // All traces will be pushed into data
        let data = [];

        // Set the chart hovermode
        let hovermode = 'closest'

        // Define a consistent trace color
        let traceColors = ['#a4c2f4', '#b6d7a8', '#d5a6bd', '#adadad', '#f9cb9c', '#95b19a'];

        // Make a custom legend with annotations for each route
        let customLegendAnnotations = [];

        cityPairs.forEach((cityPair, i) => {
            for (const [direction, route] of Object.entries(cityPair.routes)) {
                customLegendAnnotations.push(
                    {
                        x: 1 - i * 0.15,
                        xref: 'x domain',
                        xanchor: 'right',
                        y: 1.25,
                        yref: 'y domain',
                        text: `${cityPair.home.code} \u2B82 ${cityPair.work.code}`,
                        font: {
                            size: '14',
                            color: traceColors[i]
                        },
                        showarrow: false,
                        align: 'center',
                        // bgcolor: 'white',
                        // bordercolor: traceColors[i],
                        // borderwidth: 2,
                        borderpad: 2,
                        
                    }
                );

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

                // Quantile traces
                // Append the traces in logical order so fill "tonexty" can be used
                const quantiles = [10, 90, 25, 75, 50]
                for (const q of quantiles) {
                    // Plot a line for the median and shade between the 10-90 and 25-75 quantiles
                    let fill = 'none';
                    let mode = 'none';
                    let line = 'none';
                    let fillcolor = 'none';
                    if (q == 50) {
                        mode = 'lines';
                        line = { shape: 'spline', width: 3, color: traceColors[i]};
                    } else if (q == 10 || q == 90 ||q == 25 ||q == 75) {
                        line = { shape: 'spline', width: 0, color: traceColors[i] };
                        
                        if (q == 75) {
                            fill = 'tonexty';
                            fillcolor = traceColors[i] + '60';
                        } else if (q == 90) {
                            fill = 'tonexty';
                            fillcolor = traceColors[i] + '40';
                        }
                    }

                    // Make a trace for each quantile in the list (really they're percentiles)
                    let trace = {
                        x: [],
                        y: [],
                        // mode,
                        line,
                        fill,
                        fillcolor,
                        name: `${route} ${q}th`,
                        hovertemplate: '%{y:.0f} min',
                        legendgroup: `${route}`,
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
                
                // Min and max traces
                for (const extreme of ['min', 'max']) {
                    // Make a trace for each quantile
                    let trace = {
                        x: [],
                        y: [],
                        line: { dash: 'dot', shape: 'spline', width: 1, color: traceColors[i] + 'b0' },
                        name: `${route} ${extreme}`,
                        hovertemplate: '%{y:.0f} min',
                        legendgroup: `${route}`,
                        xaxis: xaxis,
                        yaxis: yaxis
                    };

                    commuteStats.forEach((ele) => {
                        trace.x.push(
                            // Use a constant date for each departure time
                            new Date(2021, 5, 21, ele.departureHour, ele.departureMinute)
                        );
                        trace.y.push(
                            ele.statsByWeekdayInSeconds[weekday][extreme] / 60
                        );
                    });

                    // Add the trace to the list of traces
                    data.push(trace);
                }
            }
        });

        const xTitle = 'Departure Time';
        const yTitle = 'Travel Time (min)';
        const fontColor = '#6B6B6B';
        const tickFormat = '%H:%M'
        const domainSplit = 0.64;
		var layout = {
			width: chartWidth,
			height: chartHeight,
            margin: {
                l: 60,
                r: 0,
                b: 60,
                t: 30,
                // pad: 4
            },
            // title: `${title}`,
			xaxis: {
				title: xTitle,
                titlefont: {
                    traceColor: fontColor,
                },
                tickformat: tickFormat,
                tickfont: {
                    traceColor: fontColor,
                },
                anchor: 'y',
                domain: [0, 1]
			},
            xaxis2: {
				title: xTitle,
                titlefont: {
                    traceColor: fontColor,
                },
                tickformat: tickFormat,
                tickfont: {
                    traceColor: fontColor,
                },
                anchor: 'y2',
                domain: [0, 1]
			},
			yaxis: {
				title: yTitle,
                titlefont: {
                    traceColor: fontColor,
                },
                tickfont: {
                    traceColor: fontColor,
                },
                anchor: 'x',
                domain: [domainSplit, 1]
			},
            yaxis2: {
				title: yTitle,
                titlefont: {
                    traceColor: fontColor,
                },
                tickfont: {
                    traceColor: fontColor,
                },
                anchor: 'x2',
                domain: [0, 1 - domainSplit]
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
                // ...customLegendAnnotations
            ],
            hovermode,
			showlegend: true
		};

        var config = {
            scrollZoom: true,
            displayModeBar: false
        };

        // Give each chart a unique ID
        Plotly.newPlot('comparison chart', data, layout, config);
    }

	afterUpdate(() => {
        createChart(weekdaySelection)
    });
</script>

<div class="grid place-items-center p-4 bg-white border rounded-3xl shadow-sm">
    <div class="flex items-center justify-around w-full mb-4">
        <div>
            <WeekdaySelector bind:weekdaySelection={weekdaySelection} />
        </div>
        <!-- <div>
            <ToggleBtn bind:toggleChecked={showRaw} name="showRaw" label="Show Raw Data" />
        </div> -->
    </div>
    <div id="comparison chart">
        <!-- Plotly chart will be drawn inside this DIV -->
    </div>
</div>
