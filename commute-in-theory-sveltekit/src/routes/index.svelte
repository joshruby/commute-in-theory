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

    // Receive the commuteData from load
    export let commuteData;
    let commutes = commuteData.commutes;

    // Convert the departureTime strings to Date objects and 
    // simplify their minutes and seconds
    commutes.forEach((ele) => {
        const thresh = 5;
        const recordingTimes = [0, 15, 30, 45];
        
        let date = new Date(ele.departureTime);
        const minutes = date.getMinutes();

        recordingTimes.forEach((t) => {
            if (Math.abs(minutes - t) <= thresh) {
            date.setMinutes(t, 0);
        }
        });
        
        ele.departureTime = date;
    });

    // Save the commutes in a store
    CommuteStore.set(commutes)
</script> 

<h1>Commute in Theory</h1>

<!-- <SvgOne /> -->
<!-- <TwoBar /> -->
<!-- <ThreeScatter /> -->
<!-- <FourMain width={600} height={600} xDimension={'petalLength'} yDimension={'petalWidth'}/> -->

<!-- <p><b>Commutes:</b> {$CommuteStore.length}</p> -->

{#each $CommuteStore.slice(0, 10) as commute}
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