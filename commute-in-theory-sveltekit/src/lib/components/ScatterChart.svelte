<script>
    import { CommuteStore } from '$lib/stores/CommuteStore'
    import * as Plot from "@observablehq/plot";

    export let cityPair = 'CUP-SCZ';

    const commutes = $CommuteStore[cityPair]

    console.log(commutes)

    let plot;

    $: {
        plot = Plot.plot({
            grid: true,
            marks: [
                Plot.dot(
                    commutes, 
                    {x: "departureTime", y: "travelTimeInSeconds"}
                )
            ]
        })
    }
</script>

<svg>
    <g bind:this={plot}></g>
</svg>

<!-- <svg height=600 width=600>
  {plot}
</svg> -->

<!-- {plot} -->

<style>
    svg {
        border: 1px solid red;
        width: 900%;
        height: 500px;
    }
</style>