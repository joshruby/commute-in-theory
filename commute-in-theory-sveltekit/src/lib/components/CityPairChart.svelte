<script>
	// import Plotly from 'plotly.js-dist';
	import { afterUpdate } from 'svelte';
    import { ProcessedCommutes, ProcessedCommuteStats } from '$lib/stores/CommuteStore'
    import WeekdaySelector from '$lib/components/WeekdaySelector.svelte';
    import CityPairHeatmapChart from '$lib/components/CityPairHeatmapChart.svelte';

    export let chartWidth;
    $: console.log(chartWidth)
    export let chartHeight;
    export let cityPair;

    let weekdaySelection = 'Business';
    let showRaw = false;

    $: titleSelection = chartWidth >= 1024 ? 'name' : 'code';
    $: titles = {
        forward: `${cityPair.home[titleSelection]}   \u2b62   ${cityPair.work[titleSelection]}`,
        reverse: `${cityPair.work[titleSelection]}   \u2b62   ${cityPair.home[titleSelection]}`
    };

	function createChart(weekday) {
        // All traces will be pushed into data
        let data = [];

        // Set the chart hovermode
        let hovermode = 'compare'

        // Define a consistent trace color
        let traceColor = '#a4c2f4';

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
                    line = { shape: 'spline', width: 3, color: traceColor};
                } else if (q == 10 || q == 90 ||q == 25 ||q == 75) {
                    line = { shape: 'spline', width: 0, color: traceColor };
                    
                    if (q == 75) {
                        fill = 'tonexty';
                        fillcolor = traceColor + '60';
                    } else if (q == 90) {
                        fill = 'tonexty';
                        fillcolor = traceColor + '40';
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
                    name: `${q}th Percentile`,
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
             
            // Min and max traces
            // for (const extreme of ['min', 'max']) {
            //     // Make a trace for each quantile
            //     let trace = {
            //         x: [],
            //         y: [],
            //         line: { dash: 'dot', shape: 'spline', width: 1, color: traceColor + 'b0' },
            //         name: `${extreme}`,
            //         hovertemplate: '%{y:.0f} min',
            //         xaxis: xaxis,
            //         yaxis: yaxis
            //     };

            //     commuteStats.forEach((ele) => {
            //         trace.x.push(
            //             // Use a constant date for each departure time
            //             new Date(2021, 5, 21, ele.departureHour, ele.departureMinute)
            //         );
            //         trace.y.push(
            //             ele.statsByWeekdayInSeconds[weekday][extreme] / 60
            //         );
            //     });

            //     // Add the trace to the list of traces
            //     data.push(trace);
            // }

            // Raw data traces
            if (showRaw === true) {
                // Retrive the commutes from the store
                const commutes = $ProcessedCommutes[route].grouped.byDate

                // Make a trace for each day of recordings 
                for (const [date, recordings] of Object.entries(commutes)) {
                    let traceColor;
                    let legendgroup;
                    
                    if (date.includes('Sat') || date.includes('Sun')){
                        traceColor = '#c8c8c8';
                        legendgroup = `Weekends - ${route}`;
                    } else {
                        legendgroup = `Weekdays - ${route}`
                    }

                    let trace = {
                        x: [],
                        y: [],
                        mode: 'lines',
                        // marker: {
                        //     traceColor: traceColor,
                        //     size: 5
                        // },
                        line: {
                            shape: 'spline',
                            width: 1,
                            traceColor: traceColor,
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
            ],
            hovermode,
			showlegend: false
		};

        var config = {
            scrollZoom: true,
            displayModeBar: false
        };

        // Give each chart a unique ID
        Plotly.newPlot(`scatterplot-${cityPair.home.code}-${cityPair.work.code}`, data, layout, config);
	    
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
    <div id={`scatterplot-${cityPair.home.code}-${cityPair.work.code}`}>
        <!-- Plotly chart will be drawn inside this DIV -->
    </div>
    <div class="my-8 border-b w-3/4"></div>
    <CityPairHeatmapChart {cityPair} {chartWidth} {chartHeight} />
</div>
