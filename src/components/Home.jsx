import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { year } from '../lib/dates.js';
import { go } from '../lib/route.js';
import { sfx } from '../lib/sound.js';
import { useMapMode } from '../lib/stage.js';
import { useStore } from '../lib/store.js';
import { justStamped, stats } from '../lib/trips.js';
import { Page, Runner } from './Book.jsx';
import Left from './Left.jsx';
import MapSlot from './MapSlot.jsx';
import Stamps, { chunk, PER_PAGE } from './Stamps.jsx';

const pad = (n, w) => String(n).padStart(w, '0');

function Mrz({ list }) {
  const s = stats(list);
  return (
    <span className="min-w-0 truncate font-mono text-[0.75rem] text-ink/75 tracking-[0.12em] spread:text-[0.8125rem]">
      {`P<DAYS<<${pad(s.days, 3)}<<KM<<${pad(s.km, 5)}<<<<<<<<<<<<<<<<`}
    </span>
  );
}

function Pager({ page, total, onFlip }) {
  if (total < 2) {
    return <span className="font-mono text-ink-2 text-xs">{page + 1}</span>;
  }
  return (
    <div className="-me-2 flex items-center gap-1">
      <button
        type="button"
        className="btn btn-ghost press size-9 px-0"
        aria-label="Previous page"
        disabled={page === 0}
        onClick={() => onFlip(-1)}
      >
        <CaretLeft weight="bold" className="!size-4" />
      </button>
      <span className="min-w-12 text-center font-mono text-ink-2 text-xs tabular-nums">
        {page + 1} of {total}
      </span>
      <button
        type="button"
        className="btn btn-ghost press size-9 px-0"
        aria-label="Next page"
        disabled={page === total - 1}
        onClick={() => onFlip(1)}
      >
        <CaretRight weight="bold" className="!size-4" />
      </button>
    </div>
  );
}

function span(list) {
  if (!list.length) return null;
  const a = year(list[0].from);
  const b = Math.max(...list.map((t) => year(t.to || t.from)));
  return a === b ? String(a) : `${a} to ${b}`;
}

export default function Home({ list, spread }) {
  const fresh = useStore(justStamped);
  const pages = useMemo(() => chunk(list), [list]);
  const [page, setPage] = useState(() => {
    const i = fresh ? list.findIndex((t) => t.id === fresh) : -1;
    return Math.floor(Math.max(0, i >= 0 ? i : list.length - 1) / PER_PAGE);
  });
  const [dir, setDir] = useState(1);
  useMapMode('all');

  useEffect(() => {
    setPage((p) => (p > pages.length - 1 ? pages.length - 1 : p));
  }, [pages.length]);

  useEffect(() => {
    if (!fresh) return;
    const t = setTimeout(() => justStamped.set(null), 1200);
    return () => clearTimeout(t);
  }, [fresh]);

  const flip = useCallback(
    (d) => {
      setPage((p) => {
        const n = Math.min(pages.length - 1, Math.max(0, p + d));
        if (n !== p) {
          setDir(d);
          sfx.flip();
        }
        return n;
      });
    },
    [pages.length],
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea, [contenteditable]')) return;
      if (e.key === 'ArrowRight') flip(1);
      if (e.key === 'ArrowLeft') flip(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flip]);

  const open = useCallback((id) => go({ view: 'trip', id }), []);
  const add = useCallback(() => go({ view: 'new' }), []);
  const s = stats(list);
  const countLine = list.length
    ? `${s.trips} ${s.trips === 1 ? 'trip' : 'trips'} · ${s.countries} ${s.countries === 1 ? 'country' : 'countries'}`
    : 'No trips yet';

  const stamps = (
    <Stamps
      pages={pages}
      page={page}
      dir={dir}
      fresh={fresh}
      onOpen={open}
      onNew={add}
      onFlip={flip}
      empty={!list.length}
    />
  );

  const stampsPage = (
    <Page
      side="right"
      head={<Runner strong={span(list)}>Visas · Stamps</Runner>}
      foot={
        <>
          <span className="min-w-0 truncate text-ink-2 text-xs">
            {list.length
              ? 'Tap a stamp to open the entry'
              : 'Stamp a trip to start the book'}
          </span>
          <Pager page={page} total={pages.length} onFlip={flip} />
        </>
      }
    >
      {stamps}
    </Page>
  );

  if (spread) {
    return (
      <>
        <Left
          head={<Runner strong={countLine}>Places</Runner>}
          foot={<Mrz list={list} />}
        />
        {stampsPage}
      </>
    );
  }
  return (
    <Page
      head={<Runner strong={countLine}>Places · Stamps</Runner>}
      foot={
        <>
          <span className="min-w-0 truncate text-ink-2 text-xs">
            {list.length
              ? 'Tap a stamp or a pin to open it'
              : 'Stamp a trip to start the book'}
          </span>
          <Pager page={page} total={pages.length} onFlip={flip} />
        </>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col gap-1 px-4 pt-3 sm:px-6 sm:pt-4 short:flex-row short:gap-4 short:pt-2">
        <MapSlot className="h-[40%] flex-none short:h-auto short:w-[44%]" />
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          {stamps}
        </div>
      </div>
    </Page>
  );
}
