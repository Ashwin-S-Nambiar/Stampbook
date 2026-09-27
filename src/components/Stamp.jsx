import { useId } from 'react';
import { design, fit, lines } from '../lib/stamp.js';

const DISPLAY = 'Barlow Condensed, Barlow Condensed Fallback, sans-serif';
const MONO = 'Red Hat Mono, Red Hat Mono Fallback, monospace';

function Label({ text, width, base, spacing = 2.5, weight = 700, ...rest }) {
  const { size, squeeze } = fit(text, width, base, spacing);
  return (
    <text
      fontFamily={DISPLAY}
      fontWeight={weight}
      fontSize={size}
      letterSpacing={spacing}
      textAnchor="middle"
      textLength={squeeze || undefined}
      lengthAdjust="spacingAndGlyphs"
      {...rest}
    >
      {text}
    </text>
  );
}

function Mono({ text, size = 15, ...rest }) {
  return (
    <text
      fontFamily={MONO}
      fontWeight={500}
      fontSize={size}
      textAnchor="middle"
      {...rest}
    >
      {text}
    </text>
  );
}

function Plane(props) {
  return (
    <path
      stroke="none"
      d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"
      {...props}
    />
  );
}

function Circle({ l, id }) {
  const top = fit(l.country, 120, 16, 3);
  const bottom = fit(l.place, 132, 14, 2.5, 8);
  return (
    <>
      <circle r="70" fill="none" strokeWidth="4" />
      <circle r="61" fill="none" strokeWidth="1.6" />
      <path
        id={`${id}t`}
        d="M-46 0a46 46 0 0 1 92 0"
        fill="none"
        stroke="none"
      />
      <path
        id={`${id}b`}
        d="M-54 0a54 54 0 0 0 108 0"
        fill="none"
        stroke="none"
      />
      <text
        fontFamily={DISPLAY}
        fontWeight={700}
        fontSize={top.size}
        letterSpacing={3}
        stroke="none"
      >
        <textPath
          href={`#${id}t`}
          startOffset="50%"
          textAnchor="middle"
          textLength={top.squeeze || undefined}
          lengthAdjust="spacingAndGlyphs"
        >
          {l.country}
        </textPath>
      </text>
      <text
        fontFamily={DISPLAY}
        fontWeight={600}
        fontSize={bottom.size}
        letterSpacing={2.5}
        stroke="none"
      >
        <textPath
          href={`#${id}b`}
          startOffset="50%"
          textAnchor="middle"
          textLength={bottom.squeeze || undefined}
          lengthAdjust="spacingAndGlyphs"
        >
          {l.place}
        </textPath>
      </text>
      <line
        x1="-42"
        x2="42"
        y1={l.to ? -18 : -14}
        y2={l.to ? -18 : -14}
        strokeWidth="1.4"
      />
      <line
        x1="-42"
        x2="42"
        y1={l.to ? 21 : 18}
        y2={l.to ? 21 : 18}
        strokeWidth="1.4"
      />
      <Mono text={l.from} y={l.to ? 0 : 8} stroke="none" />
      {l.to && <Mono text={`TO ${l.to}`} size={10.5} y={13} stroke="none" />}
    </>
  );
}

function Rect({ l }) {
  return (
    <>
      <rect
        x="-80"
        y="-54"
        width="160"
        height="108"
        rx="10"
        fill="none"
        strokeWidth="4"
      />
      <rect
        x="-72"
        y="-46"
        width="144"
        height="92"
        rx="6"
        fill="none"
        strokeWidth="1.4"
      />
      <Label
        text={l.country}
        width={124}
        base={22}
        spacing={3}
        y={-19}
        stroke="none"
      />
      <g transform="translate(-58 -8) rotate(90 6 6) scale(.55)">
        <Plane />
      </g>
      <Mono text={l.from} x={8} y={6} stroke="none" />
      {l.to && (
        <Mono text={`TO ${l.to}`} size={10.5} x={8} y={20} stroke="none" />
      )}
      <Label
        text={l.code ? `${l.place} · ${l.code}` : l.place}
        width={124}
        base={15}
        weight={600}
        y={l.to ? 38 : 34}
        stroke="none"
      />
    </>
  );
}

