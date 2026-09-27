const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const parse = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return { y, m, d };
};

export const stampDate = (iso, year = true) => {
  const { y, m, d } = parse(iso);
  const out = `${String(d).padStart(2, '0')} ${MONTHS[m - 1].toUpperCase()}`;
  return year ? `${out} ${y}` : out;
};

export const niceDate = (iso) => {
  const { y, m, d } = parse(iso);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};

export function niceRange(from, to) {
  if (!to || to === from) return niceDate(from);
  const a = parse(from);
  const b = parse(to);
  if (a.y === b.y && a.m === b.m)
    return `${a.d} to ${b.d} ${MONTHS[b.m - 1]} ${b.y}`;
  if (a.y === b.y)
    return `${a.d} ${MONTHS[a.m - 1]} to ${b.d} ${MONTHS[b.m - 1]} ${b.y}`;
  return `${niceDate(from)} to ${niceDate(to)}`;
}

const utc = (iso) => {
  const { y, m, d } = parse(iso);
  return Date.UTC(y, m - 1, d);
};

export const days = (from, to) =>
  !to || to < from ? 1 : Math.round((utc(to) - utc(from)) / 864e5) + 1;

export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const year = (iso) => parse(iso).y;

export function since(iso) {
  const a = parse(iso);
  const now = new Date();
  const months =
    (now.getFullYear() - a.y) * 12 +
    (now.getMonth() + 1 - a.m) -
    (now.getDate() < a.d ? 1 : 0);
  if (months < 1) return 'This month';
  if (months < 12) return months === 1 ? 'A month ago' : `${months} months ago`;
  const years = Math.floor(months / 12);
  return years === 1 ? 'A year ago' : `${years} years ago`;
}
