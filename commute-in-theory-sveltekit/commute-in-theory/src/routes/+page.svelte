
<script>
    import { ProcessedCommuteStats } from '$lib/Stores/CommuteStore';
	export let data;

    // Fetch the commute stats on load(), process them, and then
    // set the ProcessedCommuteStats store
    ProcessedCommuteStats.set(data.processedCommuteStats);
</script>

<h1>Hi</h1>

{#each Object.keys($ProcessedCommuteStats) as key}
    <li>{key}</li>
{/each}