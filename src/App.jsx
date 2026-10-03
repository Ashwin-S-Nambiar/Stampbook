import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Book, Page } from './components/Book.jsx';
import Entry from './components/Entry.jsx';
import Footer from './components/Footer.jsx';
import Form from './components/Form.jsx';
import Header from './components/Header.jsx';
import Home from './components/Home.jsx';
import MapSlot from './components/MapSlot.jsx';
import MapView from './components/MapView.jsx';
import Toaster from './components/Toaster.jsx';
import { useSpread } from './lib/media.js';
import { go, routeStore } from './lib/route.js';
import { sfx } from './lib/sound.js';
import { mapHost, mapStore, pickHandler, slotStore } from './lib/stage.js';
import { useStore } from './lib/store.js';
import { loadTrips, tripsStore } from './lib/trips.js';

const HOME_TITLE = 'Stampbook · Every trip, stamped';

function Missing({ spread }) {
  useEffect(() => {
    document.title = 'Not found · Stampbook';
    mapStore.set((m) => ({ ...m, mode: 'all', focusId: null }));
  }, []);
  return (
    <Page side={spread ? 'right' : 'single'}>
      <div className="grid flex-1 place-items-center content-center gap-4 p-6 text-center">
        <p className="text-balance font-semibold text-lg">
          This stamp isn’t in the book.
        </p>
        <p className="max-w-xs text-ink-2 text-sm">
          It may have been removed, or it was stamped on another device.
        </p>
        <button
          type="button"
          className="btn btn-ink ring-hover press"
          onClick={() => go({ view: 'home' }, { replace: true })}
        >
          See all stamps
        </button>
      </div>
    </Page>
  );
}

function SharedMap({ list }) {
  const cfg = useStore(mapStore);
  const open = useCallback((id) => go({ view: 'trip', id }), []);
  const onPick = useCallback((p) => pickHandler.current?.(p), []);
  const focus = cfg.focusId
    ? list.find((t) => t.id === cfg.focusId) || null
    : null;
  return createPortal(
    <MapView
      trips={list}
      mode={cfg.mode === 'one' && !focus ? 'all' : cfg.mode}
      focus={focus}
      picked={cfg.picked}
      onPick={onPick}
      onOpen={open}
      cooperative={cfg.cooperative}
      className="h-full w-full"
    />,
    mapHost,
  );
}

function MapPage() {
  const headRef = useCallback(
    (el) => slotStore.set((s) => ({ ...s, head: el })),
    [],
  );
  const footRef = useCallback(
    (el) => slotStore.set((s) => ({ ...s, foot: el })),
    [],
  );
  const overRef = useCallback(
    (el) => slotStore.set((s) => ({ ...s, over: el })),
    [],
  );
  return (
    <Page side="left" headRef={headRef} footRef={footRef}>
      <div className="relative mx-7 my-4 flex flex-1">
        <MapSlot className="flex-1" />
        <div
          ref={overRef}
          className="pointer-events-none absolute inset-x-3 top-3 z-20 me-14 grid *:col-start-1 *:row-start-1"
        />
      </div>
    </Page>
  );
}

const EASE = [0.23, 1, 0.32, 1];

const pageMotion = (shift) => ({
  enter: (d) => ({ opacity: 0, x: d * shift }),
  center: { opacity: 1, x: 0, transition: { duration: 0.28, ease: EASE } },
  exit: (d) => ({
    opacity: 0,
    x: d * -shift * 0.5,
    transition: { duration: 0.16, ease: EASE },
  }),
});

export default function App() {
  const route = useStore(routeStore);
  const { status, list } = useStore(tripsStore);
  const spread = useSpread();
  const opened = useRef(false);

  useEffect(() => {
    loadTrips();
  }, []);

  useEffect(() => {
    if (route.view === 'home') document.title = HOME_TITLE;
  }, [route.view]);

  useEffect(() => {
    const onTap = (e) => {
      const el = e.target.closest?.('button, [role="button"], a');
      if (!el || el.closest('[data-sfx="none"]') || el.disabled) return;
      sfx.tap();
    };
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target.closest?.('input, textarea, select, [contenteditable]'))
        return;
      if (e.key === 'n' && routeStore.get().view === 'home') {
        e.preventDefault();
        go({ view: 'new' });
      }
    };
    window.addEventListener('pointerdown', onTap);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onTap);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  const ready = status !== 'loading';
  useEffect(() => {
    if (ready) opened.current = true;
  }, [ready]);
  const trip =
    route.id && ready ? list.find((t) => t.id === route.id) || null : null;

  let view = null;
  let key = route.view + (route.id || '');
  if (!ready) {
    key = 'loading';
    view = <Page side={spread ? 'right' : 'single'} />;
  } else if (route.view === 'home') view = <Home list={list} spread={spread} />;
  else if (route.view === 'new') view = <Form spread={spread} list={list} />;
  else if (!trip) view = <Missing spread={spread} />;
  else if (route.view === 'edit')
    view = <Form key={trip.id} trip={trip} spread={spread} list={list} />;
  else view = <Entry key={trip.id} trip={trip} spread={spread} />;

  return (
    <MotionConfig reducedMotion="user">
      <div className="grid h-full grid-cols-[minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)_auto] ps-[env(safe-area-inset-left)] pe-[env(safe-area-inset-right)]">
        <Header showAdd={route.view === 'home'} />
        <Book>
          {spread && <MapPage />}
          <AnimatePresence mode="popLayout" initial={false} custom={route.dir}>
            <motion.div
              key={key}
              custom={route.dir}
              variants={pageMotion(spread ? 18 : 36)}
              initial={opened.current ? 'enter' : false}
              animate="center"
              exit="exit"
              className="flex min-h-0 min-w-0 flex-1"
            >
              {view}
            </motion.div>
          </AnimatePresence>
        </Book>
        <Footer />
      </div>
      {ready && <SharedMap list={list} />}
      <Toaster />
    </MotionConfig>
  );
}
