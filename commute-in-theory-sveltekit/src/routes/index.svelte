<script context="module">
    export const load = async ({ page, fetch }) => {
        // let commutes = [];

        const res = await fetch('/recorded-commutes', { credentials: 'omit' });
        if (res.ok) {
            // Cache the page for this many seconds
            // https://github.com/sveltejs/kit/issues/793
            return {
                props: {
                    commuteData: await res.json()
                },
                maxage: 60 * 15 // Cache the page in the cdn for this many seconds
            }
        }

        return {
            status: res.status,
            error: new Error('Could not load the recorded commutes.')
        }

    }
</script>


<script>
    // import OneSVG from '$lib/components/OneSVG.svelte'
    // import TwoBar from '$lib/components/TwoBar.svelte'
    // import ThreeScatter from '$lib/components/ThreeScatter.svelte'
    // import FourMain from '$lib/components/FourMain.svelte'

    import { CommuteStore } from '$lib/stores/CommuteStore'


    // Load the commute documents from mongodb into a store
    export let commuteData;
    let commutes = commuteData.commutes;
    // Convert the departureTime strings to Date objects
    commutes.forEach((ele) => ele.departureTime = new Date(ele.departureTime))

    CommuteStore.set(commuteData.commutes)
</script> 

<h1>Commute in Theory</h1>

<!-- <SvgOne /> -->
<!-- <TwoBar /> -->
<!-- <ThreeScatter /> -->
<!-- <FourMain width={600} height={600} xDimension={'petalLength'} yDimension={'petalWidth'}/> -->

<!-- <p><b>Commutes:</b> {$CommuteStore.length}</p> -->

{#each $CommuteStore.slice(0, 1) as commute}
    <div class="commute-block">
        <p><b>Origin:</b> {commute.origin}</p>
        <p><b>Destination:</b> {commute.destination}</p>
        <p><b>Departure Time:</b> {commute.departureTime}</p>
        <p><b>Travel Time [s]:</b> {commute.travelTimeInSeconds}</p>
    </div>
{/each}

<style>
    :global(body) {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    .commute-block {
        max-width: 400px;
        border: 2px solid #aaa;
        border-radius: 20px;
        padding: 10px;
        margin: 5px auto;
    }
</style>