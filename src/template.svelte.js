import { mount } from 'svelte';
import Viz from './Viz.svelte';

// Add the generated css file to index.html
let font_link = document.createElement("link");
font_link.setAttribute("rel", "stylesheet");
document.body.appendChild(font_link);
font_link.setAttribute("href", window.Flourish.static_prefix + "/style.css");

// WB viz style guide typography css
let typograph_link = document.createElement("link");
typograph_link.setAttribute("rel", "stylesheet");
document.body.appendChild(typograph_link);
typograph_link.setAttribute("href", window.Flourish.static_prefix + "/typography.css");

// WB viz style guide colors css
let colors_link = document.createElement("link");
colors_link.setAttribute("rel", "stylesheet");
document.body.appendChild(colors_link);
colors_link.setAttribute("href", window.Flourish.static_prefix + "/colors.css");

export var data = {};

// Set up state as a serializable object
export var state = {
  beeStroke: "#ffffff",
  beeStrokeWidth: 1,
  beeOpacity: 1,
  beeSpacing: 0,
  logScale: false,
  divideValues: 1,
  units: '',
  axisTitle: '',
  tickNumber: 5,
  ySort: 'asInData',
  yReverse: false,
  scaleType: "sequential",
  linearOrBinned: "linear",
  colorScale: "seq",
  colorScaleDiverging: "div",
  binningMode: "fixedWidth",
  numberOfBins: 4,
  //categoricalColorPalette: "default",
  domainAutoCustom: "auto",
  domainMin: undefined,
  domainMax: undefined,
  showLegend: true,
  legendTitle: "",
  includeNoData: false,
  noDataLabel: "No data",
  unitLabel: "",
  title: 'Title',
  subtitle: 'Subtitle',
  addAnnotation: false,
  annotationValue: 0,
  annotationText: '',
  notesTitle: 'Source: ', 
  notes: 'World Bank',
  includeLogo: true
};

// Create a separate reactive store for internal Svelte use
let reactiveState = $state({});

// The draw function is called when the template first loads
export function draw() {
  reactiveState = { ...state };
  reactiveState.data = data;

  mount(Viz, {
    target: document.body,
    props: reactiveState, // Pass the reactive state to Svelte
  });
}

// The update function is called whenever the user changes a data table or settings
// in the visualisation editor, or when changing slides in the story editor.
// Tip: to make your template work nicely in the story editor, ensure that all user
// interface controls such as buttons and sliders update the state and then call update.
export function update() {
  if (state.radius <= 0) throw new Error('Radius must be positive');

  // Update reactive state with changes from Flourish
  Object.assign(reactiveState, state);
  reactiveState.data = data;
}
