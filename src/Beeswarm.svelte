<script>
  import { AccurateBeeswarm } from 'accurate-beeswarm-plot';
  import { scaleLinear, scaleLog, scaleBand } from 'd3-scale';
  import { extent } from 'd3-array';
  import ChartGrid from './template/ChartGrid.svelte';

  let {
    data,
    width,
    height,
    beeRadius,
    beeStroke,
    beeStrokeWidth,
    beeOpacity,
    beeSpacing,
  } = $props();

  let margins = {
    top: 12,
    right: 12,
    bottom: 56,
    left: 12,
  };

  let dataExtent = $derived(extent(data.map((d) => d.numericValue)));
  let xScale = $derived(
    scaleLinear()
      .domain(dataExtent)
      .range([0, width - margins.left - margins.right])
  );

  let yScale = $derived(
    scaleBand()
      .domain(['one'])
      .range([0, height])
      .paddingInner(0.5)
      .paddingOuter(0.5)
  );

  let beeswarmData = $derived(
    new AccurateBeeswarm(
      data.filter((d) => d.numericValue !== null),
      beeRadius + beeSpacing,
      (d) => xScale(d.numericValue)
    ).calculateYPositions()
  );
  $inspect(yScale.bandwidth());
</script>

<g transform={`translate(${margins.left}, ${margins.top})`}>
  <ChartGrid
    gridType="xGrid"
    innerHeight={height - margins.top - margins.bottom}
    innerWidth={width - margins.left - margins.right}
    scale={xScale}
    ticks={xScale.ticks()}
    axisTitle={'Life expectancy at birth'}
  />
  {#if beeswarmData}
    {#each beeswarmData as bee}
      <circle
        r={beeRadius}
        cx={bee.x}
        cy={yScale('one') + bee.y}
        stroke={beeStroke}
        stroke-width={beeStrokeWidth}
        opacity={beeOpacity}
      ></circle>
    {/each}
  {/if}
</g>
