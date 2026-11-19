// Exercise the map/list interaction without requesting public map tiles.
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../assets/js/footprints.js'), 'utf8');

function element() {
  const events = new EventEmitter();
  const classes = new Set();
  return {
    events, classes, hidden: true, open: true, attrs: {},
    classList: { toggle: (name, active) => active ? classes.add(name) : classes.delete(name) },
    setAttribute(name, value) { this.attrs[name] = value; },
    addEventListener: events.on.bind(events),
    append() {},
    focus() { this.focused = true; },
    scrollIntoView(options) { this.scrolled = options; }
  };
}

function layer() {
  const target = element();
  return {
    target, events: new EventEmitter(),
    addTo() { return this; },
    on(names, callback) {
      for (const name of names.split(' ')) this.events.on(name, callback);
      return this;
    },
    getElement() { return target; },
    setZIndexOffset() {}
  };
}

function boot({ missingLeaflet = false, stacked = false, reducedMotion = false } = {}) {
  const canvas = element(), reset = element(), status = element();
  const cities = ['a', 'b', 'c', 'd'].map((id, n) => ({id, name: id, lat: 23 + n, lng: 112 + n}));
  const groups = ['a,b', 'a', 'c,d'].map(ids => {
    const summary = element();
    return Object.assign(element(), {
      summary, dataset: {cities: ids}, querySelector: () => summary,
      parentElement: {getBoundingClientRect: () => ({top: stacked ? 330 : 20})}
    });
  });
  canvas.getBoundingClientRect = () => ({bottom: 320});
  const selectors = {
    '[data-map-canvas]': canvas, '[data-map-status]': status, '[data-map-reset]': reset,
    '#footprints-cities': {textContent: JSON.stringify(cities)}, '#footprints-map': element()
  };
  const root = {querySelector: s => selectors[s], querySelectorAll: () => groups};
  const document = {querySelector: () => root, createElement: element};
  const map = Object.assign(layer(), {
    views: [],
    fitBounds(stops, options) { this.views.push({stops, options}); },
    getSize: () => ({x: 600, y: 400}),
    latLngToContainerPoint: ([lat, lng]) => ({x: lng * 4, y: lat * 4}), remove() {}
  });
  const tiles = Object.assign(layer(), {retries: 0, redraw() { this.retries++; }});
  const markers = [], lines = [];
  const L = {
    map(_, options) { map.options = options; return map; },
    tileLayer: () => tiles, divIcon: options => options,
    marker() { const pin = layer(); markers.push(pin); return pin; },
    polyline() { const line = layer(); lines.push(line); return line; }
  };
  const window = Object.assign(element(), {
    L: missingLeaflet ? undefined : L, matchMedia: () => ({matches: reducedMotion})
  });
  vm.runInNewContext(source, {window, document, console: {warn() {}}});
  return {window, map, tiles, markers, lines, canvas, reset, status, groups};
}

const click = target => target.events.emit('click', {preventDefault() {}});
const openGroups = app => app.groups.map(group => group.open);
const a = boot();
assert.deepEqual(openGroups(a), [false, false, false]);
assert.equal(a.canvas.hidden || a.reset.hidden, false);
assert.equal(a.map.views[0].stops.length, 4);
assert.equal(a.map.options.scrollWheelZoom, false);

click(a.markers[0]); // City A also appears in a route but has its own group.
assert.deepEqual(openGroups(a), [false, true, false]);
assert.equal(a.map.views.at(-1).stops.length, 1);
assert.equal(a.groups[1].scrolled, undefined);
click(a.lines[0]); // Touch-sized transparent route.
assert.deepEqual(openGroups(a), [true, false, false]);
assert.equal(a.map.views.at(-1).stops.length, 2);
assert.equal(a.lines[1].target.attrs['aria-pressed'], 'true');
assert.equal(a.markers[0].target.attrs['aria-pressed'], 'true');
assert.equal(a.markers[1].target.attrs['aria-pressed'], 'true');
click(a.groups[2].summary);
assert.deepEqual(openGroups(a), [false, false, true]);
assert.equal(a.lines[1].target.attrs['aria-pressed'], 'false');
click(a.groups[2].summary);
assert.deepEqual(openGroups(a), [false, false, false]);
assert.equal(a.map.views.at(-1).stops.length, 4);

const m = boot({stacked: true, reducedMotion: true});
const key = {key: ' ', preventDefault() {}, stopPropagation() {}};
m.markers[3].target.events.emit('keydown', key);
assert.equal(m.groups[2].scrolled.behavior, 'instant');
assert.equal(m.groups[2].summary.focused, true);
assert.equal(m.map.views.at(-1).options.animate, false);
click(m.reset);
assert.deepEqual(openGroups(m), [false, false, false]);
click(m.groups[0].summary);
assert.equal(m.groups[0].scrolled, undefined, 'Selecting a summary should keep the reading position');
m.lines[3].target.events.emit('keydown', {...key, key: 'Enter'});
assert.deepEqual(openGroups(m), [false, false, true]);

const badTile = {}, goodTile = {};
a.tiles.events.emit('tileerror', {tile: badTile});
a.tiles.events.emit('tileload', {tile: goodTile});
assert.equal(a.status.hidden, false, 'A successful neighbor must not mask a failed tile');
a.window.events.emit('online');
assert.equal(a.tiles.retries, 1);
a.tiles.events.emit('tileload', {tile: badTile});
assert.equal(a.status.hidden, true);
const fallback = boot({missingLeaflet: true});
assert.deepEqual(openGroups(fallback), [true, true, true]);
assert.equal(fallback.canvas.hidden && fallback.reset.hidden, true);
assert.equal(fallback.status.hidden, false);
console.log('PASS: map overview, city/route/list selection, keyboard, mobile, reduced motion and fallback.');
