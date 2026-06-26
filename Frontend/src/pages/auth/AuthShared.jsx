import { theme } from '@/theme';
import React from 'react';

/* ═══════════════════════════════════════════════════════════════
   AUTH SHARED — split-screen layout, glass elements, design
   tokens, and the serif typography system used by Login & Register.
   These two pages are visually distinct from the rest of the app:
   serif-driven, editorial, refined — a more personal moment in
   contrast to the marketing/dashboard surfaces.
   ═══════════════════════════════════════════════════════════════ */

export const T = theme;

/* ─── Icons ──────────────────────────────────────────────────── */
export const Icon = ({ d, size = 16, sw = 1.6, fill = 'none', viewBox = '0 0 24 24' }) => (
  <svg width={size} height={size} viewBox={viewBox} fill={fill} stroke="currentColor"
       strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

export const ICONS = {
  arrow:    'M5 12h14M13 6l6 6-6 6',
  arrowSm:  'M9 6l6 6-6 6',
  upRight:  'M7 17L17 7M7 7h10v10',
  check:    'M5 12l5 5 9-11',
  spark:    'M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z',
  calendar: ['M3 8h18', 'M8 3v4M16 3v4', 'M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z'],
  user:     ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'],
  teacher:  ['M22 10v6M2 10l10-5 10 5-10 5z', 'M6 12v5c3 3 9 3 12 0v-5'],
  shield:   'M12 2l9 4v6c0 5-4 9-9 10-5-1-9-5-9-10V6l9-4z',
  eye:      ['M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z', 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],
  eyeOff:   ['M9.88 9.88a3 3 0 1 0 4.24 4.24', 'M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68', 'M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61', 'M2 2l20 20'],
};

/* ─── Global styles for auth pages ───────────────────────────── */
export const AUTH_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap');

.auth-page {
  font-family: 'Cormorant Garamond', 'Instrument Serif', Georgia, serif;
  color: ${T.text};
  background: ${T.bg};
  height: 100vh;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ── DISPLAY HEADLINES — Instrument Serif ── */
.auth-display {
  font-family: 'Instrument Serif', Georgia, serif;
  font-weight: 400;
  letter-spacing: -0.012em;
  line-height: 1.05;
  color: ${T.text};
}
.auth-display-inv {
  font-family: 'Instrument Serif', Georgia, serif;
  font-weight: 400;
  letter-spacing: -0.012em;
  line-height: 1.05;
  color: ${T.textInv};
}

/* ── BODY — Cormorant Garamond ── */
.auth-body {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 1.55;
  color: ${T.text3};
}
.auth-body-inv {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-weight: 500;
  font-size: 15.5px;
  line-height: 1.55;
  color: ${T.textInv2};
}

/* Italic subtitle — small italic serif */
.auth-italic {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-style: italic;
  font-weight: 500;
  font-size: 14.5px;
  color: ${T.text3};
  line-height: 1.4;
}

/* ── INPUTS ── */
.auth-input {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 15px;
  font-weight: 500;
  width: 100%;
  padding: 14px 16px;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid ${T.borderInput};
  color: ${T.text};
  outline: none;
  transition: all 0.2s ${T.ease};
  box-sizing: border-box;
  letter-spacing: -0.005em;
}
.auth-input::placeholder {
  color: ${T.text4};
  font-style: normal;
  font-weight: 500;
}
.auth-input:hover { border-color: rgba(15, 23, 42, 0.16); }
.auth-input:focus {
  border-color: ${T.accent};
  background: ${T.surface};
  box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.10);
}

/* ── LINKS ── */
.auth-link {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-weight: 600;
  font-size: 15px;
  color: ${T.accent};
  text-decoration: none;
  cursor: pointer;
  transition: color 0.15s ${T.ease};
  letter-spacing: -0.005em;
}
.auth-link:hover { color: ${T.accentDark}; text-decoration: underline; text-underline-offset: 3px; }

.auth-link-muted {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-weight: 500;
  font-size: 13px;
  color: ${T.text4};
  text-decoration: none;
  cursor: pointer;
  transition: color 0.15s ${T.ease};
  letter-spacing: -0.005em;
}
.auth-link-muted:hover { color: ${T.text3}; }

/* ── BUTTONS ── */
.auth-btn-primary {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 19px;
  font-weight: 600;
  letter-spacing: 0;
  width: 100%;
  padding: 14px 22px;
  border-radius: 11px;
  background: linear-gradient(180deg, ${T.accent2} 0%, ${T.accent} 100%);
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s ${T.ease};
  box-shadow: 0 6px 18px ${T.accentGlow}, 0 1px 0 rgba(255, 255, 255, 0.25) inset;
}
.auth-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 10px 24px ${T.accentGlow}, 0 1px 0 rgba(255, 255, 255, 0.25) inset; }
.auth-btn-primary:active { transform: translateY(0); }
.auth-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

