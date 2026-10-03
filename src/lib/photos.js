import { getPhoto } from './db.js';

const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

async function draw(bitmap, max, quality) {
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, w, h);
  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', quality),
  );
  if (!blob) throw new Error('encode');
  return { blob, w, h };
}

export async function makePhoto(file, trip) {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: 'from-image',
  });
  try {
    const full = await draw(bitmap, 2000, 0.86);
    const thumb = await draw(bitmap, 560, 0.8);
    return {
      id: uid(),
      trip,
      full: full.blob,
      thumb: thumb.blob,
      w: full.w,
      h: full.h,
      at: Date.now(),
    };
  } finally {
    bitmap.close?.();
  }
}

const urls = new Map();

export function localUrl(photo, size) {
  if (!photo[size] && photo.source) return photo.source;
  const key = `${photo.id}:${size}`;
  if (!urls.has(key)) urls.set(key, URL.createObjectURL(photo[size]));
  return urls.get(key);
}

const loading = new Map();
export function loadPhoto(id) {
  if (!loading.has(id)) {
    loading.set(
      id,
      getPhoto(id).then((p) => {
        if (!p) loading.delete(id);
        return p || null;
      }),
    );
  }
  return loading.get(id);
}

export function forgetPhoto(id) {
  loading.delete(id);
  for (const size of ['full', 'thumb']) {
    const key = `${id}:${size}`;
    if (urls.has(key)) {
      URL.revokeObjectURL(urls.get(key));
      urls.delete(key);
    }
  }
}

export const photoId = uid;
