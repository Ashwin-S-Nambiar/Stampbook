import { CalendarBlank, CaretLeft, CaretRight, X } from '@phosphor-icons/react';
import { AnimatePresence, motion, useDragControls } from 'motion/react';
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { days, niceRange, parse } from '../lib/dates.js';
import { useMedia } from '../lib/media.js';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const WEEK = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const EASE = [0.23, 1, 0.32, 1];
const DRAWER = [0.32, 0.72, 0, 1];

const iso = (y, m, d) =>
  `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
const inMonth = (y, m) => new Date(y, m, 0).getDate();
const firstDay = (y, m) => (new Date(y, m - 1, 1).getDay() + 6) % 7;
const shiftIso = (value, delta) => {
  const { y, m, d } = parse(value);
  const t = new Date(y, m - 1, d + delta);
  return iso(t.getFullYear(), t.getMonth() + 1, t.getDate());
};
const label = (value) => {
  const { y, m, d } = parse(value);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};

function Days({
  view,
  from,
  to,
  hover,
  setHover,
  pending,
  max,
  focus,
  onPick,
  onFocus,
  onKey,
}) {
  const { y, m } = view;
  const lead = firstDay(y, m);
  const count = inMonth(y, m);
  const end = pending && hover && from && hover > from ? hover : to;
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push({ key: `blank-${i}`, value: null });
  for (let d = 1; d <= count; d++) {
    const value = iso(y, m, d);
    cells.push({ key: value, value });
  }
  while (cells.length % 7) {
    cells.push({ key: `tail-${cells.length}`, value: null });
  }
  const rows = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  const cell = ({ key, value }, col) => {
    if (!value) return <td key={key} />;
    const disabled = max && value > max;
    const isFrom = value === from;
    const isTo = value === end && end !== from;
    const between = from && end && value > from && value < end;
    const edge = isFrom || isTo;
    const today = value === max;
    const band = between
      ? `bg-ink/[0.07] ${col === 0 ? 'rounded-s-full' : ''} ${col === 6 ? 'rounded-e-full' : ''}`
      : isFrom && end && end !== from
        ? 'bg-gradient-to-r from-transparent from-50% to-ink/[0.07] to-50%'
        : isTo
          ? 'bg-gradient-to-l from-transparent from-50% to-ink/[0.07] to-50%'
          : '';
    return (
      <td key={key} className={`p-0 ${band}`}>
        <div className="grid h-10 place-items-center">
          <button
            type="button"
            tabIndex={value === focus ? 0 : -1}
            data-day={value}
            disabled={disabled}
            aria-pressed={edge}
            aria-label={`${label(value)}${isFrom ? ', arrival' : ''}${isTo ? ', departure' : ''}`}
            onClick={() => onPick(value)}
            onMouseEnter={() => setHover(value)}
            onFocus={() => onFocus(value)}
            onKeyDown={onKey}
            className={`press relative grid size-9 place-items-center rounded-full text-[0.875rem] tabular-nums transition-colors duration-150 disabled:cursor-default disabled:text-ink-3/40 ${edge ? 'bg-ink font-semibold text-paper' : 'text-ink hover-fine:enabled:bg-ink/[0.08]'} ${today && !edge ? 'font-semibold' : ''}`}
          >
            {parse(value).d}
            {today && !edge && (
              <span className="absolute bottom-1 size-1 rounded-full bg-red" />
            )}
          </button>
        </div>
      </td>
    );
  };

  return (
    <table
      className="w-full table-fixed border-collapse"
      onMouseLeave={() => setHover(null)}
    >
      <caption className="sr-only">{`${MONTHS[m - 1]} ${y}`}</caption>
      <thead>
        <tr>
          {WEEK.map((w) => (
            <th
              key={w}
              scope="col"
              className="h-7 font-medium text-[0.6875rem] text-ink-3 uppercase tracking-wide"
            >
              {w}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row[0].key}>{row.map((c, col) => cell(c, col))}</tr>
        ))}
      </tbody>
    </table>
  );
}

function Months({ view, max, onPick }) {
  const top = max ? parse(max) : null;
  return (
    <div className="grid grid-cols-3 gap-2">
      {MONTHS.map((name, i) => {
        const disabled =
          top && (view.y > top.y || (view.y === top.y && i + 1 > top.m));
        const on = view.m === i + 1;
        return (
          <button
            key={name}
            type="button"
            disabled={disabled}
            onClick={() => onPick(i + 1)}
            className={`press h-11 rounded-md font-medium text-sm transition-colors duration-150 disabled:text-ink-3/40 ${on ? 'bg-ink text-paper' : 'text-ink hover-fine:enabled:bg-ink/[0.08]'}`}
          >
            {name.slice(0, 3)}
          </button>
        );
      })}
    </div>
  );
}

function Years({ view, max, onPick }) {
  const last = max ? parse(max).y : new Date().getFullYear();
  const start = view.y - ((view.y - 1900) % 12);
  const years = Array.from({ length: 12 }, (_, i) => start + i);
  return (
    <div className="grid grid-cols-3 gap-2">
      {years.map((y) => (
        <button
          key={y}
          type="button"
          disabled={y > last}
          onClick={() => onPick(y)}
          className={`press h-11 rounded-md font-medium text-sm tabular-nums transition-colors duration-150 disabled:text-ink-3/40 ${y === view.y ? 'bg-ink text-paper' : 'text-ink hover-fine:enabled:bg-ink/[0.08]'}`}
        >
          {y}
        </button>
      ))}
    </div>
  );
}

function Calendar({ from, to, max, onChange, onDone }) {
  const start =
    from || max || iso(new Date().getFullYear(), new Date().getMonth() + 1, 1);
  const s = parse(start);
  const [view, setView] = useState({ y: s.y, m: s.m });
  const [mode, setMode] = useState('days');
  const [dir, setDir] = useState(0);
  const [hover, setHover] = useState(null);
  const [pending, setPending] = useState(false);
  const [focus, setFocus] = useState(from || max);
  const grid = useRef(null);
  const n = from ? days(from, to) : 0;

  const move = useCallback((delta) => {
    setDir(delta);
    setView((v) => {
      const t = new Date(v.y, v.m - 1 + delta, 1);
      return { y: t.getFullYear(), m: t.getMonth() + 1 };
    });
  }, []);

  const top = max ? parse(max) : null;
  const atEnd = top && view.y === top.y && view.m === top.m;

  const pick = (value) => {
    if (!from || !pending) {
      onChange({ from: value, to: '' });
      setPending(true);
    } else if (value < from) {
      onChange({ from: value, to: '' });
    } else {
      onChange({ from, to: value === from ? '' : value });
      setPending(false);
    }
    setFocus(value);
  };

  useEffect(() => {
    if (mode !== 'days') return;
    const btn = grid.current?.querySelector(`[data-day="${focus}"]`);
    if (btn && grid.current.contains(document.activeElement)) btn.focus();
  }, [focus, mode]);

  const onKey = (e) => {
    if (mode !== 'days' || !focus) return;
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[
      e.key
    ];
    let next = null;
    if (step) next = shiftIso(focus, step);
    if (e.key === 'PageUp') next = shiftIso(focus, -inMonth(view.y, view.m));
    if (e.key === 'PageDown') next = shiftIso(focus, inMonth(view.y, view.m));
    if (!next) return;
    e.preventDefault();
    if (max && next > max) next = max;
    const p = parse(next);
    if (p.y !== view.y || p.m !== view.m) {
      setDir(next > focus ? 1 : -1);
      setView({ y: p.y, m: p.m });
    }
    setFocus(next);
    requestAnimationFrame(() =>
      grid.current?.querySelector(`[data-day="${next}"]`)?.focus(),
    );
  };

  const title =
    mode === 'years'
      ? `${view.y - ((view.y - 1900) % 12)} to ${view.y - ((view.y - 1900) % 12) + 11}`
      : mode === 'months'
        ? String(view.y)
        : `${MONTHS[view.m - 1]} ${view.y}`;

  const step = (d) => {
    if (mode === 'days') move(d);
    else if (mode === 'months') setView((v) => ({ ...v, y: v.y + d }));
    else setView((v) => ({ ...v, y: v.y + d * 12 }));
    setDir(d);
  };

  const nextDisabled =
    mode === 'days'
      ? atEnd
      : mode === 'months'
        ? top && view.y >= top.y
        : top && view.y - ((view.y - 1900) % 12) + 11 >= top.y;

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() =>
            setMode((m) =>
              m === 'days' ? 'months' : m === 'months' ? 'years' : 'days',
            )
          }
          aria-label={`${title}. Change ${mode === 'days' ? 'month' : mode === 'months' ? 'year' : 'view'}`}
          className="press -ms-2 flex items-center gap-1.5 rounded-md px-2 py-1.5 font-display font-bold text-[1.0625rem] text-ink uppercase tracking-[0.12em] transition-colors duration-150 hover-fine:bg-ink/[0.06]"
        >
          {title}
          <CaretRight
            weight="bold"
            className={`size-3.5 text-ink-2 transition-transform duration-200 ${mode === 'days' ? 'rotate-90' : '-rotate-90'}`}
          />
        </button>
        <div className="-me-1.5 flex items-center">
          <button
            type="button"
            aria-label="Previous"
            onClick={() => step(-1)}
            className="press grid size-9 place-items-center rounded-full text-ink transition-colors duration-150 hover-fine:bg-ink/[0.06]"
          >
            <CaretLeft weight="bold" className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Next"
            disabled={nextDisabled}
            onClick={() => step(1)}
            className="press grid size-9 place-items-center rounded-full text-ink transition-colors duration-150 hover-fine:enabled:bg-ink/[0.06] disabled:text-ink-3/40"
          >
            <CaretRight weight="bold" className="size-4" />
          </button>
        </div>
      </div>

      <div ref={grid} className="relative min-h-[18.5rem] overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout" custom={dir}>
          <motion.div
            key={`${mode}-${mode === 'days' ? `${view.y}-${view.m}` : mode === 'months' ? view.y : Math.floor((view.y - 1900) / 12)}`}
            custom={dir}
            variants={{
              in: (d) => ({ opacity: 0, x: d * 24, scale: d ? 1 : 0.98 }),
              on: { opacity: 1, x: 0, scale: 1 },
              out: (d) => ({ opacity: 0, x: d * -24, scale: d ? 1 : 0.98 }),
            }}
            initial="in"
            animate="on"
            exit="out"
            transition={{ duration: 0.2, ease: EASE }}
          >
            {mode === 'days' && (
              <Days
                view={view}
                from={from}
                to={to}
                hover={hover}
                setHover={setHover}
                pending={pending}
                max={max}
                focus={focus}
                onPick={pick}
                onFocus={setFocus}
                onKey={onKey}
              />
            )}
            {mode === 'months' && (
              <Months
                view={view}
                max={max}
                onPick={(m) => {
                  setDir(0);
                  setView((v) => ({ ...v, m }));
                  setMode('days');
                }}
              />
            )}
            {mode === 'years' && (
              <Years
                view={view}
                max={max}
                onPick={(y) => {
                  setDir(0);
                  setView((v) => ({ ...v, y }));
                  setMode('months');
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between gap-3 border-rule border-t pt-3">
        <div className="grid min-w-0 text-sm leading-snug">
          <span className="eyebrow text-ink-2">Stay</span>
          <span className="text-balance font-medium">
            {!from
              ? 'Tap the day you arrived'
              : pending
                ? 'Now tap the day you left'
                : `${n} ${n === 1 ? 'day' : 'days'}`}
          </span>
        </div>
        <div className="flex flex-none items-center gap-2">
          {from && (
            <button
              type="button"
              onClick={() => {
                onChange({ from: '', to: '' });
                setPending(false);
              }}
              className="btn btn-line ring-hover press h-9"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={onDone}
            className="btn btn-ink ring-hover press h-9"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function Popover({ anchor, onClose, children, labelledBy }) {
  const [pos, setPos] = useState(null);
  const panel = useRef(null);

  useLayoutEffect(() => {
    const place = () => {
      const r = anchor.current.getBoundingClientRect();
      const width = Math.min(336, window.innerWidth - 24);
      const h = panel.current?.offsetHeight || 460;
      const below = window.innerHeight - r.bottom;
      const up = below < h + 16 && r.top > below;
      const left = Math.max(
        12,
        Math.min(r.left, window.innerWidth - width - 12),
      );
      setPos({
        left,
        width,
        top: up ? Math.max(12, r.top - h - 8) : r.bottom + 8,
        origin: `${r.left - left + 24}px ${up ? '100%' : '0%'}`,
      });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [anchor]);

  useEffect(() => {
    const onDown = (e) => {
      if (
        panel.current?.contains(e.target) ||
        anchor.current?.contains(e.target)
      )
        return;
      onClose();
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [anchor, onClose]);

  return (
    <motion.div
      ref={panel}
      role="dialog"
      aria-labelledby={labelledBy}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{
        opacity: 1,
        scale: 1,
        transition: { duration: 0.18, ease: EASE },
      }}
      exit={{
        opacity: 0,
        scale: 0.97,
        transition: { duration: 0.12, ease: EASE },
      }}
      style={{
        position: 'fixed',
        left: pos?.left ?? -9999,
        top: pos?.top ?? 0,
        width: pos?.width ?? 336,
        transformOrigin: pos?.origin,
      }}
      className="paper z-50 rounded-lg p-4 shadow-[0_0_0_1.5px_var(--color-rule),0_24px_48px_-16px_rgb(0_0_0/0.45)]"
    >
      {children}
    </motion.div>
  );
}

function Sheet({ onClose, children, labelledBy }) {
  const controls = useDragControls();
  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <motion.div
        className="absolute inset-0 bg-[#0b1020]/45"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.24 } }}
        exit={{ opacity: 0, transition: { duration: 0.18 } }}
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="paper relative w-full rounded-t-2xl px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_-12px_rgb(0_0_0/0.4)]"
        initial={{ y: '100%' }}
        animate={{ y: 0, transition: { duration: 0.34, ease: DRAWER } }}
        exit={{ y: '100%', transition: { duration: 0.22, ease: DRAWER } }}
        drag="y"
        dragListener={false}
        dragControls={controls}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.05, bottom: 0.6 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 80 || info.velocity.y > 500) onClose();
        }}
      >
        <div
          className="mx-auto mb-2 flex h-6 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
          onPointerDown={(e) => controls.start(e)}
        >
          <span className="h-1 w-10 rounded-full bg-ink/20" />
        </div>
        <div className="mx-auto max-w-sm">{children}</div>
      </motion.div>
    </div>
  );
}

export default function DatePicker({ id, from, to, max, onChange, invalid }) {
  const [open, setOpen] = useState(false);
  const anchor = useRef(null);
  const labelId = useId();
  const phone = useMedia('(max-width: 39.99rem), (max-height: 30rem)');
  const n = from ? days(from, to) : 0;
  const close = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => anchor.current?.focus());
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  const summary = useMemo(() => {
    if (!from) return null;
    return `${niceRange(from, to)} · ${n} ${n === 1 ? 'day' : 'days'}`;
  }, [from, to, n]);

  const body = (
    <>
      <span id={labelId} className="sr-only">
        Trip dates
      </span>
      <Calendar
        from={from}
        to={to}
        max={max}
        onChange={onChange}
        onDone={close}
      />
    </>
  );

  return (
    <>
      <div className="relative">
        <button
          ref={anchor}
          id={id}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-invalid={invalid || undefined}
          onClick={() => setOpen((o) => !o)}
          className={`line-field group flex items-center gap-2.5 text-start ${from ? 'pe-9' : ''} ${invalid ? 'border-b-red' : ''} ${open ? 'border-b-blue shadow-[0_1px_0_var(--color-blue)]' : ''}`}
        >
          <CalendarBlank className="size-4.5 flex-none text-ink-2 transition-colors duration-150 group-hover-fine:text-ink" />
          <span
            className={`min-w-0 flex-1 truncate ${summary ? '' : 'text-ink-3'}`}
          >
            {summary || 'When were you there?'}
          </span>
        </button>
        {from && (
          <button
            type="button"
            aria-label="Clear dates"
            onClick={() => onChange({ from: '', to: '' })}
            className="press absolute end-0 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-ink-3 transition-colors duration-150 hover-fine:bg-ink/[0.06] hover-fine:text-ink"
          >
            <X weight="bold" className="size-3.5" />
          </button>
        )}
      </div>
      {createPortal(
        <AnimatePresence>
          {open &&
            (phone ? (
              <Sheet key="sheet" onClose={close} labelledBy={labelId}>
                {body}
              </Sheet>
            ) : (
              <Popover
                key="pop"
                anchor={anchor}
                onClose={close}
                labelledBy={labelId}
              >
                {body}
              </Popover>
            ))}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
