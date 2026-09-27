import { useLayoutEffect, useRef } from 'react';
import { mapHost, mapStore } from '../lib/stage.js';

const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function MapSlot({ cooperative = false, className = '' }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const before = mapHost.isConnected ? mapHost.getBoundingClientRect() : null;
    el.appendChild(mapHost);
    mapStore.set((s) => ({ ...s, cooperative }));
    if (!before || still()) return;
    const after = mapHost.getBoundingClientRect();
    const dx = before.left - after.left;
    const dy = before.top - after.top;
    if (Math.abs(dx) + Math.abs(dy) < 1) return;
    mapHost.getAnimations().forEach((a) => {
      a.cancel();
    });
    mapHost.animate(
      [
        { transform: `translate(${dx}px, ${dy}px)` },
        { transform: 'translate(0, 0)' },
      ],
      { duration: 380, easing: 'cubic-bezier(0.32, 0.72, 0, 1)' },
    );
  }, [cooperative]);

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden rounded-[4px] bg-paper-2/60 outline outline-rule ${className}`}
    />
  );
}
