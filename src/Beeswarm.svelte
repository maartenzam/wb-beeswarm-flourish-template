<script>
  import { AccurateBeeswarm } from 'accurate-beeswarm-plot';
  import {
    scaleLinear,
    scaleLog,
    scaleBand,
    scaleSequential,
    scaleQuantize,
    scaleQuantile,
    scaleOrdinal,
  } from 'd3-scale';
  import { extent } from 'd3-array';
  import { colorRamps, getDiscreteColors, catColors } from './utils/colorramps';
  import { wbColors } from './utils/colors';
  import { getFill } from "./utils/utils";
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
    scaleType,
    colorScale,
    colorScaleDiverging,
    linearOrBinned,
    binningMode,
    numberOfBins,
    categoricalColorPalette,
  } = $props();

  let valueType = $derived(data.metadata.color.type);
  const noDataColor = wbColors.noData;

  let margins = {
    top: 12,
    right: 12,
    bottom: 56,
    left: 12,
  };

  let dataExtent = $derived(extent(data.map((d) => d.value)));
  let xScale = $derived.by(() => {
    let scale = logScale ? scaleLog() : scaleLinear()
    return scale.domain(dataExtent)
    .range([0, width - margins.left - margins.right])
  });

  let yScale = $derived(
    scaleBand()
      .domain(['one'])
      .range([0, height])
      .paddingInner(0.5)
      .paddingOuter(0.5)
  );

  let beeswarmData = $derived(
    new AccurateBeeswarm(
      data.filter((d) => d.value !== null),
      beeRadius + beeSpacing,
      (d) => xScale(d.value)
    ).calculateYPositions()
  );

  // COLORS
  // Numerical color values
  let contColorScale = $derived(
    linearOrBinned == 'linear'
      ? scaleSequential(
          colorRamps[
            scaleType == 'sequential' ? colorScale : colorScaleDiverging
          ]
        ).domain(dataExtent)
      : binningMode == 'fixedWidth'
        ? scaleQuantize(
            getDiscreteColors(
              colorRamps[
                scaleType == 'sequential' ? colorScale : colorScaleDiverging
              ],
              numberOfBins
            )
          ).domain(dataExtent)
        : scaleQuantile(
            getDiscreteColors(
              colorRamps[
                scaleType == 'sequential' ? colorScale : colorScaleDiverging
              ],
              numberOfBins
            )
          ).domain(data.map((d) => d.value))
  );

  //Categorical color values
  let colorDomain = $derived(
    [...new Set(data.map((d) => d.color.toLowerCase()))].filter((d) => d != '')
  );
  let catColorScale = $derived(
    catColors[categoricalColorPalette] && categoricalColorPalette != 'default'
      ? scaleOrdinal(
          Object.keys(catColors[categoricalColorPalette]),
          Object.values(catColors[categoricalColorPalette])
        ).unknown(noDataColor)
      : scaleOrdinal(colorDomain, Object.values(catColors['default'])).unknown(
          noDataColor
        )
  );
</script>

<g transform={`translate(${margins.left}, ${margins.top})`}>
  <ChartGrid
    gridType="xGrid"
    innerHeight={height - margins.top - margins.bottom}
    innerWidth={width - margins.left - margins.right}
    scale={xScale}
    ticks={xScale.ticks(5)}
    axisTitle={axisTitle}
    divisor={divideValues}
    axisUnits={units}
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
        fill={valueType == "string" ? catColorScale(bee.datum.color.toLowerCase()) : getFill(data, bee.datum.iso3c, contColorScale, catColorScale, noDataColor)}
      ></circle>
    {/each}
  {/if}
</g>

<!--fill={getFill(data, bee.datum.iso3c, contColorScale, catColorScale, noDataColor)}-->
