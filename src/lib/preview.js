export function installPreview(version) {
  const key = 'sb:preview';
  const svgNS = 'http://www.w3.org/2000/svg';
  const tags = new Set(
    'main section div span p h1 h2 h3 dl dt dd ul li button a form label input textarea select option img svg g path circle ellipse rect polygon line text textPath defs filter feTurbulence feColorMatrix feComposite title'.split(
      ' ',
    ),
  );
  const attrs = new Set(
    'class id style role type disabled tabindex href src alt draggable value name rows placeholder min max width height viewBox fill stroke stroke-width stroke-linecap stroke-linejoin stroke-dasharray opacity transform d x y x1 y1 x2 y2 cx cy r rx ry points filter font-family font-weight font-size letter-spacing text-anchor textLength lengthAdjust startOffset baseFrequency numOctaves seed values in in2 operator result preserveAspectRatio'.split(
      ' ',
    ),
  );
  let dirty = false;
  let foreignChange = false;
  let scheduledRoute;
  let scheduledRevision;
  let timer;
  const route = () => location.pathname + location.search;
  const revision = () => {
    try {
      return localStorage.getItem('sb:revision');
    } catch {
      return null;
    }
  };
  const urlAllowed = (value) =>
    value.startsWith('/') || value.startsWith('?') || value.startsWith('#');
  const attrAllowed = (name, value) => {
    if (
      !(attrs.has(name) || name.startsWith('aria-') || name === 'data-map-slot')
    )
      return false;
    if (name === 'href') return urlAllowed(value);
    if (name === 'src') return value.startsWith('/samples/');
    if (name === 'style') return !/url\(|expression\(/i.test(value);
    if (name === 'filter') return /^url\(#[\w-]+\)$/.test(value);
    return true;
  };
  const encode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent;
    if (
      node.nodeType !== Node.ELEMENT_NODE ||
      !tags.has(node.localName) ||
      node.localName === 'img'
    )
      return null;
    return {
      tag: node.localName,
      svg: node.namespaceURI === svgNS,
      attrs: [...node.attributes]
        .filter((a) => attrAllowed(a.name, a.value))
        .map((a) => [a.name, a.value]),
      children: node.hasAttribute('data-map-slot')
        ? []
        : [...node.childNodes].map(encode).filter((n) => n !== null),
    };
  };
  const decode = (node) => {
    if (typeof node === 'string') return document.createTextNode(node);
    if (!node || !tags.has(node.tag)) throw new Error('preview');
    const el = node.svg
      ? document.createElementNS(svgNS, node.tag)
      : document.createElement(node.tag);
    for (const [name, value] of node.attrs) {
      if (typeof value === 'string' && attrAllowed(name, value))
        el.setAttribute(name, value);
    }
    for (const child of node.children) el.append(decode(child));
    return el;
  };
  const clear = () => {
    try {
      sessionStorage.removeItem(key);
    } catch {}
  };
  const capture = () => {
    try {
      const main = document.querySelector('#root main.paper');
      if (main?.closest('[data-startup-home]')) return;
      if (foreignChange || scheduledRevision !== revision()) return clear();
      if (!main || (main.querySelector('form') && dirty)) return clear();
      if (
        main
          .getAnimations({ subtree: true })
          .some(
            (a) =>
              a.playState === 'running' &&
              !a.effect?.target?.closest('[data-map-slot]'),
          )
      ) {
        clearTimeout(timer);
        timer = setTimeout(capture, 100);
        return;
      }
      const preview = JSON.stringify({
        version,
        route: route(),
        width: innerWidth,
        height: innerHeight,
        dpr: devicePixelRatio,
        revision: revision(),
        tree: encode(main),
      });
      if (preview.length <= 500000) sessionStorage.setItem(key, preview);
      else clear();
    } catch {
      clear();
    }
  };
  const schedule = () => {
    if (scheduledRoute !== route() || scheduledRevision !== revision())
      dirty = false;
    scheduledRoute = route();
    scheduledRevision = revision();
    clear();
    clearTimeout(timer);
    timer = setTimeout(capture, 500);
  };
  try {
    const preview = JSON.parse(sessionStorage.getItem(key));
    const main = document.querySelector('[data-startup-home] main.paper');
    if (
      main &&
      preview?.version === version &&
      preview.route === route() &&
      preview.width === innerWidth &&
      preview.height === innerHeight &&
      preview.dpr === devicePixelRatio &&
      preview.revision === revision()
    ) {
      const restored = decode(preview.tree);
      const fallback = main.cloneNode(true);
      restored.inert = true;
      restored.setAttribute('aria-busy', 'true');
      main.replaceWith(restored);
      window.addEventListener('resize', () => {
        if (
          restored.isConnected &&
          (innerWidth !== preview.width || innerHeight !== preview.height)
        ) {
          restored.replaceWith(fallback);
          clear();
        }
      });
    }
  } catch {
    clear();
  }
  document.addEventListener('input', (e) => {
    if (e.target.closest('#root main form')) {
      dirty = true;
      clear();
    }
  });
  document.addEventListener('click', (e) => {
    if (e.target.closest('#root main form button')) {
      dirty = true;
      clear();
    }
  });
  window.addEventListener('pagehide', capture);
  window.addEventListener('storage', (e) => {
    if (e.key === 'sb:revision' || e.key === null) {
      foreignChange = true;
      clear();
    }
  });
  window.stampbookPreview = { schedule, clear };
}

export const schedulePreview = () => window.stampbookPreview?.schedule();

export function updatePreviewRevision(list) {
  const text = JSON.stringify(list);
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++)
    hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
  try {
    localStorage.setItem('sb:revision', `${text.length}:${hash >>> 0}`);
  } catch {}
}