const oct = (r) =>
  Array.from({ length: 8 }, (_, k) => {
    const a = Math.PI / 8 + (k * Math.PI) / 4;
    return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`;
  }).join(' ');

function Oct({ l }) {
  return (
    <>
      <polygon points={oct(74)} fill="none" strokeWidth="4" />
      <polygon points={oct(65)} fill="none" strokeWidth="1.4" />
      <Label
        text={l.country}
        width={104}
        base={19}
        spacing={3}
        y={-24}
        stroke="none"
      />
      <Mono text={l.from} size={14} y={3} stroke="none" />
      {l.to && <Mono text={`TO ${l.to}`} size={11} y={20} stroke="none" />}
      <Label
        text={l.place}
        width={74}
        base={14}
        weight={600}
        y={l.to ? 42 : 36}
        stroke="none"
      />
    </>
  );
}

function Oval({ l }) {
  return (
    <>
      <ellipse rx="82" ry="58" fill="none" strokeWidth="4" />
      <ellipse rx="73" ry="49" fill="none" strokeWidth="1.4" />
      <Label
        text={l.country}
        width={112}
        base={20}
        spacing={3}
        y={-18}
        stroke="none"
      />
      <Mono text={l.from} size={14} y={5} stroke="none" />
      {l.to && <Mono text={`TO ${l.to}`} size={10.5} y={21} stroke="none" />}
      <Label
        text={l.place}
        width={78}
        base={14}
        weight={600}
        y={l.to ? 38 : 32}
        stroke="none"
      />
    </>
  );
}

const PAPER = '#eef0e6';

function Notch({ l }) {
  const cut = (x, y, w, h, c) =>
    `M${x + c} ${y}H${x + w - c}L${x + w} ${y + c}V${y + h - c}L${x + w - c} ${y + h}H${x + c}L${x} ${y + h - c}V${y + c}Z`;
  return (
    <>
      <path d={cut(-76, -56, 152, 112, 14)} fill="none" strokeWidth="3.5" />
      <path d={cut(-68, -48, 136, 30, 6)} stroke="none" />
      <Label
        text={l.country}
        width={118}
        base={20}
        spacing={3}
        y={-26}
        fill={PAPER}
        stroke="none"
      />
      <Mono text={l.from} size={15} y={6} stroke="none" />
      {l.to && <Mono text={`TO ${l.to}`} size={10.5} y={21} stroke="none" />}
      <line
        x1="-56"
        x2="56"
        y1={l.to ? 28 : 20}
        y2={l.to ? 28 : 20}
        strokeWidth="1.2"
      />
      <Label
        text={l.code ? `${l.place} · ${l.code}` : l.place}
        width={118}
        base={14}
        weight={600}
        y={l.to ? 45 : 39}
        stroke="none"
      />
    </>
  );
}

function Band({ l, id }) {
  const top = fit(l.country, 104, 16, 3);
  const bottom = fit(l.place, 110, 13, 2.5, 8);
  return (
    <>
      <circle r="68" fill="none" strokeWidth="3" />
      <circle r="63" fill="none" strokeWidth="1" strokeDasharray="2 3" />
      <path
        id={`${id}t`}
        d="M-47 0a47 47 0 0 1 94 0"
        fill="none"
        stroke="none"
      />
      <path
        id={`${id}b`}
        d="M-52 0a52 52 0 0 0 104 0"
        fill="none"
        stroke="none"
      />
      <text
        fontFamily={DISPLAY}
        fontWeight={700}
        fontSize={top.size}
        letterSpacing={3}
        stroke="none"
      >
        <textPath
          href={`#${id}t`}
          startOffset="50%"
          textAnchor="middle"
          textLength={top.squeeze || undefined}
          lengthAdjust="spacingAndGlyphs"
        >
          {l.country}
        </textPath>
      </text>
      <text
        fontFamily={DISPLAY}
        fontWeight={600}
        fontSize={bottom.size}
        letterSpacing={2.5}
        stroke="none"
      >
        <textPath
          href={`#${id}b`}
          startOffset="50%"
          textAnchor="middle"
          textLength={bottom.squeeze || undefined}
          lengthAdjust="spacingAndGlyphs"
        >
          {l.place}
        </textPath>
      </text>
      <rect
        x="-86"
        y="-15"
        width="172"
        height={l.to ? 34 : 26}
        rx="3"
        stroke="none"
      />
      <Mono
        text={l.from}
        size={15}
        y={l.to ? 1 : 3}
        fill={PAPER}
        stroke="none"
      />
      {l.to && (
        <Mono text={`TO ${l.to}`} size={10} y={14} fill={PAPER} stroke="none" />
      )}
    </>
  );
}

const notchPath = (x, y, w, h, c) =>
  `M${x + c} ${y}H${x + w - c}L${x + w} ${y + c}V${y + h - c}L${x + w - c} ${y + h}H${x + c}L${x} ${y + h - c}V${y + c}Z`;

const HALO = {
  circle: <circle r="72" />,
  rect: <rect x="-82" y="-56" width="164" height="112" rx="11" />,
  oct: <polygon points={oct(76)} />,
  oval: <ellipse rx="84" ry="60" />,
  notch: <path d={notchPath(-78, -58, 156, 116, 15)} />,
  band: <circle r="70" />,
};

const SHAPES = {
  circle: Circle,
  rect: Rect,
  oct: Oct,
  oval: Oval,
  notch: Notch,
  band: Band,
};

export default function Stamp({
  trip,
  className = '',
  title = true,
  clean = false,
  halo = false,
}) {
  const raw = useId();
  const id = `s${raw.replace(/[^a-zA-Z0-9]/g, '')}`;
  const d = design(trip);
  const l = lines(trip);
  const Shape = SHAPES[d.shape];
  return (
    <svg
      viewBox="-92 -82 184 164"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title ? `${trip.place}, ${trip.country}` : undefined}
      overflow="visible"
    >
      <defs>
        <filter id={`${id}f`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={0.72 + (d.seed % 7) * 0.03}
            numOctaves="2"
            seed={d.seed}
          />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -1.5 1.55" />
          <feComposite in="SourceGraphic" operator="in" />
        </filter>
      </defs>
      {halo && (
        <g transform={`rotate(${d.rot})`} fill={d.color} className="sb-halo">
          {HALO[d.shape]}
        </g>
      )}
      <g
        transform={`rotate(${d.rot})`}
        fill={d.color}
        stroke={d.color}
        filter={clean ? undefined : `url(#${id}f)`}
        opacity="0.9"
      >
        <Shape l={l} id={id} />
      </g>
    </svg>
  );
}
