<script></script>

<svg>
    <circle r="10" fill="red" stroke="blue" stroke-width="3"
        transform="translate(50 20) scale(2)"
    />

    <rect width="90" height="30" fill="green" x="50" y="10"/>

    <line stroke="black" stroke-width="4" x1="150" y1="10"
        transform="translate(80 40)"
    />


    <g transform="translate(30, 30) scale(2)">
        <rect width="20" height="100" fill="blue" x="200" y="100"/>
        <line stroke="black" stroke-width="4" x1="250" y1="150" x2="300" y2="200"/>
    </g>

</svg>

<style>
    svg {
        border: 1px solid red;
        width: 100%;
        height: 500px;
    }
</style>