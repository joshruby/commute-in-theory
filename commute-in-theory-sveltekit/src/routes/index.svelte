<script context="module">
    import { onMount, onDestroy } from 'svelte';
    import { CommuteStore } from '$lib/stores/CommuteStore'

    export const load = async ({ page, fetch }) => {
        // let commutes = [];

        const res = await fetch('/recorded-commutes', { credentials: 'omit' });
        if (res.ok) {
            // Cache the page for this many seconds
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

    export let commuteData;
    CommuteStore.set(commuteData.commutes)
</script>

<h1>Commute in Theory</h1>

<!-- <SvgOne /> -->
<!-- <TwoBar /> -->
<!-- <ThreeScatter /> -->
<!-- <FourMain width={600} height={600} xDimension={'petalLength'} yDimension={'petalWidth'}/> -->

<!-- <p><b>Commutes:</b> {$CommuteStore.length}</p> -->

{$CommuteStore.length}