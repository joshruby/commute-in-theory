<script>
    async function handleCommuteRequest() {
        const locations = {
            HOME_MTNVW: {
                name: 'Home, Mountain View',
                lat_lon: '37.403712687363814,-122.07814772790742'
            },
            WORK_CUP: {
                name: 'Work, Cupertino',
                lat_lon: '37.330227595678146,-122.03281591229046'
            },
        }

        const commuteRequest = {
            origin: locations.HOME_MTNVW,
            destination: locations.WORK_CUP
        } 

        try {
            // Request the realtime commute info
            const res = await fetch('/record-commute', {
                method: 'POST',
                body: JSON.stringify(commuteRequest)
            })
            if (res.status === 200) {
                const commute = await res.json();
                try {
                    // POST the commute to mongodb
                    await fetch('/recorded-commutes', {
                        method: 'POST',
                        body: JSON.stringify(commute)
                    });
                } catch (err) {
                    alert('POST error');
                }
            }
        } catch (err) {
            alert('handleCommuteRequest error');
        }
        
    }
</script>

<h1>Commute in Theory</h1>

<button name="Handle New Commute" on:click={handleCommuteRequest}>Handle new commute</button>