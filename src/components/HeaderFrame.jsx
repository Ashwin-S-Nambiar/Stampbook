import Mark from './Mark.jsx';

export default function HeaderFrame({ children, onHome }) {
  return (
    <header
      className={`on-cover relative flex items-center justify-between gap-3 px-3 sm:px-5 spread:px-7 spread:pt-4 spread:pb-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 short:pt-2 short:pb-2`}
    >
      <a
        href="/"
        onClick={onHome}
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
      <div className="flex items-center gap-1.5">{children}</div>
    </header>
  );
}
