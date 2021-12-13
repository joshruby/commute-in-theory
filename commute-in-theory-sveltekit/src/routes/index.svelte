<script>
    import { LocationStore } from '$lib/stores/LocationStore'

    async function handleCommuteRequests(commuteRequest) {
        const commuteRequests = [
            {
                origin: $LocationStore.MTV,
                destination: $LocationStore.CUP
            },
            // {
            //     origin: $LocationStore.MTV,
            //     destination: $LocationStore.STA
            // },
            // {
            //     origin: $LocationStore.SCZ,
            //     destination: $LocationStore.CUP
            // },
            // {
            //     origin: $LocationStore.SCZ,
            //     destination: $LocationStore.STA
            // },
            {
                origin: $LocationStore.CUP,
                destination: $LocationStore.MTV
            },
            // {
            //     origin: $LocationStore.CUP,
            //     destination: $LocationStore.SCZ
            // },
            // {
            //     origin: $LocationStore.STA,
            //     destination: $LocationStore.MTV
            // },
            // {
            //     origin: $LocationStore.STA,
            //     destination: $LocationStore.SCZ
            // },
        ]

        commuteRequests.forEach(async function (commuteRequest) {
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
        });
    }
</script>

<h1>Commute in Theory</h1>

<button name="Handle New Commute" on:click={handleCommuteRequests}>Handle new commute</button>