/* ── SEGMENTED CONTROL (role tabs) ── */
.auth-tabs {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: rgba(15, 23, 42, 0.04);
  border: 1px solid ${T.border};
  border-radius: 12px;
  padding: 4px;
  gap: 0;
}
.auth-tab {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 15px;
  font-weight: 600;
  padding: 10px 14px;
  border-radius: 9px;
  cursor: pointer;
  background: transparent;
  border: none;
  color: ${T.text3};
  transition: color 0.2s ${T.ease};
  letter-spacing: -0.005em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  position: relative;
  z-index: 1;
}
.auth-tab.active { color: ${T.text}; }
.auth-tab-indicator {
  position: absolute;
  top: 4px;
  bottom: 4px;
  width: calc(50% - 4px);
  background: white;
  border-radius: 9px;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.08), 0 1px 0 rgba(255, 255, 255, 0.85) inset;
  transition: transform 0.3s ${T.easeOut};
  z-index: 0;
}

/* ── CHECKBOX ── */
.auth-check {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}
.auth-check-box {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border-radius: 5px;
  border: 1.5px solid ${T.borderInput};
  background: rgba(255, 255, 255, 0.6);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ${T.ease};
  margin-top: 2px;
}
.auth-check-box.checked {
  background: ${T.accent};
  border-color: ${T.accent};
}
.auth-check-text {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 14px;
  font-weight: 500;
  color: ${T.text2};
  line-height: 1.4;
  letter-spacing: -0.003em;
}

/* ── PREVIEW BUTTONS (temporary, while no DB) ── */
.auth-preview-btn {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 13.5px;
  font-weight: 600;
  padding: 9px 12px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid ${T.border};
  color: ${T.text2};
  cursor: pointer;
  transition: all 0.2s ${T.ease};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  letter-spacing: -0.005em;
  width: 100%;
}
.auth-preview-btn:hover { background: white; border-color: ${T.borderInput}; transform: translateY(-1px); }

/* ── ERROR ── */
.auth-error {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 14px;
  font-weight: 600;
  color: ${T.red};
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.20);
  border-radius: 9px;
  padding: 10px 13px;
  letter-spacing: -0.005em;
}

/* ── ANIMATIONS ── */
@keyframes auth-float-slow { 0%,100%{transform:translate3d(0,0,0)} 50%{transform:translate3d(0,-12px,0)} }
@keyframes auth-float-med  { 0%,100%{transform:translate3d(0,0,0)} 50%{transform:translate3d(0,-9px,0)} }
@keyframes auth-float-fast { 0%,100%{transform:translate3d(0,0,0)} 50%{transform:translate3d(0,-6px,0)} }
@keyframes auth-fade-up    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
@keyframes auth-pulse      { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.25);opacity:0.65} }

.auth-fade-up { animation: auth-fade-up 0.7s ${T.easeOut} both; }

