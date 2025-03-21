<script>
  import { AccurateBeeswarm } from 'accurate-beeswarm-plot';
  import { scaleLinear, scaleLog, scaleBand } from 'd3-scale';
  import { extent } from 'd3-array';
  import { format } from 'd3-format';
  import { wbColors } from './utils/colors';
  import ChartGrid from './template/ChartGrid.svelte';
  import Tooltip from './template/Tooltip.svelte';
  import TooltipContent from './template/TooltipContent.svelte';

  let {
    data,
    width,
    height,
    beeStroke,
    beeStrokeWidth,
    beeOpacity,
    beeSpacing,
    logScale,
    divideValues,
    units,
    axisTitle,
    tickNumber,
    ySort,
    yReverse,
    categoricalColorScale,
    numericalColorScale,
    addAnnotation,
    annotationValue,
    annotationText
  } = $props();

  let beeRadius = $derived(width < 401
        ? 3
        : width > 400 && width < 701
            ? 4.5
            : width < 1001
                ? 6
                : 8
            )

  let valueType = $derived(data.metadata.color.type);
  let yBinding = $derived(Object.keys(data.metadata).includes('yValue'));
  const noDataColor = wbColors.noData;

  // Get the width of the y axis labels
  let yLabels
  let yLabelsWidth = $state(0);
  $effect(() => {
    // Included to trigger an update when changed
    yDomain
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
      let domain = [...new Set(data.map((d) => d.yValue))]
      let domainAverages = domain.map(d => {
        let values = data.filter(c => c.yValue == d && c.value != null).map(d => d.value)
        let average = values.length > 0 ? values.reduce((total, next) => total + next) / values.length : 0
        return {
            id: d,
            average: average
        }
      })
      if(ySort == "byAverage"){
        domainAverages.sort((a, b) => a.average - b.average)
      }
      if(yReverse){
        domainAverages.reverse()
      }
      return domainAverages.map(d => d.id)
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

  // Tooltip
  let currentFeature = $state();
  let currentFeatureData = $derived(
    data.find((d) => d.id == currentFeature)
  );

  let mousePos;
  function updateMouse(evt) {
    mousePos = { x: evt.clientX, y: evt.clientY };
  }
  let tooltipVisible;
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<svg {width} {height} onmousemove={updateMouse}>
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
      ticks={xScale.ticks(tickNumber)}
      {axisTitle}
      divisor={divideValues}
      axisUnits={units}
    />
    {#if addAnnotation && annotationValue}
        <line
            x1={xScale(annotationValue)}
            x2={xScale(annotationValue)}
            y1={0}
            y2={height - margins.top - margins.bottom}
            stroke={wbColors.reference}
            stroke-width={3}
            stroke-linecap={"round"}
        ></line>
    {/if}
    {#if beeswarmDataArray}
      {#each beeswarmDataArray as swarm}
        {#each swarm.data as bee}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
        {#if bee.x}
          <circle
            r={beeRadius}
            cx={bee.x}
            cy={yScale(swarm.id) + bee.y}
            stroke={bee.datum.id == currentFeature ? wbColors.grey500 : beeStroke}
            stroke-width={bee.datum.id == currentFeature ? 2.5 : beeStrokeWidth}
            opacity={beeOpacity}
            fill={valueType == 'string'
              ? categoricalColorScale(bee.datum.color)
              : bee.datum.color
                ? numericalColorScale(bee.datum.color)
                : noDataColor
            }
                onmouseover={() => {currentFeature = bee.datum.id; tooltipVisible = true}}
                onfocus={() => {currentFeature = bee.datum.id; tooltipVisible = true}}
                onmouseout={() => {currentFeature = null; tooltipVisible = false}}
                onblur={() => {currentFeature = null; tooltipVisible = false}}
          ></circle>
          {/if}
        {/each}
      {/each}
    {/if}
    {#if annotationValue && annotationText}
    <text
        class={"annotation"}
        x={xScale(annotationValue) + 6}
        y={16}
        paint-order="stroke"
        stroke-linejoin="round"
        stroke={"#ffffff"}
        stroke-width={3}
    >{annotationText}</text>
{/if}
  </g>
</svg>

{#if currentFeatureData && mousePos}
  <Tooltip visible={tooltipVisible} targetPos={mousePos}>
    <TooltipContent
      tooltipHeader={currentFeatureData.label}
      tooltipBody={currentFeatureData.value != null &&
      currentFeatureData.value != ''
        ? format(',')(currentFeatureData.value)
        : 'No data'}
    ></TooltipContent>
  </Tooltip>
{/if}

<style>
  text.yTickLabel {
    font-family: 'Open Sans';
    font-weight: var(--font-weight-semibold);
    text-transform: uppercase;
    fill: var(--text);
  }
  text.annotation {
    font-family: 'Open Sans';
    font-weight: var(--font-weight-semibold);
    text-transform: uppercase;
    fill: var(--textSubtle);
  }
  @media only screen and (max-width: 400px) {
    text.yTickLabel, text.annotation {
      font-size: var(--font-size-s-s);
    }
  }
  @media only screen and (min-width: 400px) and (max-width: 700px) {
    text.yTickLabel, text.annotation {
      font-size: var(--font-size-m-s);
    }
  }
  @media only screen and (min-width: 700px) {
    text.yTickLabel, text.annotation {
      font-size: var(--font-size-l-s);
    }
  }
</style>
