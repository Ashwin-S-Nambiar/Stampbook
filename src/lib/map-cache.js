let ready;

export function initMapCache() {
  ready ||= (async () => {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
    try {
      await navigator.serviceWorker.register('/map-cache-sw.js');
      await navigator.serviceWorker.ready;
      if (navigator.serviceWorker.controller) return;
      await new Promise((resolve) => {
        const done = () => {
          navigator.serviceWorker.removeEventListener('controllerchange', done);
          clearTimeout(timer);
          resolve();
        };
        const timer = setTimeout(done, 1200);
        navigator.serviceWorker.addEventListener('controllerchange', done);
      });
    } catch {}
  })();
  return Promise.race([
    ready,
    new Promise((resolve) => setTimeout(resolve, 1500)),
  ]);
}
