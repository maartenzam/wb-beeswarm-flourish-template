<script>
  import Header from './template/Header.svelte';
  import Footer from './template/Footer.svelte';
  import NumericalColorLegend from './template/NumericalColorLegend.svelte';
  import CategoricalColorLegend from './template/CategoricalColorLegend.svelte';
  import Beeswarm from './Beeswarm.svelte';
  import { getCategoricalColorScale, getNumericalColorScale } from './utils/colorscales';
  import { min, max, extent } from 'd3-array';

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
    domainAutoCustom,
    domainMin,
    domainMax,
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

  // Color scales
  let domainMinimum = $derived(typeof domainMin === "undefined" ? Math.floor(min(data.plotdata.map((d) => d.color))) : domainMin)
  let domainMaximum = $derived(typeof domainMax === "undefined"  ? Math.ceil(max(data.plotdata.map((d) => d.color))) : domainMax)
  let dataDomain = $derived(extent(data.plotdata, d => d.color))
  let customDomain = $derived([domainMinimum, domainMaximum])
  let domain = $derived(domainAutoCustom == "auto" ? dataDomain : customDomain)

  let numericalColorScale = $derived(getNumericalColorScale(data, domain, linearOrBinned, scaleType, colorScale, colorScaleDiverging, binningMode, numberOfBins))
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
        {numericalColorScale}
        {addAnnotation}
        {annotationValue}
        {annotationText}
      ></Beeswarm>
  </div>

  <div class="legend-container" bind:clientHeight={legendHeight}>
  {#if showLegend}
      {#if valueType == 'number'}
        <NumericalColorLegend
          width={vizWidth}
          title={legendTitle}
          unitLabel={unitLabel}
          {numericalColorScale}
          {linearOrBinned}
          {binningMode}
          units={""}
          includeNoData={includeNoData}
          noDataLabel={noDataLabel}
        ></NumericalColorLegend>
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
  {/if}
</div>

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
