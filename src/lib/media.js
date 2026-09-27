import { useSyncExternalStore } from 'react';

const SPREAD = '(min-width: 64rem) and (min-height: 36rem)';

export function useMedia(query) {
  return useSyncExternalStore(
    (cb) => {
      const m = matchMedia(query);
      m.addEventListener('change', cb);
      return () => m.removeEventListener('change', cb);
    },
    () => matchMedia(query).matches,
  );
}

export const useSpread = () => useMedia(SPREAD);
