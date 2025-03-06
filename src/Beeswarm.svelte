<script>
  import { onMount } from 'svelte';
  import { AccurateBeeswarm } from 'accurate-beeswarm-plot';
  import { scaleLinear, scaleLog, scaleBand } from 'd3-scale';
  import { extent, group } from 'd3-array';
  import { wbColors } from './utils/colors';
  import { getFill } from './utils/utils';
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
    logScale,
    divideValues,
    units,
    axisTitle,
    catColorScale,
    contColorScale,
  } = $props();

  let valueType = $derived(data.metadata.color.type);
  let yBinding = Object.keys(data.metadata).includes('yValue');
  const noDataColor = wbColors.noData;

  let yLabels;

  let yLabelsWidth = $state(0);
  $effect(() => {
    yLabelsWidth = yLabels.getBBox().width;
  });

  let margins = $derived({
    top: 12,
    right: 12,
    bottom: 56,
    left: yLabelsWidth + 8,
  });

  let dataExtent = $derived(extent(data.map((d) => d.value)));
  let xScale = $derived.by(() => {
    let scale = logScale ? scaleLog() : scaleLinear();
    return scale
      .domain(dataExtent)
      .range([0, width - margins.left - margins.right]);
  });

  let yDomain = $derived.by(() => {
    if (yBinding) {
      return [...new Set(data.map((d) => d.yValue))];
    } else {
      return ['solo'];
    }
  });

  let yScale = $derived(
    scaleBand()
      .domain(yDomain)
      .range([0, height])
      .paddingInner(0.5)
      .paddingOuter(1)
  );

  let beeswarmDataArray = $derived.by(() => {
    let swarms = [];
    yDomain.forEach((c) => {
      let swarmData = yBinding
        ? data.filter((d) => d.yValue == c && d.value !== null)
        : data.filter((d) => d.value !== null);
      swarms.push({
        id: c,
        data: new AccurateBeeswarm(swarmData, beeRadius + beeSpacing, (d) =>
          xScale(d.value)
        ).calculateYPositions(),
      });
    });
    return swarms;
  });
</script>

<svg {width} {height}>
  <g bind:this={yLabels}>
    {#if yBinding}
    {#each yDomain as yLabel}
      <text class={'yTickLabel'} x={0} y={yScale(yLabel) + 18}>{yLabel}</text>
    {/each}
    {/if}
  </g>

  <g transform={`translate(${margins.left}, ${margins.top})`}>
    <ChartGrid
      gridType="xGrid"
      innerHeight={height - margins.top - margins.bottom}
      innerWidth={width - margins.left - margins.right}
      scale={xScale}
      ticks={xScale.ticks(5)}
      {axisTitle}
      divisor={divideValues}
      axisUnits={units}
    />
    {#if beeswarmDataArray}
      {#each beeswarmDataArray as swarm}
        {#each swarm.data as bee}
          <circle
            r={beeRadius}
            cx={bee.x}
            cy={yScale(swarm.id) + bee.y}
            stroke={beeStroke}
            stroke-width={beeStrokeWidth}
            opacity={beeOpacity}
            fill={valueType == 'string'
              ? catColorScale(bee.datum.color.toLowerCase())
              : getFill(
                  data,
                  bee.datum.iso3c,
                  contColorScale,
                  catColorScale,
                  noDataColor
                )}
          ></circle>
        {/each}
      {/each}
    {/if}
  </g>
</svg>

<style>
  text.yTickLabel {
    font-family: 'Open Sans';
    font-weight: var(--font-weight-semibold);
    text-transform: uppercase;
    fill: var(--text);
  }
  @media only screen and (max-width: 400px) {
    text.yTickLabel {
      font-size: var(--font-size-s-s);
    }
  }
  @media only screen and (min-width: 400px) and (max-width: 700px) {
    text.yTickLabel {
      font-size: var(--font-size-m-s);
    }
  }
  @media only screen and (min-width: 700px) {
    text.yTickLabel {
      font-size: var(--font-size-l-s);
    }
  }
</style>
