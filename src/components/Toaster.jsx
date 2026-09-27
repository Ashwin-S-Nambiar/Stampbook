import { Check, X } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'motion/react';
import { createPortal } from 'react-dom';
import { dismissToast, toastStore, useStore } from '../lib/store.js';

export default function Toaster() {
  const toasts = useStore(toastStore);
  return createPortal(
    <ol
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 grid justify-items-center gap-2 px-4"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.li
            key={t.id}
            layout
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8, transition: { duration: 0.14 } }}
            transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
            className="paper pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-md py-2 ps-3 pe-1.5 shadow-[0_0_0_1.5px_var(--color-cover-deep),0_16px_32px_-12px_rgb(0_0_0/0.55)]"
          >
            <span
              className={`grid size-7 flex-none place-items-center rounded-full border-2 ${t.tone === 'error' ? 'border-red text-red' : 'border-green text-green'}`}
            >
              {t.tone === 'error' ? (
                <X weight="bold" className="size-3.5" />
              ) : (
                <Check weight="bold" className="size-3.5" />
              )}
            </span>
            <span className="grid min-w-0 flex-1 text-sm leading-snug">
              <span className="font-semibold">{t.title}</span>
              {t.body && <span className="truncate text-ink-2">{t.body}</span>}
            </span>
            {t.action && (
              <button
                type="button"
                className="btn btn-line ring-hover press h-8 px-3"
                onClick={() => {
                  dismissToast(t.id);
                  t.action.run();
                }}
              >
                {t.action.label}
              </button>
            )}
            <button
              type="button"
              aria-label="Dismiss"
              className="grid size-8 flex-none place-items-center rounded text-ink-2 hover-fine:text-ink"
              onClick={() => dismissToast(t.id)}
            >
              <X className="size-4" />
            </button>
          </motion.li>
        ))}
      </AnimatePresence>
    </ol>,
    document.body,
  );
}
