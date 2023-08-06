<script>
    export let name;
    export let toggleChecked;
    export let label;
</script>

<label for={name} class="flex items-center cursor-pointer">
    <!-- toggle -->
    <div class="relative">
        <!-- input -->
        <input id={name} type="checkbox" bind:checked={toggleChecked} class="sr-only" />
        <!-- line -->
        <div class="w-10 h-4 bg-slate-200 rounded-full shadow-inner"></div>
        <!-- dot -->
        <div class="dot absolute w-6 h-6 bg-slate-50 rounded-full border shadow -left-1 -top-1 transition"></div>
    </div>
    <!-- label -->
    <div class="ml-3 text-slate-400">
        {label}
    </div>
</label>

<style>
	input:checked ~ .dot {
		transform: translateX(100%);
		background-color: #a4c2f4;
	}
</style>
