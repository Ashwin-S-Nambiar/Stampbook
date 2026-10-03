import { MagnifyingGlass, SpinnerGap, X } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useId, useRef, useState } from 'react';
import { search } from '../lib/photon.js';

export default function PlaceSearch({ id, onPick, near, autoFocus, invalid }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('idle');
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const input = useRef(null);
  const list = useId();

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setResults([]);
      setStatus('idle');
      return;
    }
    const ctl = new AbortController();
    setStatus('loading');
    const t = setTimeout(() => {
      search(term, { signal: ctl.signal, near })
        .then((r) => {
          setResults(r);
          setActive(0);
          setStatus(r.length ? 'done' : 'empty');
        })
        .catch((e) => {
          if (e.name !== 'AbortError') setStatus('error');
        });
    }, 260);
    return () => {
      clearTimeout(t);
      ctl.abort();
    };
  }, [q, near]);

  useEffect(() => {
    if (autoFocus && matchMedia('(pointer: fine)').matches) {
      input.current?.focus();
    }
  }, [autoFocus]);

  const choose = (p) => {
    onPick(p);
    setQ('');
    setResults([]);
    setOpen(false);
  };

  const onKey = (e) => {
    if (!results.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      choose(results[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const show = open && q.trim().length >= 2 && status !== 'idle';

  return (
    <div className="relative">
      <div className="relative">
        <MagnifyingGlass
          weight="bold"
          className="pointer-events-none absolute inset-s-0.5 top-1/2 size-4 -translate-y-1/2 text-ink-2"
        />
        <input
          ref={input}
          id={id}
          type="text"
          role="combobox"
          aria-expanded={show}
          aria-controls={list}
          aria-autocomplete="list"
          aria-activedescendant={
            show && results[active] ? `${list}-${active}` : undefined
          }
          aria-invalid={invalid || undefined}
          enterKeyHint="search"
          autoComplete="off"
          spellCheck={false}
          placeholder="Search a place"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKey}
          className={`line-field ps-7 pe-8 ${invalid ? 'border-b-red' : ''}`}
        />
        <span className="absolute inset-e-0 top-1/2 flex -translate-y-1/2 items-center">
          {status === 'loading' ? (
            <SpinnerGap className="size-4 animate-spin text-ink-3" />
          ) : q ? (
            <button
              type="button"
              aria-label="Clear search"
              className="grid size-8 place-items-center rounded text-ink-2 hover-fine:text-ink"
              onClick={() => {
                setQ('');
                input.current?.focus();
              }}
            >
              <X weight="bold" className="size-3.5" />
            </button>
          ) : null}
        </span>
      </div>
      <AnimatePresence>
        {show && (
          <motion.div
            id={list}
            role="listbox"
            aria-label="Places"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
            className="scroll-thin absolute inset-x-0 top-[calc(100%+6px)] z-30 max-h-72 overflow-y-auto rounded-[5px] bg-paper py-1 shadow-[0_0_0_1.5px_var(--color-rule),0_16px_30px_-12px_rgb(0_0_0/0.35)]"
          >
            {status === 'empty' && (
              <div className="px-3 py-2.5 text-ink-2 text-sm">
                Nothing found. Try the town or country name.
              </div>
            )}
            {status === 'error' && (
              <div className="px-3 py-2.5 text-ink-2 text-sm">
                Search isn’t answering. Check your connection, or tap the map.
              </div>
            )}
            {status === 'loading' && !results.length && (
              <div className="px-3 py-2.5 text-ink-3 text-sm">Looking…</div>
            )}
            {results.map((p, i) => (
              <div
                key={p.key}
                id={`${list}-${i}`}
                role="option"
                tabIndex={-1}
                aria-selected={i === active}
                onKeyDown={(e) => e.key === 'Enter' && choose(p)}
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => choose(p)}
                onMouseMove={() => setActive(i)}
                className={`grid cursor-pointer gap-0.5 px-3 py-2 ${i === active ? 'bg-ink/6' : ''}`}
              >
                <span className="truncate font-semibold text-[0.9375rem]">
                  {p.name}
                </span>
                <span className="truncate text-ink-2 text-xs">{p.detail}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
