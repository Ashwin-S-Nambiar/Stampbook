const STYLE = 'https://tiles.openfreemap.org/styles/positron';

const PAPER = '#eef0e6';
const WATER = '#d2dcd2';
const LAND = '#e6e9dc';
const LINE = '#dcdfd0';
const BORDER = '#aeb4a4';
const LABEL = '#626878';

const HIDDEN = ['Gilgit-Baltistan', 'Azad Kashmir'];

const name = [
  'coalesce',
  ['get', 'name:en'],
  ['get', 'name:latin'],
  ['get', 'name'],
];

function paper(style) {
  style.layers = style.layers.filter(
    (l) =>
      !/shield|highway-name|aeroway|railway|building|highway_minor|highway_path|pier|tunnel|boundary/.test(
        l.id,
      ),
  );
  for (const l of style.layers) {
    l.paint = l.paint || {};
    const p = l.paint;
    if (l.type === 'background') p['background-color'] = PAPER;
    else if (l.type === 'fill') {
      p['fill-color'] = /water/.test(l.id) ? WATER : LAND;
      if (!/water/.test(l.id)) p['fill-opacity'] = 0.55;
      delete p['fill-outline-color'];
    } else if (l.type === 'line') {
      if (/boundary/.test(l.id)) p['line-color'] = BORDER;
      else if (/waterway/.test(l.id)) p['line-color'] = WATER;
      else p['line-color'] = LINE;
    } else if (l.type === 'raster') {
      p['raster-opacity'] = 0;
    } else if (l.type === 'symbol' && l.layout?.['text-field']) {
      l.layout['text-field'] = name;
      if (l.id === 'label_state') {
        l.filter = [
          'all',
          l.filter,
          ['!', ['in', ['get', 'name:en'], ['literal', HIDDEN]]],
        ];
      }
      p['text-color'] = /water/.test(l.id) ? '#7d8a86' : LABEL;
      p['text-halo-color'] = PAPER;
      p['text-halo-width'] = 1.2;
    }
  }
  style.sources.borders = {
    type: 'geojson',
    data: new URL('/borders.json', location.href).href,
  };
  const width = ['interpolate', ['linear'], ['zoom'], 3, 1, 5, 1.2, 12, 3];
  const labels = style.layers.findIndex((l) => l.type === 'symbol');
  style.layers.splice(
    labels < 0 ? style.layers.length : labels,
    0,
    {
      id: 'borders',
      type: 'line',
      source: 'borders',
      filter: ['==', ['get', 'k'], 'i'],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': BORDER,
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 0, 0.5, 4, 1],
        'line-width': width,
      },
    },
    {
      id: 'borders-disputed',
      type: 'line',
      source: 'borders',
      filter: ['==', ['get', 'k'], 'd'],
      paint: {
        'line-color': BORDER,
        'line-dasharray': [1, 2],
        'line-width': width,
      },
    },
  );
  return style;
}

let loading;
export function loadMap() {
  loading ||= Promise.all([
    Promise.all([
      import('maplibre-gl'),
      import('maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'),
    ]).then(([m, w]) => {
      m.setWorkerUrl(w.default);
      return m;
    }),
    import('maplibre-gl/dist/maplibre-gl.css'),
    fetch(STYLE).then((r) => {
      if (!r.ok) throw new Error('style');
      return r.json();
    }),
  ]).then(([m, , style]) => ({
    maplibre: m,
    style: paper(style),
  }));
  loading.catch(() => {
    loading = null;
  });
  return loading;
}
