import { Plus } from '@phosphor-icons/react';
import { AnimatePresence, motion, useAnimate } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { sfx } from '../lib/sound.js';
import { design } from '../lib/stamp.js';
import { haptic } from '../lib/store.js';
import Stamp from './Stamp.jsx';

export const PER_PAGE = 6;
const GAP = 8;
const LAYOUTS = [
  [2, 3],
  [3, 2],
  [6, 1],
];

export function chunk(trips) {
  const slots = [...trips, null];
  const pages = [];
  for (let i = 0; i < slots.length; i += PER_PAGE) {
    pages.push(slots.slice(i, i + PER_PAGE));
  }
  return pages;
}

const FLY = { duration: 0.5, ease: [0.32, 0.72, 0, 1] };

function Slot({ trip, fresh, onOpen, onLanded, size }) {
  const d = design(trip);
  const landed = useRef(false);
  return (
    <div
      className="grid min-h-0 min-w-0 place-items-center"
      style={{ transform: `translate(${d.dx}px, ${d.dy}px)` }}
    >
      <motion.div
        style={{ width: size }}
        initial={fresh ? { scale: 1.7, opacity: 0 } : false}
        animate={fresh ? { scale: [1.7, 0.96, 1], opacity: [0, 1, 1] } : {}}
        transition={{
          duration: 0.42,
          times: [0, 0.68, 1],
          ease: [
            [0.55, 0, 0.9, 0.4],
            [0.23, 1, 0.32, 1],
          ],
          delay: 0.18,
        }}
        onUpdate={(v) => {
          if (!fresh || landed.current) return;
          if (v.scale !== undefined && v.scale <= 1.0) {
            landed.current = true;
            onLanded?.();
          }
        }}
      >
        <button
          type="button"
          onClick={() => onOpen(trip.id)}
          aria-label={`${trip.place}, ${trip.country}. Open entry`}
          className="group press relative grid aspect-[184/164] w-full place-items-center rounded-2xl outline-offset-0"
        >
          <motion.div
            layoutId={`stamp-${trip.id}`}
            transition={FLY}
            className="relative h-full w-full"
          >
            <Stamp trip={trip} title={false} halo className="h-full w-full" />
          </motion.div>
        </button>
      </motion.div>
    </div>
  );
}

function Blank({ first, onNew, size }) {
  return (
    <div className="grid min-h-0 min-w-0 place-items-center">
      <button
        type="button"
        onClick={onNew}
        aria-label={first ? 'Stamp your first trip' : 'Stamp a trip'}
        style={{ width: size * 0.84 }}
        className={`group press grid aspect-[184/164] place-items-center content-center gap-2 rounded-xl border-[1.5px] border-dashed p-3 text-center transition-colors duration-150 ${first ? 'border-ink-3/50 text-ink-2 hover-fine:border-ink-2 hover-fine:text-ink' : 'border-ink-3/30 text-ink-3 hover-fine:border-ink-3/70 hover-fine:text-ink-2'}`}
      >
        <Plus
          weight="bold"
          className={`transition-transform duration-150 group-hover-fine:-translate-y-0.5 ${first ? 'size-5' : 'size-4'}`}
        />
        {first && size >= 120 && (
          <span className="text-balance font-medium text-[0.8125rem] leading-snug">
            Your first stamp goes here
          </span>
        )}
      </button>
    </div>
  );
}

export default function Stamps({
  pages,
  page,
  dir,
  fresh,
  onOpen,
  onNew,
  onFlip,
  empty,
}) {
  const [scope, animate] = useAnimate();
  const list = pages[page] || [];
  const [grid, setGrid] = useState(null);

  useLayoutEffect(() => {
    const el = scope.current;
    if (!el) return;
    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      const pad = width >= 640 ? 24 : 12;
      let best = null;
      for (const [c, r] of LAYOUTS) {
        const cw = (width - pad * 2 - GAP * (c - 1)) / c;
        const ch = (height - pad * 2 - GAP * (r - 1)) / r;
        const size = Math.min(cw * 0.94, ch * 0.94 * (184 / 164), 240);
        if (!best || size > best.size + 4) best = { c, r, size, pad };
      }
      setGrid(best);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [scope]);

  useEffect(() => {
    if (!fresh) return;
    const t = setTimeout(() => {
      sfx.lift();
    }, 60);
    return () => clearTimeout(t);
  }, [fresh]);

  const landed = () => {
    sfx.thud();
    haptic(18);
    if (scope.current) {
      animate(
        scope.current,
        { y: [0, 3, -1, 0] },
        { duration: 0.28, ease: 'easeOut' },
      );
    }
  };

  return (
    <div ref={scope} className="relative min-h-0 flex-1">
      <AnimatePresence initial={false} custom={dir} mode="popLayout">
        <motion.div
          key={page}
          custom={dir}
          variants={{
            enter: (d) => ({ opacity: 0, x: d * 36 }),
            center: { opacity: 1, x: 0 },
            exit: (d) => ({ opacity: 0, x: d * -36 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
          drag={pages.length > 1 ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.18}
          dragSnapToOrigin
          onDragEnd={(_, info) => {
            const swipe = info.offset.x + info.velocity.x * 0.2;
            if (swipe < -70) onFlip(1);
            else if (swipe > 70) onFlip(-1);
          }}
          style={
            grid
              ? {
                  gridTemplateColumns: `repeat(${grid.c}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${grid.r}, minmax(0, 1fr))`,
                  padding: grid.pad,
                  gap: GAP,
                }
              : undefined
          }
          className="absolute inset-0 grid touch-pan-y"
        >
          {grid &&
            list.map((t) =>
              t ? (
                <Slot
                  key={t.id}
                  trip={t}
                  fresh={fresh === t.id}
                  onOpen={onOpen}
                  onLanded={landed}
                  size={grid.size}
                />
              ) : (
                <Blank
                  key="blank"
                  first={empty}
                  onNew={onNew}
                  size={grid.size}
                />
              ),
            )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
