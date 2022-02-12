<script>
    export let weekdaySelection = 'All';

    const weekdays = ['All', 'Business', 'Weekend']
</script>

<!-- https://dev.to/thomasvanholder/click-label-to-choose-radio-button-tailwindcsss-peer-class-39nb -->
<div class="grid grid-cols-3 gap-x-2">
    {#each weekdays as weekday}
        <div>
            <label>
                <input type="radio" bind:group={weekdaySelection} value={weekday} name="weekday"> 
                <div>{weekday}</div>
            </label>
        </div>
    {/each}
</div>