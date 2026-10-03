const NAME = 'sb:map:v1';
const LIMIT = 160;
const DAY = 86400000;
const inFlight = new Map();

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) =>
  event.waitUntil(self.clients.claim()),
);

async function resource(request) {
  let cache;
  let cached;
  try {
    cache = await caches.open(NAME);
    cached = await cache.match(request.url);
  } catch {
    return fetch(request);
  }
  const url = new URL(request.url);
  const mutable =
    url.pathname.startsWith('/styles/') ||
    url.pathname === '/planet' ||
    url.pathname === '/borders.json';
  const maxAge = Number(
    cached?.headers.get('cache-control')?.match(/max-age=(\d+)/)?.[1],
  );
  const lifetime = mutable ? DAY : maxAge ? maxAge * 1000 : 30 * DAY;
  if (
    cached &&
    Date.now() - Number(cached.headers.get('x-sb-cached-at')) < lifetime
  )
    return cached;
  try {
    const response = await fetch(request);
    if (response.ok && response.type !== 'opaque') {
      try {
        const headers = new Headers(response.headers);
        headers.set('x-sb-cached-at', String(Date.now()));
        const stored = new Response(await response.clone().arrayBuffer(), {
          status: response.status,
          headers,
        });
        await cache.put(request.url, stored);
        const keys = await cache.keys();
        await Promise.all(
          keys
            .slice(0, Math.max(0, keys.length - LIMIT))
            .map((key) => cache.delete(key)),
        );
      } catch {}
    }
    return response;
  } catch (error) {
    if (cached) return cached;
    throw error;
  }
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (
    event.request.method !== 'GET' ||
    !(
      url.origin === 'https://tiles.openfreemap.org' ||
      (url.origin === self.location.origin && url.pathname === '/borders.json')
    )
  )
    return;
  event.respondWith(
    (async () => {
      const key = event.request.url;
      if (!inFlight.has(key)) {
        const pending = resource(event.request).finally(() =>
          inFlight.delete(key),
        );
        inFlight.set(key, pending);
      }
      return (await inFlight.get(key)).clone();
    })(),
  );
});
