<script>
    import { CommuteStore } from '$lib/stores/CommuteStore'
    import * as Plot from "@observablehq/plot";

    export let cityPair = 'CUP-SCZ';

    const commutes = $CommuteStore[cityPair]

    console.log(commutes)

    const plot = Plot.plot({
        grid: true,
        marks: [
            Plot.dot(
                commutes, 
                {x: "departureTimeLocaleString", y: "travelTimeInSeconds"}
            )
        ]
    })
</script>

{plot}

<!-- <svg height=600 width=600>
  {plot}
</svg> -->

<!-- {plot} -->

<!-- <style>
    svg {
        border: 1px solid red;
        width: 100%;
        height: 500px;
    }
</style> -->