export default function Mark({ className = '' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#141d33" />
      <g
        transform="rotate(-12 32 32)"
        fill="none"
        stroke="#c9aa6b"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="32" cy="32" r="20" strokeWidth="3.2" />
        <circle cx="32" cy="32" r="15" strokeWidth="1.6" />
        <path d="M22.5 32h19M35.5 26l6 6-6 6" strokeWidth="3.2" />
      </g>
    </svg>
  );
}
