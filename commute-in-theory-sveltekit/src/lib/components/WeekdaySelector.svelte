<script>
    export let weekdaySelection = 'All';

    const weekdays = ['All', 'Business', 'Weekend']
    // Generate a random string for this component
    const randStr = Math.random().toString(36).replace(/[^a-z]+/g, '').substring(0, 5);
</script>

<!-- https://dev.to/thomasvanholder/click-label-to-choose-radio-button-tailwindcsss-peer-class-39nb -->
<div class="w-80 border rounded-xl shadow-sm">
    <div class="relative grid grid-cols-1 place-items-center">
        <div class="absolute -top-3 px-3 bg-white font-semibold text-slate-500">
            Days
        </div>
    </div>
    <div class="grid grid-cols-3 divide-x my-3">
        {#each weekdays as weekday}
            <div class="text-center">
                <input
                    type="radio"
                    bind:group={weekdaySelection}
                    value={weekday}
                    id={weekday + randStr}
                    class="peer sr-only"
                >
                <label
                    for={weekday + randStr}
                    class="cursor-pointer text-slate-400 peer-hover:text-baby-blue peer-checked:font-bold peer-checked:text-baby-blue ease-in-out duration-150"
                >
                    {weekday}
                </label>
            </div>
        {/each}
    </div>
</div>