/* ── SCROLLBAR ── */
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: ${T.bg}; }
::-webkit-scrollbar-thumb { background: rgba(15, 23, 42, 0.10); border-radius: 999px; }
`;

/* ═══════════════════════════════════════════════════════════════
   GLASS PRIMITIVES — translucent overlays for the auth scene
   ═══════════════════════════════════════════════════════════════ */
export const GlassChip = ({ children, dot, dotColor = T.green, style = {}, dark = false }) => (
  <div style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 11px',
    borderRadius: 999,
    background: dark ? 'rgba(15, 23, 42, 0.42)' : 'rgba(255, 255, 255, 0.55)',
    border: dark ? '1px solid rgba(255, 255, 255, 0.14)' : '1px solid rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(16px) saturate(160%)',
    WebkitBackdropFilter: 'blur(16px) saturate(160%)',
    boxShadow: dark
      ? '0 8px 24px rgba(15, 23, 42, 0.20), 0 1px 0 rgba(255, 255, 255, 0.10) inset'
      : '0 8px 24px rgba(15, 23, 42, 0.06), 0 1px 0 rgba(255, 255, 255, 0.85) inset',
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: 12.5,
    fontWeight: 600,
    color: dark ? T.textInv : T.text,
    letterSpacing: '-0.003em',
    ...style,
  }}>
    {dot && (
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: dotColor,
        boxShadow: `0 0 0 3px ${dotColor}22`,
        animation: 'auth-pulse 1.8s ease-in-out infinite',
      }} />
    )}
    {children}
  </div>
);

export const GlassPanel = ({ children, style = {}, dark = false }) => (
  <div style={{
    background: dark ? 'rgba(15, 23, 42, 0.40)' : 'rgba(255, 255, 255, 0.55)',
    border: dark ? '1px solid rgba(255, 255, 255, 0.10)' : '1px solid rgba(255, 255, 255, 0.7)',
    borderRadius: 14,
    padding: 12,
    backdropFilter: 'blur(20px) saturate(160%)',
    WebkitBackdropFilter: 'blur(20px) saturate(160%)',
    boxShadow: dark
      ? '0 14px 36px rgba(15, 23, 42, 0.25), 0 1px 0 rgba(255, 255, 255, 0.08) inset'
      : '0 14px 36px rgba(15, 23, 42, 0.08), 0 1px 0 rgba(255, 255, 255, 0.85) inset',
    ...style,
  }}>
    {children}
  </div>
);

const GlassOrb = ({ size = 36, idSeed = 'a' }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" style={{ display: 'block' }}>
    <defs>
      <radialGradient id={`auth-orb-${idSeed}`} cx="0.35" cy="0.3" r="0.7">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
        <stop offset="50%" stopColor="#ece6fa" stopOpacity="0.65" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.35" />
      </radialGradient>
    </defs>
    <circle cx="18" cy="18" r="16" fill={`url(#auth-orb-${idSeed})`}
            stroke="rgba(255, 255, 255, 0.6)" strokeWidth="0.8" />
    <ellipse cx="13" cy="13" rx="5" ry="3" fill="rgba(255, 255, 255, 0.7)" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════════
   3D GLASS ELEMENTS (themed for AI Timetable)
   ═══════════════════════════════════════════════════════════════ */

const GlassCubeCalendar = ({ size = 110, idSeed = 'a' }) => (
  <svg width={size} height={size} viewBox="0 0 110 110" style={{ display: 'block' }}>
    <defs>
      <linearGradient id={`auth-cube-dark-${idSeed}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#1e293b" stopOpacity="0.96" />
        <stop offset="100%" stopColor="#0f172a" stopOpacity="0.98" />
      </linearGradient>
      <linearGradient id={`auth-cube-shine-${idSeed}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
        <stop offset="40%" stopColor="#ffffff" stopOpacity="0.04" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
    </defs>
    <rect x="6" y="6" width="98" height="98" rx="22" fill={`url(#auth-cube-dark-${idSeed})`} />
    <rect x="6" y="6" width="98" height="98" rx="22" fill={`url(#auth-cube-shine-${idSeed})`} />
    <g transform="translate(28, 28)">
      <rect x="0" y="0" width="54" height="54" rx="10" fill="rgba(255, 255, 255, 0.08)" stroke="rgba(255, 255, 255, 0.16)" strokeWidth="1" />
      <rect x="0" y="0" width="54" height="14" rx="10" fill="#7c3aed" />
      <rect x="0" y="10" width="54" height="4" fill="#7c3aed" />
      <circle cx="12" cy="7" r="1.5" fill="#fff" />
      <circle cx="42" cy="7" r="1.5" fill="#fff" />
      <rect x="8"  y="22" width="8" height="6" rx="1" fill="#a78bfa" />
      <rect x="22" y="22" width="8" height="6" rx="1" fill="rgba(255, 255, 255, 0.3)" />
      <rect x="36" y="22" width="8" height="6" rx="1" fill="rgba(255, 255, 255, 0.3)" />
      <rect x="8"  y="32" width="8" height="6" rx="1" fill="rgba(255, 255, 255, 0.3)" />
      <rect x="22" y="32" width="8" height="6" rx="1" fill="#10b981" />
      <rect x="36" y="32" width="8" height="6" rx="1" fill="rgba(255, 255, 255, 0.3)" />
      <rect x="8"  y="42" width="8" height="6" rx="1" fill="rgba(255, 255, 255, 0.3)" />
      <rect x="22" y="42" width="8" height="6" rx="1" fill="rgba(255, 255, 255, 0.3)" />
      <rect x="36" y="42" width="8" height="6" rx="1" fill="#f59e0b" />
    </g>
  </svg>
);

const GlassCubeBlocks = ({ size = 130, idSeed = 'a' }) => (
  <svg width={size} height={size} viewBox="0 0 130 130" style={{ display: 'block' }}>
    <defs>
      <linearGradient id={`auth-cube-glass-${idSeed}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%"  stopColor="#ffffff" stopOpacity="0.92" />
        <stop offset="60%" stopColor="#f0eaff" stopOpacity="0.78" />
        <stop offset="100%" stopColor="#dad0f5" stopOpacity="0.85" />
      </linearGradient>
      <linearGradient id={`auth-cube-glass-shine-${idSeed}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.78" />
        <stop offset="50%" stopColor="#ffffff" stopOpacity="0.18" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
    </defs>
    <rect x="6" y="6" width="118" height="118" rx="26" fill={`url(#auth-cube-glass-${idSeed})`}
          stroke="rgba(255, 255, 255, 0.78)" strokeWidth="1" />
    <rect x="10" y="10" width="60" height="40" rx="18" fill={`url(#auth-cube-glass-shine-${idSeed})`} />
    <g transform="translate(30, 38)">
      <rect x="0"  y="14" width="22" height="22" rx="5" fill="#7c3aed" />
      <rect x="28" y="0"  width="20" height="18" rx="4" fill="#10b981" />
      <rect x="48" y="20" width="22" height="22" rx="5" fill="#ec4899" transform="rotate(8, 59, 31)" />
      <circle cx="14" cy="6" r="6" fill="#a78bfa" />
    </g>
  </svg>
);

const GlassCapsuleSparkle = ({ size = 140, idSeed = 'a' }) => (
  <svg width={size * 0.78} height={size} viewBox="0 0 110 140" style={{ display: 'block' }}>
    <defs>
      <linearGradient id={`auth-cap-glass-${idSeed}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%"  stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="50%" stopColor="#ebe4fb" stopOpacity="0.82" />
        <stop offset="100%" stopColor="#cdc1f2" stopOpacity="0.88" />
      </linearGradient>
      <linearGradient id={`auth-cap-shine-${idSeed}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
        <stop offset="60%" stopColor="#ffffff" stopOpacity="0.05" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
    </defs>
    <rect x="6" y="6" width="98" height="128" rx="40" fill={`url(#auth-cap-glass-${idSeed})`}
          stroke="rgba(255, 255, 255, 0.78)" strokeWidth="1" />
    <ellipse cx="55" cy="40" rx="36" ry="26" fill={`url(#auth-cap-shine-${idSeed})`} />
    <g transform="translate(55, 70)" fill="#7c3aed">
      <path d="M0 -28 L5 -8 L25 -3 L5 2 L0 22 L-5 2 L-25 -3 L-5 -8 Z" />
      <circle cx="-18" cy="20" r="3" fill="#a78bfa" />
      <circle cx="18"  cy="-22" r="2.5" fill="#a78bfa" />
    </g>
  </svg>
);

const GlassDishCompact = ({ width = 380, height = 280, idSeed = 'a' }) => (
  <svg width={width} height={height} viewBox="0 0 380 280" style={{ display: 'block' }}>
    <defs>
      <linearGradient id={`auth-cyl-purple-${idSeed}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"  stopColor="#5b21b6" stopOpacity="0.45" />
        <stop offset="40%" stopColor="#a78bfa" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#5b21b6" stopOpacity="0.5" />
      </linearGradient>
      <linearGradient id={`auth-cyl-violet-${idSeed}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"  stopColor="#7c3aed" stopOpacity="0.55" />
        <stop offset="50%" stopColor="#c4b5fd" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.5" />
      </linearGradient>
      <linearGradient id={`auth-cyl-cyan-${idSeed}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"  stopColor="#0891b2" stopOpacity="0.45" />
        <stop offset="50%" stopColor="#67e8f9" stopOpacity="0.92" />
        <stop offset="100%" stopColor="#0891b2" stopOpacity="0.45" />
      </linearGradient>
      <linearGradient id={`auth-cyl-clear-${idSeed}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"  stopColor="#94a3b8" stopOpacity="0.30" />
        <stop offset="50%" stopColor="#ffffff" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.30" />
      </linearGradient>
      <radialGradient id={`auth-dish-grad-${idSeed}`} cx="0.5" cy="0.4" r="0.65">
        <stop offset="0%"  stopColor="#ffffff" stopOpacity="0.85" />
        <stop offset="60%" stopColor="#cbd5e1" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#64748b" stopOpacity="0.35" />
      </radialGradient>
      <linearGradient id={`auth-dish-rim-${idSeed}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"  stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.5" />
      </linearGradient>
      <linearGradient id={`auth-cyl-top-${idSeed}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.4" />
      </linearGradient>
    </defs>
    {/* Dish */}
    <ellipse cx="190" cy="222" rx="160" ry="28" fill={`url(#auth-dish-grad-${idSeed})`} opacity="0.45" />
    <ellipse cx="190" cy="212" rx="160" ry="28" fill="none" stroke={`url(#auth-dish-rim-${idSeed})`} strokeWidth="2" />
    <ellipse cx="190" cy="212" rx="160" ry="28" fill="rgba(255, 255, 255, 0.12)" />
    <path d="M30 212 Q 30 244 75 252 L 305 252 Q 350 244 350 212"
          fill="rgba(255, 255, 255, 0.18)" stroke="rgba(255, 255, 255, 0.55)" strokeWidth="1.5" />

    {/* Cylinders */}
    <g style={{ animation: 'auth-float-slow 7s ease-in-out infinite' }}>
      <rect x="80" y="120" width="32" height="92" fill={`url(#auth-cyl-clear-${idSeed})`} rx="2" />
      <ellipse cx="96" cy="120" rx="16" ry="4.5" fill={`url(#auth-cyl-top-${idSeed})`} />
      <ellipse cx="96" cy="212" rx="16" ry="4.5" fill="rgba(148, 163, 184, 0.4)" />
    </g>
    <g style={{ animation: 'auth-float-med 6s ease-in-out infinite', animationDelay: '0.4s' }}>
      <rect x="124" y="86" width="38" height="126" fill={`url(#auth-cyl-violet-${idSeed})`} rx="2" />
      <ellipse cx="143" cy="86" rx="19" ry="5" fill={`url(#auth-cyl-top-${idSeed})`} />
      <ellipse cx="143" cy="212" rx="19" ry="5" fill="rgba(124, 58, 237, 0.5)" />
    </g>
    <g style={{ animation: 'auth-float-fast 5s ease-in-out infinite', animationDelay: '0.2s' }}>
      <rect x="174" y="138" width="36" height="74" fill={`url(#auth-cyl-cyan-${idSeed})`} rx="2" />
      <ellipse cx="192" cy="138" rx="18" ry="4.8" fill={`url(#auth-cyl-top-${idSeed})`} />
      <ellipse cx="192" cy="212" rx="18" ry="4.8" fill="rgba(8, 145, 178, 0.5)" />
    </g>
    <g style={{ animation: 'auth-float-slow 8s ease-in-out infinite', animationDelay: '0.7s' }}>
      <rect x="224" y="68" width="40" height="144" fill={`url(#auth-cyl-purple-${idSeed})`} rx="2" />
      <ellipse cx="244" cy="68" rx="20" ry="5.2" fill={`url(#auth-cyl-top-${idSeed})`} />
      <ellipse cx="244" cy="212" rx="20" ry="5.2" fill="rgba(91, 33, 182, 0.5)" />
    </g>
    <g style={{ animation: 'auth-float-med 6.5s ease-in-out infinite', animationDelay: '0.9s' }}>
      <rect x="278" y="160" width="28" height="52" fill={`url(#auth-cyl-clear-${idSeed})`} rx="2" />
      <ellipse cx="292" cy="160" rx="14" ry="3.8" fill={`url(#auth-cyl-top-${idSeed})`} />
      <ellipse cx="292" cy="212" rx="14" ry="3.8" fill="rgba(148, 163, 184, 0.4)" />
    </g>

    {/* Glow under dish */}
    <ellipse cx="190" cy="248" rx="150" ry="10" fill="rgba(124, 58, 237, 0.22)" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════════
   AUTH SCENE — portrait composition for the left panel
   ═══════════════════════════════════════════════════════════════ */
export const AuthScene = ({ idSeed = 'l' }) => (
  <div style={{
    position: 'relative',
    width: '100%',
    height: 460,
    pointerEvents: 'none',
  }}>
    {/* Top-left: calendar cube */}
    <div style={{
      position: 'absolute', top: 10, left: 10,
      animation: 'auth-float-slow 6s ease-in-out infinite',
      filter: 'drop-shadow(0 16px 30px rgba(15, 23, 42, 0.22))',
      transform: 'rotate(-8deg)',
      zIndex: 4,
    }}>
      <GlassCubeCalendar size={104} idSeed={`${idSeed}-1`} />
    </div>

    {/* Glass annotation chip — near top */}
    <div style={{
      position: 'absolute', top: 6, left: 130,
      animation: 'auth-float-med 5.5s ease-in-out infinite',
      animationDelay: '0.3s',
      zIndex: 6,
    }}>
      <GlassChip dot dotColor={T.green} style={{ fontSize: 11.5 }}>
        <span style={{ color: T.text2 }}>
          Just generated <span style={{ fontWeight: 700, color: T.text }}>312 slots</span>
        </span>
      </GlassChip>
    </div>

    {/* Top-right: blocks cube */}
    <div style={{
      position: 'absolute', top: 50, right: 30,
      animation: 'auth-float-med 7s ease-in-out infinite',
      animationDelay: '0.3s',
      filter: 'drop-shadow(0 18px 36px rgba(124, 58, 237, 0.26))',
      transform: 'rotate(8deg)',
      zIndex: 4,
    }}>
      <GlassCubeBlocks size={130} idSeed={`${idSeed}-2`} />
    </div>

    {/* Capsule with sparkle — middle-left */}
    <div style={{
      position: 'absolute', top: 130, left: 60,
      animation: 'auth-float-fast 6.5s ease-in-out infinite',
      animationDelay: '0.6s',
      filter: 'drop-shadow(0 16px 32px rgba(124, 58, 237, 0.22))',
      transform: 'rotate(-6deg)',
      zIndex: 5,
    }}>
      <GlassCapsuleSparkle size={130} idSeed={`${idSeed}-3`} />
    </div>

    {/* Floating orbs for depth */}
    <div style={{
      position: 'absolute', top: 165, right: 70,
      animation: 'auth-float-slow 5s ease-in-out infinite',
      animationDelay: '0.4s',
      zIndex: 5,
    }}>
      <GlassOrb size={42} idSeed={`${idSeed}-orb1`} />
    </div>
    <div style={{
      position: 'absolute', bottom: 96, left: 30,
      animation: 'auth-float-fast 4.5s ease-in-out infinite',
      animationDelay: '1s',
      zIndex: 5,
    }}>
      <GlassOrb size={28} idSeed={`${idSeed}-orb2`} />
    </div>
    <div style={{
      position: 'absolute', top: 270, right: 30,
      animation: 'auth-float-med 5.5s ease-in-out infinite',
      animationDelay: '0.2s',
      zIndex: 5,
    }}>
      <GlassOrb size={22} idSeed={`${idSeed}-orb3`} />
    </div>

    {/* Centerpiece: dish with cylinders */}
    <div style={{
      position: 'absolute', bottom: -10, left: '50%',
      transform: 'translateX(-50%)',
      filter: 'drop-shadow(0 24px 40px rgba(15, 23, 42, 0.22))',
      zIndex: 3,
    }}>
      <GlassDishCompact width={380} height={260} idSeed={`${idSeed}-4`} />
    </div>

    {/* Glass status panel — bottom right */}
    <div style={{
      position: 'absolute', bottom: 16, right: 0,
      animation: 'auth-float-med 7s ease-in-out infinite',
      animationDelay: '0.8s',
      zIndex: 7,
      pointerEvents: 'auto',
    }}>
      <GlassPanel style={{ padding: '10px 12px', minWidth: 140 }}>
        <div style={{
          fontSize: 9.5, fontWeight: 700, color: T.text3,
          textTransform: 'uppercase', letterSpacing: '0.12em',
          marginBottom: 5, fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          Conflict check
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 22, height: 22, borderRadius: '50%',
            background: T.green, color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon d={ICONS.check} size={13} sw={3} />
          </div>
          <div>
            <div style={{
              fontSize: 13.5, fontWeight: 700, color: T.text,
              fontFamily: "'Cormorant Garamond', Georgia, serif",
            }}>
              All clear
            </div>
            <div style={{
              fontSize: 10.5, color: T.text3,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontVariantNumeric: 'tabular-nums',
            }}>
              0 of 1,284 conflicts
            </div>
          </div>
        </div>
      </GlassPanel>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   AUTH SPLIT LAYOUT — the shell used by Login and Register
   Mirrors the reference: outer cream bg, white rounded card,
   purple panel on the left with curved right edge, white form
   panel on the right.
   ═══════════════════════════════════════════════════════════════ */
export const AuthSplitLayout = ({ tagline, taglineAccent, body, children, idSeed = 'l' }) => (
  <div className="auth-page" style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 24px',
  }}>
    <div style={{
      position: 'relative',
      width: '100%',
      maxWidth: 1180,
      height: 'calc(100vh - 48px)',
      maxHeight: 'calc(100vh - 48px)',
      background: T.surface,
      borderRadius: 32,
      boxShadow: T.shadowCard,
      display: 'grid',
      gridTemplateColumns: '0.85fr 1fr',
      overflow: 'hidden',
    }}>

      {/* ═══ LEFT PANEL — purple ═══ */}
      <div style={{
        position: 'relative',
        background: `linear-gradient(165deg, ${T.panelGlow} 0%, ${T.panel} 45%, ${T.panelDeep} 100%)`,
        borderRadius: '0 36px 36px 0',
        padding: '40px 44px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
      }}>
        {/* Soft luminous accents on the panel */}
        <div style={{
          position: 'absolute', top: -100, right: -80,
          width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.35), transparent 65%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -80, left: -60,
          width: 280, height: 280, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(196, 181, 253, 0.45), transparent 65%)',
          pointerEvents: 'none',
        }} />

        {/* Top: brand */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: 'rgba(255, 255, 255, 0.22)',
              backdropFilter: 'blur(14px)',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white',
            }}>
              <Icon d={ICONS.calendar} size={15} sw={2} />
            </div>
            <span style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: 22, fontWeight: 400, color: 'white',
              letterSpacing: '-0.005em',
            }}>
              Schedula
            </span>
          </div>
        </div>

        {/* Middle: tagline */}
        <div style={{ position: 'relative', zIndex: 2, marginTop: 'auto', marginBottom: 24 }}>
          <h1 className="auth-display-inv auth-fade-up" style={{
            fontSize: 'clamp(40px, 4.4vw, 60px)',
            margin: '0 0 18px',
            color: 'white',
          }}>
            {tagline}
            {taglineAccent && (
              <>
                <br />
                <span style={{ fontStyle: 'italic', color: '#f2eafd' }}>{taglineAccent}</span>
              </>
            )}
          </h1>
          {body && (
            <p className="auth-body-inv auth-fade-up" style={{
              maxWidth: 380, margin: 0,
              animationDelay: '0.1s',
            }}>
              {body}
            </p>
          )}
        </div>

        {/* Bottom: glass scene */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <AuthScene idSeed={idSeed} />
        </div>

        {/* Footer: small decorative link */}
        <div style={{
          position: 'absolute', bottom: 22, left: 44, zIndex: 3,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontSize: 13.5,
            color: 'rgba(255, 255, 255, 0.65)',
          }}>
            Built for modern campuses
          </span>
        </div>
      </div>

      {/* ═══ RIGHT PANEL — form ═══ */}
      <div style={{
        position: 'relative',
        padding: '40px 72px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'safe center',
        background: T.surface,
        overflowY: 'auto',
      }}>
        {children}
      </div>
    </div>
  </div>
);
