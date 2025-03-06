export let getValue = function(id, data){
    if(data.find(d => d.id == id)){
      return data.find(d => d.id == id).value
    }
    else return undefined
  }

export let getFill = function (data, id, sColorScale, cColorScale, noDataColor) {
  let valueType = data.metadata.color.type
  if (valueType == "number") {
    if (getValue(id, data)) {
      return sColorScale(getValue(id, data));
    } else {
      return noDataColor;
    }
  }
  if (valueType == "string") {
    if (getValue(id, data)) {
      return cColorScale(getValue(id, data));
    }
    else {
      return noDataColor;
    }
  }
};