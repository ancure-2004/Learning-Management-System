import React from 'react';

/* ═══════════════════════════════════════════════════════════════
   ICONS
   ═══════════════════════════════════════════════════════════════ */
export const Icon = ({ d, size = 18, sw = 1.7, fill = 'none', viewBox = '0 0 24 24' }) => (
  <svg width={size} height={size} viewBox={viewBox} fill={fill} stroke="currentColor"
       strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

export const ICONS = {
  arrow:    'M5 12h14M13 6l6 6-6 6',
  arrowUp:  'M7 17L17 7M7 7h10v10',
  search:   ['M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14z', 'M20 20l-3.5-3.5'],
  plus:     'M12 5v14M5 12h14',
  check:    'M5 12l5 5 9-11',
  spark:    'M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z',
  bolt:     'M13 3L4 14h7l-1 7 9-11h-7l1-7z',
  calendar: ['M3 8h18', 'M8 3v4M16 3v4', 'M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z'],
  clock:    ['M12 7v5l3 2', 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z'],
  users:    ['M17 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2', 'M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M22 20v-2a4 4 0 0 0-3-3.87', 'M15 2.13a4 4 0 0 1 0 7.75'],
  shield:   'M12 2l9 4v6c0 5-4 9-9 10-5-1-9-5-9-10V6l9-4z',
  chart:    ['M3 3v18h18', 'M7 14l4-4 4 4 5-5'],
  star:     'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  play:     'M8 5l11 7-11 7V5z',
};
