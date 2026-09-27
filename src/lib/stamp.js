import { alpha3 } from './countries.js';
import { stampDate } from './dates.js';

export const INKS = {
  red: '#b3303a',
  blue: '#2a4b8d',
  green: '#2c6a4c',
};
const INK_ORDER = ['red', 'blue', 'green'];
const SHAPES = ['circle', 'rect', 'oct', 'oval', 'notch', 'band'];

export function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function design(trip) {
  const h = hash(trip.id || 'x');
  const ink = INK_ORDER[(h >>> 17) % 3];
  return {
    ink,
    color: INKS[ink],
    shape: SHAPES[h % SHAPES.length],
    rot: ((h >>> 3) % 17) - 8,
    dx: ((h >>> 9) % 13) - 6,
    dy: ((h >>> 13) % 11) - 5,
    seed: (h >>> 5) % 97,
  };
}

export function lines(trip) {
  return {
    country: (trip.country || 'Somewhere').toUpperCase(),
    place: (trip.place || 'Unnamed').toUpperCase(),
    code: alpha3(trip.cc),
    from: trip.from ? stampDate(trip.from) : '·· ··· ····',
    to: trip.to && trip.to !== trip.from ? stampDate(trip.to, false) : '',
  };
}

export function fit(text, maxWidth, base, spacing, min = 8, advance = 0.47) {
  const n = Math.max(text.length, 1);
  const size = Math.max(
    min,
    Math.min(base, (maxWidth - (n - 1) * spacing) / (n * advance)),
  );
  const width = n * size * advance + (n - 1) * spacing;
  return { size, squeeze: width > maxWidth ? maxWidth : null };
}
