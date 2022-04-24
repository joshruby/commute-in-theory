<script>
	import { afterUpdate } from 'svelte';
    import { ProcessedCommuteStats } from '$lib/stores/CommuteStore'

    export let chartWidth;
    export let chartHeight;
    export let cityPair;

    $: titleSelection = chartWidth >= 1024 ? 'name' : 'code';
    $: titles = {
        forward: `${cityPair.home[titleSelection]}   \u2b62   ${cityPair.work[titleSelection]}`,
        reverse: `${cityPair.work[titleSelection]}   \u2b62   ${cityPair.home[titleSelection]}`
    };

	function createChart() {
        const weekdays = [
            'Sunday', 'Saturday', 'Friday', 'Thursday', 
            'Wednesday', 'Tuesday', 'Monday'
        ];
        
        let data = [];
        let percentile = '75';
        for (const [direction, route] of Object.entries(cityPair.routes)) {
            // Assign plot sub axis labels
            let xaxis;
            let yaxis;
            let showscale;
            switch (direction) {
                case 'forward':
                    xaxis = 'x';
                    yaxis = 'y';
                    showscale = true;
                    break;
                case 'reverse':
                    xaxis = 'x2';
                    yaxis = 'y2'; 
                    showscale = false;
            }

            let routeData = {
                x: [],
                y: weekdays,
                z: [],
                xaxis: xaxis,
                yaxis: yaxis,
                type: 'heatmap',
                showscale: showscale,
                colorscale: [
                    [0.0, '#ffffff'],
                    [1, '#2b71e6']
                ],
                colorbar:{
                    title: "Travel Time (min)",
                },
                hoverinfo: 'text',
            };

            // Retrive the commutes from the store
            const commuteStats = $ProcessedCommuteStats[route]

            // Create a list of departure times for the x axis
            commuteStats.forEach((ele) => {
                routeData.x.push(
                    // Use a constant date for each departure time
                    new Date(2021, 5, 21, ele.departureHour, ele.departureMinute)
                );
            });

            // Build up the data
            weekdays.forEach((weekday) => {
                // Make a row for each day of the week
                let weekdayData = []

                commuteStats.forEach((ele) => {
                    weekdayData.push(
                        (ele.statsByWeekdayInSeconds[weekday].quantiles[percentile] / 60)
                    );
                });

                // Push the weekday row onto data
                routeData.z.push(weekdayData)
            });

            routeData.text = routeData.z.map((row, i) => row.map((item, j) => {
                let weekday = routeData.y[i]
                let hr = routeData.x[j].getHours().toString().padStart(2, '0')
                let min = routeData.x[j].getMinutes().toString().padStart(2, '0')
                let time = hr + ':' + min
                return `${weekday} ${time}<br>` 
                    + `${~~item} min (${percentile}th Percentile)`
            }))

            data.push(routeData)
        }

        const xTitle = 'Departure Time';
        const fontColor = '#6B6B6B';
        const tickFormat = '%H:%M'
        const domainSplit = 0.64;
        var layout = {
            width: chartWidth,
            height: chartHeight,
            margin: {
                l: 80,
                r: 0,
                b: 60,
                t: 30,
                // pad: 4
            },
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
        }

        var config = {
            scrollZoom: true,
            displayModeBar: false
        };

        // Give each chart a unique ID
        Plotly.newPlot(
            `heatmapplot-${cityPair.home.code}-${cityPair.work.code}`,
            data,
            layout,
            config
        );

    }

	afterUpdate(() => {
        createChart()
    });
</script>

<div id={`heatmapplot-${cityPair.home.code}-${cityPair.work.code}`}>
    <!-- Plotly chart will be drawn inside this DIV -->
</div>
