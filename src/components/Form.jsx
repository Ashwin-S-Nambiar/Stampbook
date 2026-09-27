import { ArrowLeft, Camera, MapPin, X } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { countryName } from '../lib/countries.js';
import { since, today } from '../lib/dates.js';
import { useMedia } from '../lib/media.js';
import { reverse } from '../lib/photon.js';
import { makePhoto } from '../lib/photos.js';
import { back, go } from '../lib/route.js';
import { sfx } from '../lib/sound.js';
import { mapStore, pickHandler } from '../lib/stage.js';
import { design } from '../lib/stamp.js';
import { toast } from '../lib/store.js';
import { justStamped, newId, saveTrip } from '../lib/trips.js';
import { Page } from './Book.jsx';
import DatePicker from './DatePicker.jsx';
import Left from './Left.jsx';
import MapSlot from './MapSlot.jsx';
import { Thumb } from './Photos.jsx';
import PlaceSearch from './PlaceSearch.jsx';
import Stamp from './Stamp.jsx';

const MAX_PHOTOS = 24;

function Notes(props) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    const grow = () => {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight + 2}px`;
    };
    grow();
    el.addEventListener('input', grow);
    const ro = new ResizeObserver(grow);
    ro.observe(el.parentElement);
    return () => {
      el.removeEventListener('input', grow);
      ro.disconnect();
    };
  }, []);
  return <textarea ref={ref} {...props} />;
}

function Field({ label, htmlFor, error, children, hint }) {
  return (
    <div className="grid gap-1">
      <label htmlFor={htmlFor} className="eyebrow text-ink-2">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-red text-xs" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-ink-3 text-xs">{hint}</p>
      ) : null}
    </div>
  );
}

export default function Form({ trip, spread, list }) {
  const editing = !!trip;
  const [id] = useState(() => trip?.id || newId());
  const [place, setPlace] = useState(() =>
    trip
      ? {
          name: trip.place,
          region: trip.region || '',
          country: trip.country,
          cc: trip.cc,
          lat: trip.lat,
          lng: trip.lng,
        }
      : null,
  );
  const [from, setFrom] = useState(trip?.from || '');
  const [to, setTo] = useState(trip?.to || '');
  const [notes, setNotes] = useState(trip?.notes || '');
  const [photos, setPhotos] = useState(trip?.photos || []);
  const [removed, setRemoved] = useState([]);
  const [pending, setPending] = useState([]);
  const busy = pending.length;
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const fileInput = useRef(null);
  const nameInput = useRef(null);

  useEffect(() => {
    document.title = editing
      ? `Edit ${trip.place} · Stampbook`
      : 'New stamp · Stampbook';
  }, [editing, trip?.place]);

  const draft = useMemo(
    () => ({
      id,
      place: place?.name || '',
      country: place?.country || '',
      cc: place?.cc || '',
      from,
      to,
    }),
    [id, place, from, to],
  );
  const color = design(draft).color;

  const [pin, setPin] = useState(() =>
    trip ? { lat: trip.lat, lng: trip.lng, zoom: 6, fly: true } : null,
  );
  const picked = useMemo(() => (pin ? { ...pin, color } : null), [pin, color]);

  useEffect(() => {
    mapStore.set((m) => ({ ...m, mode: 'pick', focusId: null, picked }));
  }, [picked]);

  const near = useMemo(() => {
    const last = list[list.length - 1];
    return last ? { lat: last.lat, lng: last.lng } : null;
  }, [list]);

  const choose = (p) => {
    setPlace({
      name: p.name,
      region: p.region,
      country: p.country,
      cc: p.cc,
      lat: p.lat,
      lng: p.lng,
    });
    setPin({
      lat: p.lat,
      lng: p.lng,
      zoom: p.kind === 'country' ? 4 : 8,
      fly: true,
    });
    setErrors((e) => ({ ...e, place: null }));
    sfx.tap();
  };

  const dropPin = async ({ lat, lng }) => {
    setPin({ lat, lng });
    if (place) {
      setPlace((p) => ({ ...p, lat, lng }));
      return;
    }
    setLocating(true);
    try {
      const found = await reverse({ lat, lng });
      if (found) {
        setPlace({
          name: found.name,
          region: found.region === found.name ? '' : found.region,
          country: found.country || countryName(found.cc),
          cc: found.cc,
          lat,
          lng,
        });
        setErrors((e) => ({ ...e, place: null }));
      } else {
        toast({
          title: 'No place there',
          body: 'Try tapping on land, or search instead.',
          tone: 'error',
        });
      }
    } catch {
      toast({
        title: 'Couldn’t look that up',
        body: 'Check your connection and try again.',
        tone: 'error',
      });
    } finally {
      setLocating(false);
    }
  };

  useEffect(() => {
    pickHandler.current = dropPin;
  });

  const addPhotos = async (files) => {
    const room = MAX_PHOTOS - photos.length - pending.length;
    const picked = [...files]
      .filter((f) => !f.type || f.type.startsWith('image/'))
      .slice(0, Math.max(0, room))
      .map((f) => ({ f, key: newId() }));
    if (files.length > room) {
      toast({ title: `Up to ${MAX_PHOTOS} photos a trip`, tone: 'error' });
    }
    setPending((k) => [...k, ...picked.map((x) => x.key)]);
    for (const { f, key } of picked) {
      try {
        const p = await makePhoto(f, id);
        setPhotos((ps) => [...ps, p]);
        sfx.shutter();
      } catch {
        toast({
          title: 'Couldn’t read a photo',
          body: f.name,
          tone: 'error',
        });
      } finally {
        setPending((k) => k.filter((x) => x !== key));
      }
    }
  };

  const dropPhoto = (p) => {
    setPhotos((ps) => ps.filter((x) => x !== p));
    if (typeof p === 'string') setRemoved((r) => [...r, p]);
  };

  const submit = async (e) => {
    e?.preventDefault();
    const errs = {};
    if (!place) errs.place = 'Pick a place first.';
    else if (!place.name.trim()) errs.name = 'Give the stamp a name.';
    if (!from) errs.from = 'Add the dates you were there.';
    if (from && to && to < from)
      errs.to = 'This is before the day you arrived.';
    setErrors(errs);
    if (Object.keys(errs).length) {
      sfx.error();
      return;
    }
    setSaving(true);
    try {
      const added = photos.filter((p) => typeof p === 'object');
      const record = {
        ...(trip || {}),
        id,
        place: place.name.trim(),
        region: place.region || '',
        country: place.country,
        cc: place.cc,
        lat: place.lat,
        lng: place.lng,
        from,
        to: to && to !== from ? to : '',
        notes: notes.trim(),
        photos: photos.map((p) => (typeof p === 'object' ? p.id : p)),
      };
      await saveTrip(record, { added, removed });
      if (editing) {
        toast({ title: 'Saved', body: record.place });
        back({ view: 'trip', id });
      } else {
        justStamped.set(id);
        go({ view: 'home' }, { replace: true });
      }
    } catch {
      setSaving(false);
      toast({
        title: 'Not saved',
        body: 'Your browser refused to store it. Free up some space and try again.',
        tone: 'error',
      });
    }
  };

  const cancel = () => (editing ? back({ view: 'trip', id }) : back());

  const search = (
    <Field label="Where" htmlFor="where" error={errors.place}>
      <PlaceSearch
        id="where"
        onPick={choose}
        near={near}
        autoFocus={!editing}
        invalid={!!errors.place}
      />
    </Field>
  );

  const chosen = place && (
    <div className="grid gap-1">
      <label htmlFor="stamp-name" className="eyebrow text-ink-2">
        Name on the stamp
      </label>
      <input
        id="stamp-name"
        ref={nameInput}
        className="line-field font-semibold"
        value={place.name}
        maxLength={40}
        onChange={(e) => setPlace((p) => ({ ...p, name: e.target.value }))}
      />
      <p className="flex min-w-0 items-center gap-1.5 text-ink-2 text-xs">
        <MapPin
          weight="fill"
          className="size-3.5 flex-none"
          style={{ color }}
        />
        <span className="truncate">
          {[place.region, place.country].filter(Boolean).join(', ')} ·{' '}
          <span className="font-mono">
            {place.lat.toFixed(3)}, {place.lng.toFixed(3)}
          </span>
        </span>
      </p>
      {errors.name && (
        <p className="text-red text-xs" role="alert">
          {errors.name}
        </p>
      )}
    </div>
  );

  const dates = (
    <Field label="Dates" htmlFor="dates" error={errors.from || errors.to}>
      <DatePicker
        id="dates"
        from={from}
        to={to}
        max={today()}
        invalid={!!(errors.from || errors.to)}
        onChange={(r) => {
          setFrom(r.from);
          setTo(r.to);
          setErrors((x) => ({ ...x, from: null, to: null }));
        }}
      />
    </Field>
  );

  const notesField = (
    <Field label="Notes" htmlFor="notes">
      <Notes
        id="notes"
        rows={3}
        maxLength={4000}
        placeholder="What you ate, who you met"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="line-field min-h-24 resize-none overflow-hidden py-2 leading-relaxed"
      />
    </Field>
  );

  const photosField = (
    <div className="grid gap-2">
      <span className="eyebrow text-ink-2">Photos</span>
      <ul className="grid grid-cols-4 gap-2 sm:grid-cols-5">
        <AnimatePresence initial={false}>
          {photos.map((p, i) => (
            <motion.li
              key={typeof p === 'object' ? p.id : p}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.12 } }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="relative rounded-[3px] bg-[#fbfbf7] p-1 shadow-[0_1px_2px_rgb(0_0_0/0.18)]"
            >
              <Thumb
                id={p}
                alt={`Photo ${i + 1}`}
                className="aspect-square rounded-[2px]"
              />
              <button
                type="button"
                aria-label={`Remove photo ${i + 1}`}
                onClick={() => dropPhoto(p)}
                className="press absolute -end-1.5 -top-1.5 grid size-6 place-items-center rounded-full bg-ink text-paper shadow"
              >
                <X weight="bold" className="size-3" />
              </button>
            </motion.li>
          ))}
          {pending.map((key) => (
            <motion.li
              key={key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-square animate-pulse rounded-[3px] bg-paper-2"
            />
          ))}
        </AnimatePresence>
        {photos.length + busy < MAX_PHOTOS && (
          <li>
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="press grid aspect-square w-full place-items-center content-center gap-1 rounded-[4px] border-[1.5px] border-ink-3/60 border-dashed text-ink-2 transition-colors duration-150 hover-fine:border-ink-2 hover-fine:text-ink"
            >
              <Camera className="size-5" />
              <span className="font-medium text-[0.6875rem]">Add</span>
            </button>
          </li>
        )}
      </ul>
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          addPhotos(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );

  const preview = (className) => (
    <motion.div
      layoutId={editing ? `stamp-${id}` : undefined}
      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      className={className}
    >
      <Stamp trip={draft} className="h-full w-full" />
    </motion.div>
  );

  const buttons = (
    <>
      <button
        type="button"
        className="btn btn-line ring-hover press"
        onClick={cancel}
      >
        Cancel
      </button>
      <button
        type="submit"
        form="trip-form"
        className="btn btn-ink ring-hover press"
        disabled={saving || busy > 0}
      >
        {editing ? 'Save changes' : 'Stamp it'}
      </button>
    </>
  );

  const map = (className) => <MapSlot cooperative className={className} />;

  const short = useMedia('(max-height: 30rem)');
  const slot = editing
    ? { at: list.findIndex((t) => t.id === id) + 1, of: list.length }
    : { at: list.length + 1, of: list.length + 1 };
  const backLink = (
    <button
      type="button"
      onClick={cancel}
      className="group -ms-2 flex min-w-0 items-center gap-1.5 rounded px-2 py-2 text-ink-2 hover-fine:text-ink"
    >
      <ArrowLeft
        weight="bold"
        className="size-4 flex-none transition-transform duration-150 group-hover-fine:-translate-x-0.5"
      />
      <span className="eyebrow truncate">Back</span>
    </button>
  );

  const head = (
    <>
      {backLink}
      <span className="eyebrow flex-none font-bold text-ink">
        {locating ? 'Finding the place' : editing ? 'Editing' : 'New stamp'}
      </span>
    </>
  );

  if (spread) {
    return (
      <>
        <Left
          head={
            <>
              <span className="eyebrow min-w-0 truncate text-ink-2">
                Stamp {slot.at} of {slot.of}
              </span>
              {locating ? (
                <span className="eyebrow text-ink-3">Finding the place</span>
              ) : (
                editing && (
                  <span className="eyebrow flex-none font-bold text-ink">
                    {since(trip.from)}
                  </span>
                )
              )}
            </>
          }
          over={
            <div className="rounded-md bg-paper px-4 pt-3 pb-3.5 shadow-[0_0_0_1.5px_var(--color-rule),0_12px_28px_-14px_rgb(0_0_0/0.4)]">
              {search}
            </div>
          }
          foot={
            <span className="text-ink-2 text-xs">
              Search, or tap the map to drop a pin
            </span>
          }
        />
        <Page
          side="right"
          head={
            <>
              {backLink}
              <span className="eyebrow flex-none font-bold text-ink">
                {editing ? 'Editing' : 'New stamp'}
              </span>
            </>
          }
          foot={buttons}
        >
          <form
            id="trip-form"
            onSubmit={submit}
            noValidate
            className="scroll-thin min-h-0 flex-1 overflow-y-auto px-7 pt-5 pb-6"
          >
            <div className="grid gap-6">
              <div className="flex items-start gap-4">
                <div className="grid min-w-0 flex-1 gap-6 pt-2">
                  {chosen || (
                    <p className="text-ink-2 text-sm leading-relaxed">
                      Find the place on the left. The stamp fills in as you go.
                    </p>
                  )}
                  {dates}
                </div>
                {preview('w-48 flex-none')}
              </div>
              {notesField}
              {photosField}
            </div>
          </form>
        </Page>
      </>
    );
  }

  return (
    <Page head={head} foot={buttons}>
      {short ? (
        <div className="flex min-h-0 flex-1 gap-4 px-4 pt-2 pb-1 sm:px-6">
          <div className="flex w-[44%] flex-none flex-col gap-2">
            <div className="relative z-20">{search}</div>
            {map('min-h-0 flex-1')}
          </div>
          <form
            id="trip-form"
            onSubmit={submit}
            noValidate
            className="scroll-thin min-h-0 flex-1 overflow-y-auto pb-4"
          >
            <div className="grid gap-5">
              <div className="flex items-start gap-3">
                <div className="grid min-w-0 flex-1 gap-5">
                  {chosen || (
                    <p className="text-ink-2 text-sm leading-relaxed">
                      Find the place on the left. The stamp fills in as you go.
                    </p>
                  )}
                </div>
                {preview('w-24 flex-none')}
              </div>
              {dates}
              {notesField}
              {photosField}
            </div>
          </form>
        </div>
      ) : (
        <form
          id="trip-form"
          onSubmit={submit}
          noValidate
          className="scroll-thin min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-6 sm:px-6"
        >
          <div className="mx-auto grid max-w-xl gap-6">
            <div className="flex items-start gap-3">
              <div className="grid min-w-0 flex-1 gap-5 pt-1">
                <div className="relative z-20">{search}</div>
                {chosen}
              </div>
              {preview('w-20 flex-none min-[25rem]:w-28 sm:w-36')}
            </div>
            {map('h-52 flex-none sm:h-72')}
            {dates}
            {notesField}
            {photosField}
          </div>
        </form>
      )}
    </Page>
  );
}
