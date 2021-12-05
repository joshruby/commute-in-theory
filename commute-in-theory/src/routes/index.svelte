<script>
    async function postCommute() {
        try {
            const commute = {
                origin: 'Mountain View',
                destination: 'San Francisco, Mission District',
                departureTime: "2021-12-04T08:00:00.000-08:00",
                duration: 57,
                minutesInTraffic: 12
            }
            
            await fetch('/commutes', {
                method: 'POST',
                body: JSON.stringify(commute)
            })
        } catch (err) {
            alert('Error');
        }
    }
</script>

<h1>Commute in Theory</h1>

<button name="POST" on:click={postCommute}>POST</button>