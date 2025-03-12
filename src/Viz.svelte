<script>
  import Header from './template/Header.svelte';
  import Footer from './template/Footer.svelte';
  import CategoricalColorLegend from './template/CategoricalColorLegend.svelte';
  import ContinuousColorLegend from './template/ContinuousColorLegend.svelte';
  import Beeswarm from './Beeswarm.svelte';
  import { getCategoricalColorScale, getNumericalColorScale } from './utils/colorscales';

  let {
    data,
    title,
    subtitle,
    notesTitle,
    notes,
    includeLogo,
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
    noDataLabel,
    addAnnotation,
    annotationValue,
    annotationText
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

  let contColorScale = $derived(getNumericalColorScale(data, linearOrBinned, scaleType, colorScale, colorScaleDiverging, binningMode, numberOfBins))
  let catColorScale = $derived(getCategoricalColorScale(data))
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
        {tickNumber}
        {ySort}
        {yReverse}
        {catColorScale}
        {contColorScale}
        {addAnnotation}
        {annotationValue}
        {annotationText}
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
