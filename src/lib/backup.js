import { today } from './dates.js';
import { listTrips, photosFor, putPhotos, putTrip } from './db.js';
import { refreshTrips } from './trips.js';

const toData = (blob) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });

const toBlob = async (data) => (await fetch(data)).blob();

export async function exportBackup() {
  const trips = await listTrips();
  const photos = [];
  for (const t of trips) {
    for (const p of await photosFor(t.id)) {
      photos.push({
        ...p,
        full: await toData(p.full),
        thumb: await toData(p.thumb),
      });
    }
  }
  const blob = new Blob(
    [JSON.stringify({ app: 'stampbook', version: 1, trips, photos })],
    { type: 'application/json' },
  );
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `stampbook-${today()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  return trips.length;
}

export async function importBackup(file) {
  const data = JSON.parse(await file.text());
  if (data?.app !== 'stampbook' || !Array.isArray(data.trips)) {
    throw new Error('not a backup');
  }
  const photos = [];
  for (const p of data.photos || []) {
    photos.push({
      ...p,
      full: await toBlob(p.full),
      thumb: await toBlob(p.thumb),
    });
  }
  if (photos.length) await putPhotos(photos);
  for (const t of data.trips) {
    if (t?.id && t.lat != null && t.lng != null && t.from) await putTrip(t);
  }
  await refreshTrips();
  return data.trips.length;
}
