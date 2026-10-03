import { deleteTrip, photosFor, putTrip, putTripsWithPhotos } from './db.js';

const KEY = 'sb:seeded';
const OLDER = {
  'taj-3': [
    'A white marble mausoleum on the south bank of the Yamuna, built by the Mughal emperor Shah Jahan in memory of his wife Mumtaz Mahal.',
    'A white marble mausoleum on the south bank of the Yamuna in Agra, built by the Mughal emperor Shah Jahan in memory of his wife Mumtaz Mahal. Work began in 1632 and took around twenty years. The marble turns soft pink at dawn, bright white at noon and gold at sunset, and the gardens, gateway and mosque around it are laid out in near perfect symmetry. It is a UNESCO World Heritage Site and one of the New Seven Wonders of the World.',
  ],
  'victoria-22': [
    'A marble hall built in memory of Queen Victoria and opened in 1921, now a museum in 64 acres of gardens on the Maidan.',
    'A marble hall on the Maidan in Kolkata, built in memory of Queen Victoria and opened in 1921. William Emerson designed it in a mix of British and Mughal styles, using the same Makrana marble as the Taj Mahal. Inside is a museum of paintings, sculptures and manuscripts from the colonial era, and outside are 64 acres of gardens, ponds and walkways. The bronze Angel of Victory on the dome turns with the wind.',
  ],
  'jaipur-30': [
    'The Pink City, capital of Rajasthan. Amber Fort sits on the hill above Maota Lake, just outside the old city.',
    'The Pink City, capital of Rajasthan, founded in 1727 by Maharaja Sawai Jai Singh II and painted pink to welcome the Prince of Wales in 1876. The latticed windows of Hawa Mahal, the City Palace and the Jantar Mantar observatory all sit inside the old walled city. Amber Fort rises on the hill above Maota Lake just outside town, its courtyards and mirror work glowing in the evening light. The walled city is a UNESCO World Heritage Site.',
  ],
};
const RETIRED = 'sb:retired';

const OLD_SAMPLES = [
  ['Mount Fuji', '2024-01-12'],
  ['Sydney Opera House', '2024-05-27'],
  ['Geirangerfjord', '2024-10-01'],
];

export async function retireOldSamples(list) {
  try {
    if (localStorage.getItem(RETIRED)) return { list, retired: 0 };
    localStorage.setItem(RETIRED, '1');
  } catch {
    return { list, retired: 0 };
  }
  const old = list.filter((t) =>
    OLD_SAMPLES.some(([place, from]) => t.place === place && t.from === from),
  );
  for (const t of old) {
    const photos = await photosFor(t.id);
    await deleteTrip(
      t.id,
      photos.map((p) => p.id),
    );
  }
  return { list: list.filter((t) => !old.includes(t)), retired: old.length };
}

const FIRST = [
  {
    id: 'taj-3',
    place: 'Delhi',
    region: 'National Capital Territory',
    country: 'India',
    cc: 'in',
    lat: 28.6129,
    lng: 77.2295,
    from: '2017-05-11',
    to: '',
    photos: ['delhi-1', 'delhi-2'],
    notes:
      'India’s capital, where Shah Jahan’s old walled city meets the wide avenues of New Delhi. India Gate stands at the end of Kartavya Path, a war memorial that fills with families and ice cream carts in the evening. The Red Fort and Chandni Chowk are across town, and the Taj Mahal in Agra is an easy day trip down the Yamuna Expressway.',
  },
  {
    id: 'victoria-22',
    place: 'Kolkata',
    region: 'West Bengal',
    country: 'India',
    cc: 'in',
    lat: 22.5726,
    lng: 88.3639,
    from: '2018-05-14',
    to: '',
    photos: ['kolkata-1', 'kolkata-2'],
    notes:
      'The capital of West Bengal on the Hooghly, and India’s capital until 1911. The marble Victoria Memorial stands at the edge of the Maidan, and the steel Howrah Bridge carries the city across the river to Howrah station, one of the busiest in India. Trams still run, the College Street book market sprawls, and the sweets alone are worth the trip.',
  },
  {
    id: 'jaipur-30',
    place: 'Jaipur',
    region: 'Rajasthan',
    country: 'India',
    cc: 'in',
    lat: 26.9124,
    lng: 75.7873,
    from: '2023-04-09',
    to: '',
    photos: ['jaipur-1', 'jaipur-2'],
    notes:
      'The Pink City, capital of Rajasthan, founded in 1727 by Maharaja Sawai Jai Singh II and painted pink for the Prince of Wales in 1876. Hawa Mahal, the City Palace and the Jantar Mantar observatory sit inside the old walled city. Amber Fort rises on the hill above Maota Lake just outside town, its mirror work glowing in the evening light.',
  },
];

function seeded() {
  try {
    return !!localStorage.getItem(KEY);
  } catch {
    return true;
  }
}

const PHOTO_SIZES = {
  'delhi-1': [1400, 1033],
  'delhi-2': [1400, 1054],
  'kolkata-1': [1400, 1050],
  'kolkata-2': [1400, 689],
  'jaipur-1': [1400, 836],
  'jaipur-2': [1400, 1050],
};

function samplePhotos(trip) {
  return trip.photos.map((name) => {
    const [w, h] = PHOTO_SIZES[name];
    return {
      id: name,
      trip: trip.id,
      source: `/samples/${name}.jpg`,
      w,
      h,
      at: 1,
    };
  });
}

export async function seedFirstStamps(existing, replace = false) {
  if ((existing.length && !replace) || seeded()) return false;
  await putTripsWithPhotos(
    FIRST.map((t, i) => ({ ...t, created: i + 1, updated: i + 1 })),
    FIRST.flatMap(samplePhotos),
  );
  try {
    localStorage.setItem(KEY, '1');
  } catch {}
  return true;
}

const RENAMED = { 'taj-3': 'Taj Mahal', 'victoria-22': 'Victoria Memorial' };

async function rebuild(t, have) {
  const old = await photosFor(t.id);
  await putTripsWithPhotos(
    [{ ...t, created: have.created, updated: Date.now() }],
    samplePhotos(t),
    old.map((p) => p.id),
  );
}

export async function refreshFirstNotes(list) {
  let changed = false;
  for (const t of FIRST) {
    const have = list.find((x) => x.id === t.id);
    if (have && RENAMED[t.id] === have.place) {
      await rebuild(t, have);
      changed = true;
      continue;
    }
    if (have && OLDER[t.id].includes(have.notes)) {
      await putTrip({ ...have, notes: t.notes });
      changed = true;
    }
  }
  return changed;
}
