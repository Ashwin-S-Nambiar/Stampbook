import { createPortal } from 'react-dom';
import { slotStore } from '../lib/stage.js';
import { useStore } from '../lib/store.js';

function Part({ node, into, className }) {
  if (!node || !into) return null;
  return createPortal(<div className={className}>{node}</div>, into);
}

export default function Left({ head, foot, over }) {
  const slots = useStore(slotStore);
  return (
    <>
      <Part
        node={head}
        into={slots.head}
        className="flex min-w-0 items-center justify-between gap-3"
      />
      <Part
        node={foot}
        into={slots.foot}
        className="flex min-w-0 items-center justify-between gap-3"
      />
      <Part node={over} into={slots.over} className="pointer-events-auto" />
    </>
  );
}
