import { useEffect } from 'react';
import { createStore } from './store.js';

export const slotStore = createStore({ head: null, foot: null, over: null });
export const mapStore = createStore({
  mode: 'all',
  focusId: null,
  picked: null,
  cooperative: false,
});
export const pickHandler = { current: null };

export const mapHost = document.createElement('div');
mapHost.className = 'absolute inset-0';

export function useMapMode(mode, focusId = null) {
  useEffect(() => {
    mapStore.set((s) => ({ ...s, mode, focusId }));
  }, [mode, focusId]);
}
