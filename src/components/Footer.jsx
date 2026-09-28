export default function Footer() {
  return (
    <footer className="on-cover flex items-center justify-between gap-4 px-4 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-[0.75rem] text-foil/70 sm:px-6 spread:px-8 spread:pb-3.5">
      <span className="min-w-0 truncate">
        ©{' '}
        <a
          href="https://www.openstreetmap.org/copyright"
          className="underline decoration-foil/40 underline-offset-2 hover-fine:text-foil"
        >
          OpenStreetMap
        </a>{' '}
        ·{' '}
        <a
          href="https://openmaptiles.org"
          className="underline decoration-foil/40 underline-offset-2 hover-fine:text-foil"
        >
          OpenMapTiles
        </a>{' '}
        ·{' '}
        <a
          href="https://openfreemap.org"
          className="underline decoration-foil/40 underline-offset-2 hover-fine:text-foil"
        >
          OpenFreeMap
        </a>
        <span className="hidden sm:inline">
          {' '}
          · Search by{' '}
          <a
            href="https://photon.komoot.io"
            className="underline decoration-foil/40 underline-offset-2 hover-fine:text-foil"
          >
            Photon
          </a>
        </span>
      </span>
      <a
        href="https://ashwin.co.in"
        className="flex-none underline decoration-foil/40 underline-offset-2 hover-fine:text-foil"
      >
        Made by Ashwin
      </a>
    </footer>
  );
}
