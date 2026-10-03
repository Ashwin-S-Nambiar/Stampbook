import {
  ArrowLeft,
  CaretLeft,
  CaretRight,
  PencilSimple,
  Trash,
} from '@phosphor-icons/react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { alpha3 } from '../lib/countries.js';
import { days, niceRange, since } from '../lib/dates.js';
import { useMedia } from '../lib/media.js';
import { back, go } from '../lib/route.js';
import { sfx } from '../lib/sound.js';
import { useMapMode } from '../lib/stage.js';
import { toast, useStore } from '../lib/store.js';
import { removeTrip, tripsStore } from '../lib/trips.js';
import { Page, Runner } from './Book.jsx';
import Left from './Left.jsx';
import MapSlot from './MapSlot.jsx';
import { Thumb, Viewer } from './Photos.jsx';
import Stamp from './Stamp.jsx';

const mrz = (trip) =>
  `V<${alpha3(trip.cc)}${trip.place.toUpperCase().replace(/[^A-Z]+/g, '<')}<<${trip.from.replaceAll('-', '')}<<<<<<<<`;

function BackLink() {
  return (
    <button
      type="button"
      onClick={() => back()}
      className="group -ms-2 flex min-w-0 items-center gap-1.5 rounded px-2 py-2 text-ink-2 hover-fine:text-ink"
    >
      <ArrowLeft
        weight="bold"
        className="size-4 flex-none transition-transform duration-150 group-hover-fine:-translate-x-0.5"
      />
      <span className="eyebrow truncate">All stamps</span>
    </button>
  );
}

function Prints({ ids, onOpen, place }) {
  if (!ids.length) return null;
  return (
    <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
      {ids.map((id, i) => (
        <li key={id}>
          <button
            type="button"
            onClick={() => onOpen(i)}
            aria-label={`Open photo ${i + 1}`}
            className="press ring-hover block w-full rounded-[3px] bg-[#fbfbf7] p-1 text-ink-3 shadow-[0_1px_2px_rgb(0_0_0/0.18),0_4px_10px_-6px_rgb(0_0_0/0.3)]"
          >
            <Thumb
              id={id}
              alt={`${place}, photo ${i + 1}`}
              className="aspect-square rounded-xs"
            />
          </button>
        </li>
      ))}
    </ul>
  );
}

function Facts({ trip, aside }) {
  const n = days(trip.from, trip.to);
  return (
    <div className="grid gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="grid min-w-0 flex-1 gap-1 pt-2">
          <h1 className="text-balance font-bold text-[1.75rem] leading-[1.1] tracking-[-0.01em] spread:text-[2rem]">
            {trip.place}
          </h1>
          <p className="text-ink-2">
            {[trip.region, trip.country].filter(Boolean).join(', ')}
          </p>
        </div>
        {aside}
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5 border-rule border-y py-3 text-[0.9375rem]">
        <dt className="eyebrow self-center text-ink-2">Dates</dt>
        <dd>
          {niceRange(trip.from, trip.to)}
          {n > 1 && <span className="text-ink-2"> · {n} days</span>}
        </dd>
        <dt className="eyebrow self-center text-ink-2">At</dt>
        <dd className="font-mono text-[0.8125rem] text-ink-2">
          {trip.lat.toFixed(4)}, {trip.lng.toFixed(4)}
        </dd>
      </dl>
      {trip.notes ? (
        <p className="whitespace-pre-line text-pretty text-[0.9375rem] leading-relaxed">
          {trip.notes}
        </p>
      ) : (
        <p className="text-ink-3 text-sm">No notes for this trip.</p>
      )}
    </div>
  );
}

