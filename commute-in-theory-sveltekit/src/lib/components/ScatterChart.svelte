<script>
    import { onMount } from 'svelte';
    import * as Plot from "@observablehq/plot";

    let data = [];
    const max = 10;
    for (let i = 0; i < 100; i++) {
        data.push({
            x: i,
            y: Math.floor(Math.random() * (max + Math.pow(i, 3) / 1000))
        })
        
    }

    // Instantiate a variable to bind the plot's parent div element to
    let div;
    
    onMount(() => {
        // Create the plot (Plot.plot returns an SVG element)
        const svgPlot = Plot.plot({
            grid: true,
            marks: [
                Plot.dot(
                    data, 
                    {x: "x", y: "y"}
                )
            ]
        });
        // Insert the plot SVG into the DOM under the parent div
        div.append(svgPlot);

        // Change its attributes and elements as necessary
        svgPlot.setAttribute(
            "width", "800px",
        )
        svgPlot.querySelectorAll("circle").forEach(
            (circle) => circle.setAttribute("fill", "red")
        );
    });
</script>

<div class="plot" bind:this={div} />

<style>
    div.plot {
        border: 1px solid red;
    }
</style>