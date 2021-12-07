<script>
    async function postRecordedCommute() {
        try {
            const commute = {
                status: 200,
                body: {
                    origin: 'test',
                    destination: 'test',
                    departureTime: 'some time',
                    travelTimeInSeconds: 22
                } 
            };

            // POST commute info to mongodb
            await fetch('/recorded-commutes', {
                method: 'POST',
                body: JSON.stringify(commute.body)
            });
        } catch (err) {
            alert('postRecordedCommute error');
        }
    }
</script>

<h1>Commute in Theory</h1>

<button name="Handle New Commute" on:click={postRecordedCommute}>Handle new commute</button>