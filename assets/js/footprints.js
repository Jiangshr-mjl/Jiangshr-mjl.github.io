(function () {
  'use strict';

  const root = document.querySelector('[data-footprints]');
  if (!root) return;
  const canvas = root.querySelector('[data-map-canvas]');
  const status = root.querySelector('[data-map-status]');
  const reset = root.querySelector('[data-map-reset]');
  const details = Array.from(root.querySelectorAll('[data-footprint-group]'));
  if (!details.length) return;

  let map;
  try {
    const L = window.L;
    const cityData = JSON.parse(root.querySelector('#footprints-cities').textContent);
    const cities = new Map(cityData.map(city => [city.id, city]));
    const groups = details.map(detail => ({
      detail,
      summary: detail.querySelector('summary'),
      stops: detail.dataset.cities.split(',').map(id => cities.get(id))
    }));
    const markers = [];
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const position = city => [city.lat, city.lng];
    let selected = null;

    canvas.hidden = false;
    map = L.map(root.querySelector('#footprints-map'), {
      scrollWheelZoom: false,
      zoomSnap: 0.25,
      zoomAnimation: !motion.matches,
      fadeAnimation: !motion.matches,
      markerZoomAnimation: !motion.matches
    });

    function frame(stops, animate) {
      map.fitBounds(stops.map(position), {
        paddingTopLeft: [38, 36],
        paddingBottomRight: [48, 36],
        maxZoom: 9,
        animate: animate && !motion.matches
      });
    }
    frame(cityData, false);

    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    const failed = new Set();
    tiles.on('tileerror', event => {
      failed.add(event.tile);
      status.hidden = false;
    });
    tiles.on('tileload tileunload', event => {
      failed.delete(event.tile);
      status.hidden = failed.size === 0;
    });
    function retryTiles() {
      if (failed.size) tiles.redraw();
    }
    tiles.addTo(map);

    // Label the selected stops first, leaving room for nearby dots and names.
    function placeLabels() {
      const size = map.getSize();
      const points = markers.map(({city, element}) => ({
        city, element, point: map.latLngToContainerPoint(position(city)),
        selected: selected && selected.stops.includes(city)
      })).sort((a, b) => Number(b.selected) - Number(a.selected));
      const occupied = points.map(({point}) => [point.x - 5, point.y - 5, point.x + 5, point.y + 5]);
      for (const {city, element, point} of points) {
        const width = city.name.length * 14 + 12;
        const y = point.y;
        const x = point.x;
        const sides = [[x + 10, y - 11, x + 10 + width, y + 11], [x - 10 - width, y - 11, x - 10, y + 11]];
        const fits = sides.findIndex(([left, top, right, bottom]) =>
          left >= 0 && top >= 0 && right <= size.x && bottom <= size.y &&
          occupied.every(box => right < box[0] || bottom < box[1] || left > box[2] || top > box[3])
        );
        element.classList.toggle('has-label', fits >= 0);
        element.classList.toggle('label-left', fits === 1);
        if (fits >= 0) occupied.push(sides[fits]);
      }
    }

    function select(group, fromMap) {
      selected = group;
      for (const item of groups) {
        const active = item === group;
        item.detail.open = active;
        item.detail.classList.toggle('is-selected', active);
        if (item.route) {
          item.route.classList.toggle('is-selected', active);
          item.route.setAttribute('aria-pressed', String(active));
        }
      }
      for (const {city, marker, element} of markers) {
        const active = Boolean(group && group.stops.includes(city));
        marker.setZIndexOffset(active ? 1000 : 0);
        element.classList.toggle('is-selected', active);
        element.setAttribute('aria-pressed', String(active));
      }
      frame(group ? group.stops : cityData, true);
      placeLabels();
      if (fromMap && group.detail.parentElement.getBoundingClientRect().top >= canvas.getBoundingClientRect().bottom - 1) {
        group.summary.focus({preventScroll: true});
        group.detail.scrollIntoView({block: 'start', behavior: motion.matches ? 'instant' : 'smooth'});
      }
    }

    function bindLayer(layer, group, label) {
      const element = layer.getElement();
      element.setAttribute('tabindex', '0');
      element.setAttribute('role', 'button');
      element.setAttribute('aria-label', label);
      element.setAttribute('aria-pressed', 'false');
      layer.on('click', () => select(group, true));
      element.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        event.stopPropagation();
        if (!event.repeat) select(group, true);
      });
      return element;
    }

    for (const group of groups) {
      if (group.stops.length < 2) continue;
      const line = group.stops.map(position);
      // A wider transparent stroke also accepts taps between the visible dashes.
      L.polyline(line, {weight: 16, opacity: 0, bubblingMouseEvents: false})
        .addTo(map).on('click', () => select(group, true));
      const route = L.polyline(line, {className: 'footprint-route', color: '#426782', weight: 3, dashArray: '6 5', bubblingMouseEvents: false}).addTo(map);
      group.route = bindLayer(route, group, '查看行程：' + group.stops.map(city => city.name).join('、'));
    }
    const icon = L.divIcon({className: 'footprint-marker', html: '', iconSize: [28, 28], iconAnchor: [14, 14]});
    for (const city of cityData) {
      // A city with both a solo entry and a route opens its own entry from the pin.
      const owner = groups.find(group => group.stops.length === 1 && group.stops[0] === city)
        || groups.find(group => group.stops.includes(city));
      if (!owner) continue;
      const marker = L.marker(position(city), {icon, title: city.name, riseOnHover: true}).addTo(map);
      const element = bindLayer(marker, owner, '查看' + city.name + '的足迹');
      const dot = document.createElement('span');
      dot.className = 'footprint-marker-dot';
      const label = document.createElement('span');
      label.className = 'footprint-marker-label';
      label.textContent = city.name;
      element.append(dot, label);
      markers.push({city, marker, element});
    }
    map.on('moveend resize', placeLabels);
    placeLabels();
    for (const group of groups) {
      group.detail.open = false;
      group.summary.addEventListener('click', event => {
        event.preventDefault();
        select(group.detail.open ? null : group, false);
      });
    }
    reset.addEventListener('click', () => {
      retryTiles();
      select(null, false);
    });
    window.addEventListener('online', retryTiles);
    reset.hidden = false;
  } catch (error) {
    if (map) map.remove();
    canvas.hidden = true;
    reset.hidden = true;
    status.hidden = false;
    details.forEach(detail => { detail.open = true; });
    console.warn('足迹地图未能初始化。', error);
  }
}());
