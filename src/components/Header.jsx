import {
  DotsThree,
  DownloadSimple,
  SpeakerHigh,
  SpeakerSlash,
  Stamp as StampIcon,
  UploadSimple,
} from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { exportBackup, importBackup } from '../lib/backup.js';
import { go } from '../lib/route.js';
import { soundStore } from '../lib/sound.js';
import { toast, useStore } from '../lib/store.js';
import Mark from './Mark.jsx';

function Menu() {
  const [open, setOpen] = useState(false);
  const sound = useStore(soundStore);
  const box = useRef(null);
  const file = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!box.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const save = async () => {
    setOpen(false);
    try {
      const n = await exportBackup();
      toast({
        title: 'Backup saved',
        body: `${n} ${n === 1 ? 'trip' : 'trips'}, with photos`,
      });
    } catch {
      toast({
        title: 'Backup failed',
        body: 'Try again in a moment.',
        tone: 'error',
      });
    }
  };

  const restore = async (f) => {
    try {
      const n = await importBackup(f);
      toast({
        title: 'Backup restored',
        body: `${n} ${n === 1 ? 'trip' : 'trips'}`,
      });
      go({ view: 'home' }, { replace: true });
    } catch {
      toast({
        title: 'Not restored',
        body: 'That file isn’t a Stampbook backup.',
        tone: 'error',
      });
    }
  };

  const item =
    'flex w-full items-center gap-3 rounded-[4px] px-3 py-2.5 text-start text-sm font-medium hover-fine:bg-ink/[0.06] focus-visible:bg-ink/[0.06] focus-visible:outline-none';

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        aria-label="More"
        data-tip="Menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="btn press size-10 px-0 text-foil transition-colors duration-150 hover-fine:bg-white/[0.07] aria-expanded:bg-white/[0.07]"
      >
        <DotsThree weight="bold" className="!size-5" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.12 } }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            style={{ transformOrigin: 'top right' }}
            className="paper absolute end-0 top-[calc(100%+6px)] z-40 grid w-60 rounded-md p-1.5 text-ink shadow-[0_0_0_1.5px_var(--color-cover-deep),0_18px_36px_-12px_rgb(0_0_0/0.6)]"
          >
            <button
              type="button"
              role="menuitemcheckbox"
              aria-checked={sound}
              className={item}
              onClick={() => soundStore.set(!sound)}
            >
              {sound ? (
                <SpeakerHigh className="size-4.5" />
              ) : (
                <SpeakerSlash className="size-4.5" />
              )}
              <span className="flex-1">Sound</span>
              <span className="text-ink-2 text-xs">{sound ? 'On' : 'Off'}</span>
            </button>
            <div className="my-1 border-rule border-t" />
            <button
              type="button"
              role="menuitem"
              className={item}
              onClick={save}
            >
              <DownloadSimple className="size-4.5" />
              Save a backup
            </button>
            <button
              type="button"
              role="menuitem"
              className={item}
              onClick={() => file.current?.click()}
            >
              <UploadSimple className="size-4.5" />
              Restore a backup
            </button>
            <p className="px-3 pt-1 pb-2 text-ink-2 text-xs leading-snug">
              Trips and photos stay on this device. A backup is how you move
              them.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      <input
        ref={file}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          setOpen(false);
          if (f) restore(f);
        }}
      />
    </div>
  );
}

export default function Header({ showAdd }) {
  return (
    <header
      className={`on-cover relative flex items-center justify-between gap-3 px-3 sm:px-5 spread:px-7 spread:pt-4 spread:pb-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 short:pt-2 short:pb-2`}
    >
      <a
        href="/"
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey) return;
          e.preventDefault();
          go({ view: 'home' });
        }}
        className="flex min-w-0 items-center gap-3 rounded-md text-foil"
      >
        <Mark className="size-9 flex-none max-[23.5rem]:hidden spread:size-10" />
        <span className={`grid min-w-0 `}>
          <span className="font-display font-semibold text-[1.3125rem] uppercase leading-none tracking-[0.12em] min-[25rem]:text-[1.5rem] min-[25rem]:tracking-[0.14em] spread:text-[1.625rem]">
            Stampbook
          </span>
          <span
            className={`mt-1 hidden font-mono text-[0.6875rem] text-foil/75 leading-none sm:block`}
          >
            Every trip, stamped
          </span>
        </span>
      </a>
      <div className="flex items-center gap-1.5">
        <Menu />
        <AnimatePresence initial={false}>
          {showAdd && (
            <motion.button
              key="add"
              type="button"
              onClick={() => go({ view: 'new' })}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.14 } }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
              whileTap={{ scale: 0.97 }}
              className="btn btn-foil ring-hover h-10 ps-3 pe-4"
            >
              <StampIcon weight="bold" />
              <span>
                Stamp<span className="hidden min-[25rem]:inline"> a trip</span>
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
