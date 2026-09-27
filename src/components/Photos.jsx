import { CaretLeft, CaretRight, X } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { loadPhoto, localUrl } from '../lib/photos.js';

export function usePhoto(id, size = 'thumb') {
  const [state, setState] = useState(null);
  useEffect(() => {
    let live = true;
    if (typeof id === 'object' && id) {
      setState({ url: localUrl(id, size), w: id.w, h: id.h });
      return;
    }
    loadPhoto(id).then((p) => {
      if (live) setState(p ? { url: localUrl(p, size), w: p.w, h: p.h } : null);
    });
    return () => {
      live = false;
    };
  }, [id, size]);
  return state;
}

export function Thumb({ id, className = '', alt = '' }) {
  const p = usePhoto(id, 'thumb');
  return (
    <span className={`block overflow-hidden bg-paper-2 ${className}`}>
      {p && (
        <img
          src={p.url}
          alt={alt}
          draggable={false}
          className="h-full w-full animate-[fade-in_200ms_ease-out] object-cover"
        />
      )}
    </span>
  );
}

function Full({ id, alt }) {
  const p = usePhoto(id, 'full');
  if (!p) return null;
  return (
    <img
      src={p.url}
      alt={alt}
      draggable={false}
      className="max-h-full max-w-full select-none rounded-[3px] object-contain shadow-[0_20px_60px_-20px_rgb(0_0_0/0.7)]"
    />
  );
}

export function Viewer({ ids, index, onIndex, onClose, label }) {
  const open = index != null;
  const count = ids.length;

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onIndex((i) => Math.min(count - 1, i + 1));
      if (e.key === 'ArrowLeft') onIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, count, onIndex, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`${label} photos`}
          className="on-cover fixed inset-0 z-50 flex flex-col bg-[#0b1020]/95"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.2 } }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
        >
          <div className="flex items-center justify-between px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 text-foil">
            <span className="px-2 font-mono text-sm tabular-nums">
              {index + 1} / {count}
            </span>
            <button
              type="button"
              className="btn press size-10 px-0 text-foil hover-fine:bg-white/10"
              aria-label="Close photos"
              onClick={onClose}
            >
              <X weight="bold" />
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-16">
            <motion.div
              key={ids[index]}
              className="flex h-full w-full touch-pan-y items-center justify-center"
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              drag={count > 1 ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.3}
              onDragEnd={(_, info) => {
                const s = info.offset.x + info.velocity.x * 0.2;
                if (s < -60) onIndex((i) => Math.min(count - 1, i + 1));
                if (s > 60) onIndex((i) => Math.max(0, i - 1));
              }}
            >
              <Full id={ids[index]} alt={`${label}, photo ${index + 1}`} />
            </motion.div>
            {count > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous photo"
                  disabled={index === 0}
                  onClick={() => onIndex((i) => i - 1)}
                  className="btn press absolute start-3 hidden size-11 px-0 text-foil hover-fine:bg-white/10 disabled:opacity-25 sm:inline-flex"
                >
                  <CaretLeft weight="bold" />
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  disabled={index === count - 1}
                  onClick={() => onIndex((i) => i + 1)}
                  className="btn press absolute end-3 hidden size-11 px-0 text-foil hover-fine:bg-white/10 disabled:opacity-25 sm:inline-flex"
                >
                  <CaretRight weight="bold" />
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
