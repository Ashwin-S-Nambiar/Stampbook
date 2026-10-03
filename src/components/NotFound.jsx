import Footer from './Footer.jsx';
import Mark from './Mark.jsx';

export default function NotFound() {
  return (
    <div className="on-cover grid h-full grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)_auto]">
      <main className="grid grid-cols-[minmax(0,1fr)] place-items-center p-4">
        <div className="paper grid min-w-0 w-full max-w-md justify-items-center gap-6 rounded-[10px] px-6 pt-10 pb-8 short:gap-3 short:pt-5 short:pb-5 text-center shadow-[0_0_0_5px_var(--color-cover-deep),0_24px_50px_-20px_rgb(0_0_0/0.6)]">
          <svg
            viewBox="-100 -60 200 120"
            className="w-60 -rotate-6 short:w-40"
            role="img"
            aria-label="No entry"
          >
            <defs>
              <filter id="nf" x="-10%" y="-10%" width="120%" height="120%">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.8"
                  numOctaves="2"
                  seed="4"
                />
                <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -1.5 1.55" />
                <feComposite in="SourceGraphic" operator="in" />
              </filter>
            </defs>
            <g fill="#b3303a" stroke="#b3303a" filter="url(#nf)" opacity="0.9">
              <rect
                x="-94"
                y="-54"
                width="188"
                height="108"
                rx="10"
                fill="none"
                strokeWidth="4.5"
              />
              <rect
                x="-86"
                y="-46"
                width="172"
                height="92"
                rx="6"
                fill="none"
                strokeWidth="1.5"
              />
              <text
                y="4"
                textAnchor="middle"
                stroke="none"
                fontFamily="Barlow Condensed, sans-serif"
                fontWeight="700"
                fontSize="44"
                letterSpacing="5"
              >
                NO ENTRY
              </text>
              <text
                y="32"
                textAnchor="middle"
                stroke="none"
                fontFamily="Red Hat Mono, monospace"
                fontWeight="500"
                fontSize="14"
                letterSpacing="2"
              >
                ERROR 404
              </text>
            </g>
          </svg>
          <p className="text-balance font-semibold text-lg">
            This page isn’t in the passport.
          </p>
          <a href="/" className="btn btn-ink ring-hover press gap-2.5 ps-2">
            <Mark className="size-6" />
            Back to Stampbook
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}
