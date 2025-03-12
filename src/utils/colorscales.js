import { extent } from 'd3-array';
import { scaleSequential, scaleQuantize, scaleQuantile, scaleOrdinal } from 'd3-scale';
import { colorRamps, catColors, allColors } from './colorramps';
import { wbColors } from './colors';

export let getNumericalColorScale = function(data, domain, linearOrBinned, scaleType, colorScale, colorScaleDiverging, binningMode, numberOfBins){
  //let dataExtent = extent(data.plotdata.map((d) => d.color))

  if(linearOrBinned == 'linear'){
    return scaleSequential(
      colorRamps[
        scaleType == 'sequential' ? colorScale : colorScaleDiverging
      ]
    ).domain(domain)
  }

  let getDiscreteColors = function (colorRamp, colorNumber) {
    let arr = [...Array(colorNumber).keys()].map((i) => i / (colorNumber - 1));
    let colors = arr.map((d) => colorRamp(d));
    return colors;
  };

  if(linearOrBinned == 'binned' && binningMode == 'fixedWidth'){
    return scaleQuantize(
      getDiscreteColors(
        colorRamps[
          scaleType == 'sequential' ? colorScale : colorScaleDiverging
        ],
        numberOfBins
      )
    ).domain(domain)
  }

  if(linearOrBinned == 'binned' && binningMode == 'quantile'){
    return scaleQuantile(
      getDiscreteColors(
        colorRamps[
          scaleType == 'sequential' ? colorScale : colorScaleDiverging
        ],
        numberOfBins
      )
    ).domain(data.plotdata.map((d) => d.color))
  }
}

export let getCategoricalColorScale = function (data) {
  let colorDomain = [...new Set(data.plotdata.map((d) => d.color))].filter(
    (d) => d != ''
  );
  console.log(allColors)
  // Automatically map regions, income levels, ... to their colors
  let colorRange = colorDomain.map((d) => {
    if (allColors[d.toLowerCase()]) {
      return allColors[d.toLowerCase()];
    } else {
      return wbColors.noData;
    }
  });
  // If no elements in the domain are matched, get the colors from the default color scale as a fallback
  if (colorRange.every((d) => d == wbColors.noData)) {
    colorRange = Object.values(catColors.default);
  }
  return scaleOrdinal(colorDomain, colorRange).unknown(wbColors.noData)
};
