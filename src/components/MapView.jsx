import { useEffect, useRef, useState } from 'react';
import { loadMap } from '../lib/map.js';
import { design } from '../lib/stamp.js';

const EASE = (t) => 1 - (1 - t) ** 3;
const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function pinElement(tag, label) {
  const el = document.createElement(tag);
  if (tag === 'button') {
    el.type = 'button';
    el.setAttribute('aria-label', label);
  }
  el.className = 'sb-pin';
  const dot = document.createElement('span');
  dot.className = 'sb-dot';
  el.append(dot);
  return el;
}

function MapInner({
  onRetry,
  trips = [],
  mode = 'all',
  focus = null,
  picked = null,
  onPick,
  onOpen,
  cooperative = false,
  intro = false,
  className = '',
}) {
  const box = useRef(null);
  const map = useRef(null);
  const lib = useRef(null);
  const pins = useRef(new Map());
  const pickMarker = useRef(null);
  const placed = useRef(false);
  const handlers = useRef({});
  const [state, setState] = useState('loading');
  handlers.current = { onPick, onOpen, mode, trips };

  useEffect(() => {
    let dead = false;
    const markers = pins.current;
    loadMap()
      .then(({ maplibre, style }) => {
        if (dead || !box.current) return;
        lib.current = maplibre;
        const m = new maplibre.Map({
          container: box.current,
          style,
          center: [78, 22],
          zoom: 1.2,
          minZoom: 0,
          maxZoom: 16,
          attributionControl: false,
          dragRotate: false,
          pitchWithRotate: false,
          touchPitch: false,
          fadeDuration: 0,
        });
        m.touchZoomRotate.disableRotation();
        m.addControl(
          new maplibre.NavigationControl({ showCompass: false }),
          'top-right',
        );
        m.on('click', (e) => {
          if (handlers.current.mode !== 'pick') return;
          handlers.current.onPick?.({ lat: e.lngLat.lat, lng: e.lngLat.lng });
        });
        m.once('load', () => !dead && setState('ready'));
        map.current = m;
      })
      .catch(() => !dead && setState('error'));
    return () => {
      dead = true;
      map.current?.remove();
      map.current = null;
      markers.clear();
      pickMarker.current = null;
      placed.current = false;
    };
  }, []);

  useEffect(() => {
    const m = map.current;
    if (!m || state !== 'ready') return;
    if (cooperative) m.cooperativeGestures.enable();
    else m.cooperativeGestures.disable();
  }, [state, cooperative]);

  useEffect(() => {
    const m = map.current;
    const maplibre = lib.current;
    if (!m || !maplibre || state !== 'ready') return;
    const live = new Set(trips.map((t) => t.id));
    for (const [id, mk] of pins.current) {
      if (!live.has(id)) {
        mk.remove();
        pins.current.delete(id);
      }
    }
    for (const t of trips) {
      let mk = pins.current.get(t.id);
      if (!mk) {
        const el = pinElement('button', `${t.place}, ${t.country}`);
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          if (handlers.current.mode !== 'pick') {
            handlers.current.onOpen?.(t.id);
          }
        });
        mk = new maplibre.Marker({ element: el })
          .setLngLat([t.lng, t.lat])
          .addTo(m);
        pins.current.set(t.id, mk);
      } else {
        mk.setLngLat([t.lng, t.lat]);
      }
      const el = mk.getElement();
      el.style.setProperty('--ink', design(t).color);
      el.dataset.state =
        mode === 'pick'
          ? 'dim'
          : mode === 'one'
            ? t.id === focus?.id
              ? 'focus'
              : 'dim'
            : 'rest';
      el.tabIndex = el.dataset.state === 'dim' || !onOpen ? -1 : 0;
    }
  }, [state, trips, mode, focus, onOpen]);

  const focusId = focus?.id;
  const focusLat = focus?.lat;
  const focusLng = focus?.lng;
  const count = trips.length;

  useEffect(() => {
    const m = map.current;
    const maplibre = lib.current;
    if (!m || !maplibre || state !== 'ready' || mode === 'pick') return;
    const first = !placed.current;
    placed.current = true;
    const instant = still();
    if (mode === 'one' && focusId != null) {
      const target = { center: [focusLng, focusLat], zoom: 7 };
      if (first && !intro) {
        m.jumpTo(target);
        return;
      }
      if (first) m.jumpTo({ center: target.center, zoom: 2.6 });
      m.flyTo({
        ...target,
        duration: instant ? 0 : 1400,
        curve: 1.3,
        essential: true,
      });
      return;
    }
    const all = handlers.current.trips;
    if (!all.length || count === 0) {
      m.easeTo({
        center: [78, 22],
        zoom: 1.2,
        duration: first || instant ? 0 : 900,
      });
      return;
    }
    const b = new maplibre.LngLatBounds();
    for (const t of all) b.extend([t.lng, t.lat]);
    const pad = Math.min(64, m.getContainer().clientWidth / 6);
    m.fitBounds(b, {
      padding: pad,
      maxZoom: all.length === 1 ? 4 : 5,
      duration: first || instant ? 0 : 1300,
      easing: EASE,
      essential: true,
    });
  }, [state, mode, focusId, focusLat, focusLng, count, intro]);

  useEffect(() => {
    const m = map.current;
    const maplibre = lib.current;
    if (!m || !maplibre || state !== 'ready') return;
    if (mode !== 'pick' || !picked) {
      pickMarker.current?.remove();
      pickMarker.current = null;
      return;
    }
    if (!pickMarker.current) {
      const el = pinElement('div');
      el.dataset.state = 'focus';
      pickMarker.current = new maplibre.Marker({ element: el, draggable: true })
        .setLngLat([picked.lng, picked.lat])
        .addTo(m);
      pickMarker.current.on('dragend', () => {
        const p = pickMarker.current.getLngLat();
        handlers.current.onPick?.({ lat: p.lat, lng: p.lng });
      });
    } else {
      pickMarker.current.setLngLat([picked.lng, picked.lat]);
    }
    pickMarker.current
      .getElement()
      .style.setProperty('--ink', picked.color || '#1f2430');
    if (picked.fly) {
      m.flyTo({
        center: [picked.lng, picked.lat],
        zoom: Math.max(m.getZoom(), picked.zoom || 6),
        duration: still() ? 0 : 1100,
        curve: 1.3,
        essential: true,
      });
    }
  }, [state, picked, mode]);

  return (
    <div
      className={`relative isolate overflow-hidden bg-paper-2/60 ${className}`}
    >
      <div
        ref={box}
        className={`!absolute inset-0 transition-opacity duration-500 ease-out ${state === 'ready' ? 'opacity-100' : 'opacity-0'}`}
      />
      {state === 'error' && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="grid justify-items-center gap-3 p-4 text-center">
            <span className="text-ink-2 text-sm">
              The map didn’t load. Check your connection.
            </span>
            <button
              type="button"
              className="btn btn-line ring-hover press"
              onClick={onRetry}
            >
              Try again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MapView(props) {
  const [attempt, setAttempt] = useState(0);
  return (
    <MapInner
      key={attempt}
      {...props}
      onRetry={() => setAttempt((n) => n + 1)}
    />
  );
}
