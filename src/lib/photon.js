import { countryName } from './countries.js';

const BASE = 'https://photon.komoot.io';

function toPlace(f) {
  const p = f.properties;
  const [lng, lat] = f.geometry.coordinates;
  const cc = (p.countrycode || '').toLowerCase();
  const name = p.name || p.city || p.county || p.state || p.country || '';
  const within = [p.city, p.county, p.state]
    .filter((x, i, a) => x && x !== name && a.indexOf(x) === i)
    .slice(0, 2);
  return {
    key: `${p.osm_type}${p.osm_id}`,
    name,
    region: within[0] || '',
    detail: [...within, countryName(cc, p.country)].filter(Boolean).join(', '),
    country: countryName(cc, p.country || ''),
    cc,
    lat,
    lng,
    kind: p.osm_value,
    extent: p.extent,
  };
}

export async function search(q, { signal, near } = {}) {
  const url = new URL('/api/', BASE);
  url.searchParams.set('q', q);
  url.searchParams.set('limit', '7');
  url.searchParams.set('lang', 'en');
  if (near) {
    url.searchParams.set('lat', near.lat.toFixed(3));
    url.searchParams.set('lon', near.lng.toFixed(3));
    url.searchParams.set('location_bias_scale', '0.2');
  }
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Photon ${res.status}`);
  const json = await res.json();
  const seen = new Set();
  return json.features
    .map(toPlace)
    .filter((p) => p.name && p.cc)
    .filter((p) => {
      const k = `${p.name}|${p.detail}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
}

export async function reverse({ lat, lng }, { signal } = {}) {
  const url = new URL('/reverse', BASE);
  url.searchParams.set('lat', lat.toFixed(5));
  url.searchParams.set('lon', lng.toFixed(5));
  url.searchParams.set('lang', 'en');
  url.searchParams.set('limit', '1');
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Photon ${res.status}`);
  const json = await res.json();
  const f = json.features[0];
  if (!f) return null;
  const place = toPlace(f);
  const p = f.properties;
  const name = p.city || p.county || p.state || place.name;
  return { ...place, name, lat, lng };
}
