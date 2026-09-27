import { createStore } from './store.js';

function read(dir = 0) {
  const q = new URLSearchParams(location.search);
  if (q.has('new')) return { view: 'new', dir };
  if (q.get('edit')) return { view: 'edit', id: q.get('edit'), dir };
  if (q.get('trip')) return { view: 'trip', id: q.get('trip'), dir };
  return { view: 'home', dir };
}

const depthOf = () => history.state?.depth || 0;
let depth = depthOf();

export const routeStore = createStore(read());

window.addEventListener('popstate', () => {
  const next = depthOf();
  const dir = next < depth ? -1 : 1;
  depth = next;
  routeStore.set(read(dir));
});

export function go(next, { replace = false, dir } = {}) {
  const url = new URL(location.href);
  url.search = '';
  if (next.view === 'new') url.search = '?new';
  if (next.view === 'edit') url.searchParams.set('edit', next.id);
  if (next.view === 'trip') url.searchParams.set('trip', next.id);
  if (replace) {
    history.replaceState(history.state, '', url);
  } else {
    depth += 1;
    history.pushState({ depth }, '', url);
  }
  routeStore.set(read(dir ?? (next.view === 'home' && replace ? -1 : 1)));
}

export function back(fallback = { view: 'home' }) {
  if (depthOf() > 0) history.back();
  else go(fallback, { replace: true, dir: -1 });
}
