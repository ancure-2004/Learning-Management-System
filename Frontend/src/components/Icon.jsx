import React from 'react';

/* ═══════════════════════════════════════════════════════════════
   SHARED ICONS — single source of truth (union of all dashboards)
   ═══════════════════════════════════════════════════════════════ */
const Icon = ({ name, size = 16 }) => {
  const p = {
    overview:  'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
    dept:      'M3 21V8l9-5 9 5v13M9 21V12h6v9',
    program:   'M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z',
    class:     'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm14 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
    subject:   'M4 19.5v-15A2.5 2.5 0 016.5 2H20v20H6.5a2.5 2.5 0 010-5H20',
    teacher:   'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z',
    room:      'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z',
    timetable: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
    users:     'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm14 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
    syllabus:  'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
    progress:  'M22 12h-4l-3 9L9 3l-3 9H2',
    rating:    'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    report:    'M3 3v18h18 M7 14l4-4 4 4 5-5',
    calendar:  'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
    bell:      'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0',
    search:    'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    plus:      'M12 5v14M5 12h14',
    arrow:     'M5 12h14m-6-6l6 6-6 6',
    chev:      'M9 18l6-6-6-6',
    chevDown:  'M6 9l6 6 6-6',
    chevLeft:  'M15 18l-6-6 6-6',
    chevRight: 'M9 18l6-6-6-6',
    check:     'M20 6L9 17l-5-5',
    bolt:      'M13 2L3 14h9l-2 8L21 10h-9l2-8z',
    settings:  'M12 15a3 3 0 100-6 3 3 0 000 6z',
    trendUp:   'M3 17l6-6 4 4 8-8M14 7h7v7',
    trendDown: 'M3 7l6 6 4-4 8 8M14 17h7v-7',
    dots:      'M12 13a1 1 0 100-2 1 1 0 000 2zM19 13a1 1 0 100-2 1 1 0 000 2zM5 13a1 1 0 100-2 1 1 0 000 2z',
    alert:     'M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
    clock:     'M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2',
    book:      'M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z',
    flag:      'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22V15',
    pin:       'M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7zM12 11a2 2 0 100-4 2 2 0 000 4z',
    edit:      'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z',
    play:      'M5 3l14 9-14 9V3z',
    log:       'M4 4h16v16H4z M4 8h16 M9 13h6 M9 17h6',
    star:      'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    grade:     'M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2 M9 2h6 v4 H9z M9 14l2 2 4-4',
    sparkle:   'M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z M19 14l.75 2.25L22 17l-2.25.75L19 20l-.75-2.25L16 17l2.25-.75L19 14z',
    close:     'M18 6L6 18M6 6l12 12',
    lock:      'M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z M7 11V7a5 5 0 0110 0v4',
    info:      'M12 16v-4M12 8h.01M22 12A10 10 0 1112 2a10 10 0 0110 10z',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" style={{ flexShrink: 0, display: 'block' }}>
      <path d={p[name] || p.overview} />
    </svg>
  );
};

export default Icon;
