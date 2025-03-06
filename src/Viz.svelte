<script>
  import Header from './template/Header.svelte';
  import Footer from './template/Footer.svelte';
  import CategoricalColorLegend from './template/CategoricalColorLegend.svelte';
  import ContinuousColorLegend from './template/ContinuousColorLegend.svelte';
  import Beeswarm from './Beeswarm.svelte';
  import {
    colorRamps,
    getDiscreteColors,
    catColors,
    allColors,
  } from './utils/colorramps';
  import { wbColors } from './utils/colors';
  import {
    scaleOrdinal,
    scaleSequential,
    scaleQuantize,
    scaleQuantile,
  } from 'd3-scale';
  import { extent } from 'd3-array';

  let {
    data,
    title,
    subtitle,
    notesTitle,
    notes,
    includeLogo,
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
    showLegend,
    legendTitle,
    unitLabel,
    includeNoData,
    noDataLabel
  } = $props();

  let width = $state(500);
  let height = $state(500);

  // Layout
  let headerHeight = $state(0);
  let footerHeight = $state(0);
  let legendHeight = $state(0);

  let vizHeight = $derived(height - headerHeight - footerHeight - legendHeight);
  let vizWidth = $state();

  let valueType = $derived(data.plotdata.metadata.color.type);

  const noDataColor = wbColors.noData;

  // COLORS
  // Numerical color values
  let dataExtent = $derived(extent(data.plotdata.map((d) => d.value)));
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
          ).domain(data.plotdata.map((d) => d.value))
  );

  // Categorical colors
  let colorDomain = $derived.by(() => {
    if (valueType == 'string') {
      return [
        ...new Set(data.plotdata.map((d) => d.color.toLowerCase())),
      ].filter((d) => d != '');
    }
  });
  let colorRange = $derived.by(() => {
    if (valueType == 'string') {
      let range = colorDomain.map((d) => {
        if (allColors[d]) {
          return allColors[d];
        } else {
          return noDataColor;
        }
      });
      if (range.every((d) => d == noDataColor)) {
        return Object.values(catColors.default);
      } else {
        return range;
      }
    }
  });
  let catColorScale = $derived.by(() => {
    if(valueType == "string"){
      return scaleOrdinal(colorDomain, colorRange).unknown(noDataColor)
    }
  }
  );
</script>

<svelte:window bind:innerWidth={width} bind:innerHeight={height} />

<div class="chart-container">
  <div class="header-container" bind:clientHeight={headerHeight}>
    {#if title || subtitle}
      <Header {title} {subtitle}></Header>
    {/if}
  </div>

  <div class="viz-container" bind:clientWidth={vizWidth}>
      <Beeswarm
        data={data.plotdata}
        width={vizWidth}
        height={vizHeight}
        {beeStroke}
        {beeStrokeWidth}
        {beeOpacity}
        {beeSpacing}
        {logScale}
        {divideValues}
        {units}
        {axisTitle}
        {catColorScale}
        {contColorScale}
      ></Beeswarm>
  </div>

  {#if showLegend}
    <div class="legend-container" bind:clientHeight={legendHeight}>
      {#if valueType == 'number'}
        <ContinuousColorLegend
          width={vizWidth}
          title={legendTitle}
          unitLabel={unitLabel}
          {contColorScale}
          {linearOrBinned}
          {binningMode}
          units={""}
          includeNoData={includeNoData}
          noDataLabel={noDataLabel}
        ></ContinuousColorLegend>
      {/if}
      {#if valueType == 'string'}
        <CategoricalColorLegend
          title={legendTitle}
          {catColorScale}
          usedCats={catColorScale.domain()}
          includeNoData={includeNoData}
          noDataLabel={noDataLabel}
        ></CategoricalColorLegend>
      {/if}
    </div>
  {/if}

  <div class="footer-container" bind:clientHeight={footerHeight}>
    <Footer {notesTitle} {notes} {includeLogo}></Footer>
  </div>
</div>

<style>
  .chart-container {
    display: flex;
    flex-direction: column;
    max-height: 100%;
  }
  .viz-container {
    width: 100%;
    flex-grow: 1;
    position: relative;
  }
  .legend-container {
    width: 100%;
  }

  @media only screen and (max-width: 400px) {
    .chart-container {
      margin-left: var(--font-size-s-m);
      margin-left: var(--font-size-s-m);
    }
  }
  @media only screen and (min-width: 400px) and (max-width: 700px) {
    .chart-container {
      margin-left: var(--font-size-m-m);
      margin-right: var(--font-size-m-m);
    }
  }
  @media only screen and (min-width: 700px) {
    .chart-container {
      margin-left: var(--font-size-l-m);
      margin-right: var(--font-size-l-m);
    }
  }
</style>
