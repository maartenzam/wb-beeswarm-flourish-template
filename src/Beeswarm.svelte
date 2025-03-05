<script>
  import { AccurateBeeswarm } from 'accurate-beeswarm-plot';
  import { scaleLinear, scaleLog } from 'd3-scale';
  import { extent } from 'd3-array';

  let { data, width, height, beeRadius } = $props();

  $inspect(height);

  let margins = {
    top: 12,
    right: 12,
    bottom: 12,
    left: 12,
  };

  let dataExtent = $derived(extent(data.map((d) => d.numericValue)));
  let xScale = $derived(
    scaleLinear()
      .domain(dataExtent)
      .range([0, width - margins.left - margins.right])
  );

  let beeswarmData = $derived(
    new AccurateBeeswarm(
      data.filter((d) => d.numericValue !== null),
      beeRadius,
      (d) => xScale(d.numericValue)
    )
      //.oneSided()
      //.withTiesBrokenRandomly()
      .calculateYPositions()
  );
  //$inspect(beeswarmData)
</script>

<g transform={`translate(${margins.left}, ${height / 2 + margins.top})`}>
  {#if beeswarmData}
    {#each beeswarmData as bee}
      <circle
        r={beeRadius}
        cx={bee.x}
        cy={bee.y}
        stroke={'black'}
        stroke-width={0}
        opacity={0.5}
      ></circle>
    {/each}
  {/if}
</g>
