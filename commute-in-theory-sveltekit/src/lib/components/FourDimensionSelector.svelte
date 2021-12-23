<script>
    // Hard coding the keys for simplicity but really these should be pulled 
    // from the dataset directly
    const columns = [
        'petalWidth',
        'petalLength',
        'sepalWidth',
        'sepalLength'
    ];

    // Attributes which are exported are automatically bindable
    // This way selectedColumn can be read and modified both by 
    // the select element and by and component that references this one
    export let selectedColumn;
</script>

<select bind:value={selectedColumn}>
    {#each columns as column}
        <option>{column}</option>
    {/each}
</select>

{selectedColumn}