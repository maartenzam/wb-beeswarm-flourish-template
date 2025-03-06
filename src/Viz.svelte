<script>
  import Header from './template/Header.svelte';
  import Footer from './template/Footer.svelte';
  import CategoricalColorLegend from "./template/CategoricalColorLegend.svelte";
  import Beeswarm from './Beeswarm.svelte'
  import {
    colorRamps,
    getDiscreteColors,
    catColors,
    allColors,
  } from './utils/colorramps';
  import { wbColors } from './utils/colors';
  import { scaleOrdinal } from 'd3-scale';

  let { data, title, subtitle, notesTitle, notes, includeLogo,
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

  let width = $state(500);
  let height = $state(500);

  // Layout
  let headerHeight = $state(0);
  let footerHeight = $state(0);
  let legendHeight = $state(0)

  let vizHeight = $derived(height - headerHeight - footerHeight - legendHeight);
  let vizWidth = $state();

  let valueType = $derived(data.plotdata.metadata.color.type);

  const noDataColor = wbColors.noData;

  let colorDomain = $derived(
    [...new Set(data.plotdata.map((d) => d.color.toLowerCase()))].filter((d) => d != '')
  );
  let colorRange = $derived.by(() => {
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
  });
  let catColorScale = $derived(
    scaleOrdinal(colorDomain, colorRange).unknown(noDataColor)
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
    <svg width={vizWidth} height={vizHeight}>
      <Beeswarm
        data={data.plotdata}
        width={vizWidth}
        height={vizHeight}
        {beeRadius}
        {beeStroke}
        {beeStrokeWidth}
        {beeOpacity}
        {beeSpacing}
        {logScale}
        {divideValues}
        {units}
        {axisTitle}
        {scaleType}
        {colorScale}
        {colorScaleDiverging}
        {linearOrBinned}
        {binningMode}
        {numberOfBins}
        {categoricalColorPalette}
        ></Beeswarm>
    </svg>
  </div>

  {#if true}
  <div class="legend-container" bind:clientHeight={legendHeight}>
      {#if valueType == "number"}
        <!--ContinuousColorLegend
          width={vizWidth}
          title={legendTitle}
          {unitLabel}
          {contColorScale}
          {linearOrBinned}
          {binningMode}
          units={"%"}
          {includeNoData}
          {noDataLabel}
        ></ContinuousColorLegend-->
      {/if}
      {#if valueType == "string"}
        <CategoricalColorLegend
          title={"legendTitle"}
          {catColorScale}
          usedCats={catColorScale.domain()}
          includeNoData={true}
          noDataLabel={"noDataLabel"}
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