export default function Entry({ trip, spread }) {
  const [viewing, setViewing] = useState(null);
  const ids = trip.photos || [];
  useMapMode('one', trip.id);
  const { list } = useStore(tripsStore);
  const at = list.findIndex((t) => t.id === trip.id);
  const step = (d) => {
    const next = list[at + d];
    if (next) go({ view: 'trip', id: next.id }, { replace: true, dir: d });
  };
  const pager = list.length > 1 && (
    <div className="-me-2 flex flex-none items-center gap-0.5">
      <button
        type="button"
        className="btn btn-ghost press size-9 px-0"
        aria-label="Previous stamp"
        disabled={at <= 0}
        onClick={() => step(-1)}
      >
        <CaretLeft weight="bold" className="size-4!" />
      </button>
      <span className="min-w-12 text-center font-mono text-ink-2 text-xs tabular-nums">
        {at + 1} of {list.length}
      </span>
      <button
        type="button"
        className="btn btn-ghost press size-9 px-0"
        aria-label="Next stamp"
        disabled={at >= list.length - 1}
        onClick={() => step(1)}
      >
        <CaretRight weight="bold" className="size-4!" />
      </button>
    </div>
  );
  const short = useMedia('(max-height: 30rem)');

  useEffect(() => {
    document.title = `${trip.place} · Stampbook`;
  }, [trip.place]);

  const remove = async () => {
    const undo = await removeTrip(trip);
    sfx.flip();
    back();
    toast({
      title: 'Stamp removed',
      body: trip.place,
      action: {
        label: 'Undo',
        run: async () => {
          await undo();
          toast({ title: 'Stamp restored', body: trip.place });
        },
      },
    });
  };

  const actions = (
    <>
      <button
        type="button"
        className="btn btn-line ring-hover press"
        onClick={() => go({ view: 'edit', id: trip.id })}
      >
        <PencilSimple />
        Edit
      </button>
      <button
        type="button"
        className="btn btn-danger ring-hover press"
        onClick={remove}
      >
        <Trash />
        Remove
      </button>
    </>
  );

  const viewer = (
    <Viewer
      ids={ids}
      index={viewing}
      onIndex={setViewing}
      onClose={() => setViewing(null)}
      label={trip.place}
    />
  );

  const stamp = (
    <motion.div
      layoutId={`stamp-${trip.id}`}
      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      className="-me-2 -mt-1 w-32 flex-none sm:w-40 spread:-mb-16 spread:w-40"
    >
      <Stamp trip={trip} className="h-full w-full" />
    </motion.div>
  );

  const map = (className) => <MapSlot cooperative className={className} />;

  if (spread) {
    return (
      <>
        <Left
          head={<Runner strong={since(trip.from)}>Visited</Runner>}
          foot={
            <span className="min-w-0 truncate font-mono text-[0.8125rem] text-ink/75 tracking-[0.12em]">
              {mrz(trip)}
            </span>
          }
        />
        <Page
          side="right"
          head={
            <>
              <BackLink />
              {pager}
            </>
          }
          foot={actions}
        >
          <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-7 pt-5 pb-6">
            <div className="grid gap-6">
              <Facts trip={trip} aside={stamp} />
              <Prints ids={ids} onOpen={setViewing} place={trip.place} />
            </div>
          </div>
        </Page>
        {viewer}
      </>
    );
  }

  return (
    <Page
      head={
        <>
          <BackLink />
          {pager}
        </>
      }
      foot={actions}
    >
      {short ? (
        <div className="flex min-h-0 flex-1 gap-4 px-4 pt-2 pb-1 sm:px-6">
          {map('w-[44%] flex-none')}
          <div className="scroll-thin min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-3">
            <div className="grid gap-4">
              <Facts trip={trip} aside={stamp} />
              <Prints ids={ids} onOpen={setViewing} place={trip.place} />
            </div>
          </div>
        </div>
      ) : (
        <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-4 pt-3 pb-5 sm:px-6 sm:pt-4">
          <div className="mx-auto grid max-w-2xl gap-5">
            {map('h-[34dvh] min-h-44 max-h-96 flex-none')}
            <Facts trip={trip} aside={stamp} />
            <Prints ids={ids} onOpen={setViewing} place={trip.place} />
          </div>
        </div>
      )}
      {viewer}
    </Page>
  );
}
