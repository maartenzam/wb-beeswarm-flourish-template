<script>
  import Header from './template/Header.svelte';
  import Footer from './template/Footer.svelte';
  import Beeswarm from './Beeswarm.svelte'

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

    $inspect(data.plotdata.metadata)

  //$inspect(data.plotdata)

  let width = $state(500);
  let height = $state(500);

  // Layout
  let headerHeight = $state();
  let footerHeight = $state();

  let vizHeight = $derived(headerHeight && footerHeight ? height - headerHeight - footerHeight : height);
  let vizWidth = $state();
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
