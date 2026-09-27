export function Book({ children }) {
  return (
    <main className="paper relative mx-3 flex min-h-0 overflow-hidden rounded-[10px] shadow-[0_0_0_4px_var(--color-cover-deep),0_24px_50px_-20px_rgb(0_0_0/0.6)] sm:mx-5 spread:mx-7 spread:shadow-[0_0_0_6px_var(--color-cover-deep),0_24px_50px_-20px_rgb(0_0_0/0.6)]">
      {children}
    </main>
  );
}

export function Page({
  side = 'single',
  head,
  foot,
  children,
  className = '',
  bodyClass = '',
  headRef,
  footRef,
}) {
  const gutter =
    side === 'left' ? 'gutter-left' : side === 'right' ? 'gutter-right' : '';
  const slot = 'grid min-w-0 flex-1 *:col-start-1 *:row-start-1';
  return (
    <section
      className={`paper relative flex h-full min-h-0 min-w-0 flex-1 flex-col ${gutter} ${className}`}
    >
      <div className="mx-4 flex min-h-12 flex-none items-center justify-between gap-3 border-rule border-b sm:mx-6 spread:mx-7 spread:min-h-14">
        {headRef ? <div ref={headRef} className={slot} /> : head}
      </div>
      <div className={`relative flex min-h-0 flex-1 flex-col ${bodyClass}`}>
        {children}
      </div>
      <div className="mx-4 flex min-h-11 flex-none items-center justify-between gap-3 sm:mx-6 spread:mx-7 spread:min-h-12">
        {footRef ? <div ref={footRef} className={slot} /> : foot}
      </div>
    </section>
  );
}

export function Runner({ children, strong }) {
  return (
    <>
      <span className="eyebrow min-w-0 truncate text-ink-2">{children}</span>
      {strong && (
        <span className="eyebrow flex-none font-bold text-ink">{strong}</span>
      )}
    </>
  );
}
