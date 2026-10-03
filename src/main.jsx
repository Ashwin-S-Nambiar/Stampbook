import './index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { loadMap } from './lib/map.js';
import { initTips } from './lib/tip.js';
import { loadTrips } from './lib/trips.js';

const home = location.pathname === '/' || location.pathname === '/index.html';

if (home) {
  loadMap().catch(() => {});
  await Promise.all([
    loadTrips(),
    ...[
      '400 16px "Public Sans"',
      '600 16px "Barlow Condensed"',
      '700 16px "Barlow Condensed"',
      '400 16px "Red Hat Mono"',
    ].map((face) => document.fonts.load(face).catch(() => {})),
  ]);
}

if (home) {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} else {
  document.title = 'Not found · Stampbook';
}

initTips();
