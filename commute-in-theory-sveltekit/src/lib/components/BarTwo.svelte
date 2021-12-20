<script>
    let bridgeTraffic = [
    { name: "Henry Hudson Bridge", traffic: 58809 },
    { name: "Hugh L. Carey Tunnel", traffic: 54007 },
    { name: "Queens-Midtown Tunnel", traffic: 86081 },
    { name: "R.F.K. Memorial Bridge Manhattan Plaza", traffic: 91509 },
    { name: "George Washington Bridge", traffic: 280784 },
    { name: "Holland Tunnel", traffic: 87232 },
    { name: "Lincoln Tunnel", traffic: 109796 },
  ];

  bridgeTraffic.sort((a, b) => b.traffic - a.traffic)
</script>

<svg>
    {#each bridgeTraffic as bridge, i}
        <g transform={`translate(300 ${i * 20 + 10})`}>
            <text text-anchor="end" dominant-baseline="middle" font-size="12" x="-5" y="5">{bridge.name}</text>
            <rect width={bridge.traffic / 1000} height="10" fill="red"/>
            <text fill="#aaa" dominant-baseline="middle" font-size="12" x={bridge.traffic / 1000 + 10} y="5">{bridge.traffic.toLocaleString()}</text>

            <!-- Trace circle to make it clear where the origin of each ele is -->
            <!-- <circle r="3" fill="black"/> -->
        </g>
    {/each}
</svg>

<style>
    svg {
        border: 1px solid black;
        width: 100%;
        height: 500px;
    }
</style>