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
        const minuteThresh = 7;
        const recordingTimes = [0, 15, 30, 45];
        
        let date = new Date(ele.departureTime);

        recordingTimes.forEach((t) => {
            const diff = Math.abs(date.getMinutes() - t);

            if (diff <= minuteThresh) {
                date.setMinutes(t, 0);
            }
            else if (diff >= (60 - minuteThresh)) {
                // E.g 07:54 should be set to 08:00, not 07:00
                // This could lead to a day having multiple commutes attributed
                // to the same recording time. I think that's fine for now
                date.setHours(date.getHours() + 1, t, 0);
            }
        });
        
        ele.departureTime = date;
    });

    // Group the commutes by city pairs
    // https://stackoverflow.com/questions/14446511/most-efficient-method-to-groupby-on-an-array-of-objects
    const groupBy = (x, f) => x.reduce((a, b) => ((a[f(b)] ||= []).push(b), a), {});
    let groupedCommutes = groupBy(
        commutes, 
        ele => ele.origin + '-' + ele.destination
    );
    // Within each city pair arr group commutes by hour and minute
    Object.keys(groupedCommutes).forEach((key) => {
        groupedCommutes[key] = groupBy(
            groupedCommutes[key],
            ele => ele.departureTime.toLocaleTimeString()
        )
    });

    // Save the commutes in a store
    CommuteStore.set(groupedCommutes)
    console.log($CommuteStore);
</script> 

<h1>Commute in Theory</h1>

<!-- <SvgOne /> -->
<!-- <TwoBar /> -->
<!-- <ThreeScatter /> -->
<!-- <FourMain width={600} height={600} xDimension={'petalLength'} yDimension={'petalWidth'}/> -->
<!-- 
{#each $CommuteStore['CUP-SCZ'].slice(0, 10) as commute}
    <div class="commute-block">
        <p><b>Origin:</b> {commute.origin}</p>
        <p><b>Destination:</b> {commute.destination}</p>
        <p><b>Departure Time:</b> {commute.departureTime}</p>
        <p><b>Travel Time [s]:</b> {commute.travelTimeInSeconds}</p>
    </div>
{/each} -->

<!-- <style>
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
</style> -->