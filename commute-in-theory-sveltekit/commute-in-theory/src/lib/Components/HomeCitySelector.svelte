<script>
    import { Locations } from '$lib/Stores/LocationStore';
    
    export let selectedCities = [];
</script>

<div class="grid place-items-center justify-center p-2 border rounded-xl shadow-sm bg-white">
    <span class="mb-2 font-semibold text-slate-500">Bay Area</span>
    <ul class="grid grid-flow-col auto-cols-max gap-4">
        {#each Object.keys($Locations.BayArea.home) as home}
            <li>
                <input type="checkbox" bind:group={selectedCities} value={home} class="hidden peer" id={home}>
                <label for={home} class="ml-2 text-slate-400 peer-hover:cursor-pointer peer-hover:text-baby-blue peer-checked:font-bold peer-checked:text-baby-blue ease-in-out duration-150">
                    {home}
                </label>
            </li>
        {/each}
    </ul>
    <div class="my-4 border-b w-3/4"></div>
    <span class="mb-2 font-semibold text-slate-500">San Diego</span>
    <ul class="grid grid-flow-col auto-cols-max gap-4">
        {#each Object.keys($Locations.SanDiego.home) as home}
            <li>
                <input type="checkbox" bind:group={selectedCities} value={home} class="hidden peer" id={home}>
                <label for={home} class="ml-2 text-slate-400 peer-hover:cursor-pointer peer-checked:font-bold peer-checked:text-baby-blue ease-in-out duration-150">
                {home}
                </label>
            </li>
        {/each}
    </ul>
</div>