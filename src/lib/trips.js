import { days } from './dates.js';
import {
  deletePhotos,
  deleteTrip,
  listTrips,
  photosFor,
  putPhotos,
  putTrip,
} from './db.js';
import { forgetPhoto, photoId } from './photos.js';
import { updatePreviewRevision } from './preview.js';
import {
  refreshFirstNotes,
  retireOldSamples,
  seedFirstStamps,
} from './seed.js';
import { createStore } from './store.js';

export const tripsStore = createStore({ status: 'loading', list: [] });
export const justStamped = createStore(null);

const order = (a, b) =>
  a.from < b.from ? -1 : a.from > b.from ? 1 : a.created - b.created;

const setList = (fn) => {
  const list = fn(tripsStore.get().list).sort(order);
  updatePreviewRevision(list);
  tripsStore.set({ status: 'ready', list });
};

export async function refreshTrips() {
  const list = await listTrips();
  setList(() => list);
}

let loading;
export function loadTrips() {
  loading ||= readTrips();
  return loading;
}

async function readTrips() {
  try {
    const { list: kept, retired } = await retireOldSamples(await listTrips());
    let list = kept;
    if (await seedFirstStamps(list, retired > 0)) list = await listTrips();
    if (await refreshFirstNotes(list)) list = await listTrips();
    setList(() => list);
  } catch {
    tripsStore.set({ status: 'error', list: [] });
  }
}

export const newId = photoId;

export async function saveTrip(trip, { added = [], removed = [] } = {}) {
  const now = Date.now();
  const record = { ...trip, created: trip.created || now, updated: now };
  if (added.length) await putPhotos(added);
  await putTrip(record);
  if (removed.length) {
    await deletePhotos(removed);
    removed.forEach(forgetPhoto);
  }
  setList((list) => [...list.filter((t) => t.id !== record.id), record]);
  return record;
}

export async function removeTrip(trip) {
  const photos = await photosFor(trip.id);
  await deleteTrip(
    trip.id,
    photos.map((p) => p.id),
  );
  setList((list) => list.filter((t) => t.id !== trip.id));
  return async () => {
    if (photos.length) await putPhotos(photos);
    await putTrip(trip);
    setList((list) => [...list.filter((t) => t.id !== trip.id), trip]);
  };
}

const RAD = Math.PI / 180;
const km = (a, b) => {
  const h =
    Math.sin(((b.lat - a.lat) * RAD) / 2) ** 2 +
    Math.cos(a.lat * RAD) *
      Math.cos(b.lat * RAD) *
      Math.sin(((b.lng - a.lng) * RAD) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
};

export function stats(list) {
  let distance = 0;
  for (let i = 1; i < list.length; i++) distance += km(list[i - 1], list[i]);
  return {
    trips: list.length,
    countries: new Set(list.map((t) => t.cc)).size,
    days: list.reduce((n, t) => n + days(t.from, t.to), 0),
    km: Math.round(distance),
  };
}

export const findTrip = (id) =>
  tripsStore.get().list.find((t) => t.id === id) || null;
