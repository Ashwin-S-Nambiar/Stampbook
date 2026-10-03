const DB = 'stampbook';

let opening;
function open() {
  if (!opening) {
    opening = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore('trips', { keyPath: 'id' });
        const photos = req.result.createObjectStore('photos', {
          keyPath: 'id',
        });
        photos.createIndex('trip', 'trip');
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return opening;
}

async function run(stores, mode, fn) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(stores, mode);
    const out = fn(tx);
    tx.oncomplete = () => resolve(out?.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export const listTrips = async () =>
  (await run('trips', 'readonly', (tx) => tx.objectStore('trips').getAll())) ||
  [];

export const putTrip = (trip) =>
  run('trips', 'readwrite', (tx) => tx.objectStore('trips').put(trip));

// Keep bundled entries and their photo references together, without fetching
// or decoding images on the startup path.
export const putTripsWithPhotos = (trips, photos, removed = []) =>
  run(['trips', 'photos'], 'readwrite', (tx) => {
    const images = tx.objectStore('photos');
    for (const id of removed) images.delete(id);
    for (const photo of photos) images.put(photo);
    const entries = tx.objectStore('trips');
    for (const trip of trips) entries.put(trip);
  });

export const getPhoto = (id) =>
  run('photos', 'readonly', (tx) => tx.objectStore('photos').get(id));

export const photosFor = (trip) =>
  run('photos', 'readonly', (tx) =>
    tx.objectStore('photos').index('trip').getAll(trip),
  );

export const putPhotos = (list) =>
  run('photos', 'readwrite', (tx) => {
    const s = tx.objectStore('photos');
    for (const p of list) s.put(p);
  });

export const deletePhotos = (ids) =>
  run('photos', 'readwrite', (tx) => {
    const s = tx.objectStore('photos');
    for (const id of ids) s.delete(id);
  });

export const deleteTrip = (id, photoIds = []) =>
  run(['trips', 'photos'], 'readwrite', (tx) => {
    tx.objectStore('trips').delete(id);
    for (const p of photoIds) tx.objectStore('photos').delete(p);
  });
