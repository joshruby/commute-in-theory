<script>
    import { select, selectAll, axisBottom, axisLeft, timeMinute, timeFormat} from 'd3'

    export let  innerHeight;
    export let  margin;
    export let  position;
    export let  scale;

    let  transform;
    let  g;

    $: {
        select(g).selectAll("*").remove();

        let  axis;
        switch (position) {
            case "bottom":
                axis = axisBottom(scale)
                    .tickSizeOuter(0)
                    .ticks(
                        timeMinute.every(15),
                        timeFormat("%H:%M")
                    );
                    
                transform = `translate(0, ${innerHeight})`;

                select(g).call(axis).selectAll("text")	
                    .style("text-anchor", "end")
                    .attr("dx", "-1em")
                    .attr("dy", "0em")
                    .attr("transform", "rotate(-65)");

                break;

            case "left":
                axis = axisLeft(scale).tickSizeOuter(0);
                transform = `translate(${margin}, 0)`;

                select(g).call(axis)

                break;
        }

        // select(g).call(axis).selectAll("text")	
        //             .style("text-anchor", "end")
        //             .attr("dx", "-.8em")
        //             .attr("dy", ".15em")
        //             .attr("transform", "rotate(-65)");;
    }
</script>

<g  class="axis"  bind:this={g}  {transform} />