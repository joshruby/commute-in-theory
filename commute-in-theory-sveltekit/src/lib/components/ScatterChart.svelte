<script>
    import { beforeUpdate, afterUpdate, onMount } from 'svelte';
    import { CommuteStore } from '$lib/stores/CommuteStore'
    import * as Plot from "@observablehq/plot";

    export let cityPair = 'CUP-SCZ';

    // const data = [
    //     {x: 1, y:100},
    //     {x: 2, y:50},
    //     {x: 3, y:200},
    //     {x: 4, y:75},
    //     {x: 5, y:100},
    //     {x: 6, y:50},
    //     {x: 7, y:200},
    //     {x: 8, y:75},
    // ];
    
    let data = [];
    const max = 100;
    for (let i = 0; i < 100; i++) {
        data.push({
            x: i,
            y: Math.floor(Math.random() * (max + Math.pow(i, 2)))
        })
        
    }

    const commutes = $CommuteStore[cityPair]
    // console.log(commutes);

    let div;
    
    onMount(() => {
        const svgPlot = Plot.plot({
            grid: true,
            marks: [
                Plot.dot(
                    data, 
                    {x: "x", y: "y"}
                )
            ]
        });

        div.appendChild(svgPlot);
    });
</script>

<div class="plot" bind:this={div} />

<style>
    div.plot {
        border: 1px solid red;
        width: 800px;
        height: 600px;
    }

    /* svg {
        border: 1px solid blue;
    } */
</style>