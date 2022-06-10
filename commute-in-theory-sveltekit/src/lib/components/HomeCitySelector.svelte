<script>
    import { Locations } from '$lib/stores/LocationStore';
    
    export let selectedCities = [];
</script>

<div class="grid place-items-center p-2 border rounded-xl shadow-sm bg-white">
    <span class="mb-2 font-semibold text-slate-500">Home</span>
    <div class="grid grid-cols-5 gap-4">
        {#each Object.keys($Locations.home) as home}
            <label for={home} class="inline-flex items-center">
                <input type="checkbox" bind:group={selectedCities} value={home} class="peer bg-gray-100 accent-baby-blue cursor-pointer h-4 w-4">
                <span class="ml-2 text-slate-400 peer-hover:text-baby-blue peer-checked:font-bold peer-checked:text-baby-blue ease-in-out duration-150">{home}</span>
            </label>
        {/each}
    </div>

</div>