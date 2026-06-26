import React from 'react';
import { theme as T } from '@/theme';

/* ═══════════════════════════════════════════════════════════════
   GLASS PRIMITIVES — reusable translucent overlays
   ═══════════════════════════════════════════════════════════════ */

// Frosted glass chip — for status badges, tags, floating annotations
export const GlassChip = ({ children, dot, dotColor = T.green, style = {}, dark = false }) => (
  <div style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 12px',
    borderRadius: 999,
    background: dark ? 'rgba(15, 23, 42, 0.55)' : 'rgba(255, 255, 255, 0.55)',
    border: dark ? '1px solid rgba(255, 255, 255, 0.10)' : '1px solid rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(16px) saturate(160%)',
    WebkitBackdropFilter: 'blur(16px) saturate(160%)',
    boxShadow: dark
      ? '0 8px 24px rgba(15,23,42,0.20), 0 1px 0 rgba(255,255,255,0.06) inset'
      : '0 8px 24px rgba(15,23,42,0.06), 0 1px 0 rgba(255,255,255,0.85) inset',
    fontSize: 11.5,
    fontWeight: 600,
    letterSpacing: '-0.005em',
    color: dark ? T.textInv : T.text,
    ...style,
  }}>
    {dot && (
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: dotColor,
        boxShadow: `0 0 0 3px ${dotColor}22`,
        animation: 'pulse-dot 1.8s ease-in-out infinite',
      }} />
    )}
    {children}
  </div>
);

// Glass card overlay — for floating mini-cards inside scenes
export const GlassPanel = ({ children, style = {}, dark = false }) => (
  <div style={{
    background: dark ? 'rgba(15, 23, 42, 0.45)' : 'rgba(255, 255, 255, 0.55)',
    border: dark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    padding: 14,
    backdropFilter: 'blur(20px) saturate(160%)',
    WebkitBackdropFilter: 'blur(20px) saturate(160%)',
    boxShadow: dark
      ? '0 16px 40px rgba(15,23,42,0.30), 0 1px 0 rgba(255,255,255,0.08) inset'
      : '0 16px 40px rgba(15,23,42,0.08), 0 1px 0 rgba(255,255,255,0.85) inset',
    ...style,
  }}>
    {children}
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   3D GLASS ELEMENTS (themed for AI Timetable)
   ═══════════════════════════════════════════════════════════════ */

export const GlassCubeCalendar = ({ size = 110 }) => (
  <svg width={size} height={size} viewBox="0 0 110 110" style={{ display: 'block' }}>
    <defs>
      <linearGradient id="cube-dark-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#1e293b" stopOpacity="0.96" />
        <stop offset="100%" stopColor="#0f172a" stopOpacity="0.98" />
      </linearGradient>
      <linearGradient id="cube-dark-shine" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
        <stop offset="40%" stopColor="#ffffff" stopOpacity="0.04" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
    </defs>
    <rect x="6" y="6" width="98" height="98" rx="22" fill="url(#cube-dark-bg)" />
    <rect x="6" y="6" width="98" height="98" rx="22" fill="url(#cube-dark-shine)" />
    <g transform="translate(28, 28)">
      <rect x="0" y="0" width="54" height="54" rx="10" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.16)" strokeWidth="1" />
      <rect x="0" y="0" width="54" height="14" rx="10" fill="#7c3aed" />
      <rect x="0" y="10" width="54" height="4" fill="#7c3aed" />
      <circle cx="12" cy="7" r="1.5" fill="#fff" />
      <circle cx="42" cy="7" r="1.5" fill="#fff" />
      <rect x="8"  y="22" width="8" height="6" rx="1" fill="#a78bfa" />
      <rect x="22" y="22" width="8" height="6" rx="1" fill="rgba(255,255,255,0.3)" />
      <rect x="36" y="22" width="8" height="6" rx="1" fill="rgba(255,255,255,0.3)" />
      <rect x="8"  y="32" width="8" height="6" rx="1" fill="rgba(255,255,255,0.3)" />
      <rect x="22" y="32" width="8" height="6" rx="1" fill="#10b981" />
      <rect x="36" y="32" width="8" height="6" rx="1" fill="rgba(255,255,255,0.3)" />
      <rect x="8"  y="42" width="8" height="6" rx="1" fill="rgba(255,255,255,0.3)" />
      <rect x="22" y="42" width="8" height="6" rx="1" fill="rgba(255,255,255,0.3)" />
      <rect x="36" y="42" width="8" height="6" rx="1" fill="#f59e0b" />
    </g>
  </svg>
);

export const GlassCubeBlocks = ({ size = 130 }) => (
  <svg width={size} height={size} viewBox="0 0 130 130" style={{ display: 'block' }}>
    <defs>
      <linearGradient id="cube-glass-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%"  stopColor="#ffffff" stopOpacity="0.85" />
        <stop offset="60%" stopColor="#e9eaf5" stopOpacity="0.72" />
        <stop offset="100%" stopColor="#dad6f0" stopOpacity="0.78" />
      </linearGradient>
      <linearGradient id="cube-glass-shine" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
        <stop offset="50%" stopColor="#ffffff" stopOpacity="0.15" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
    </defs>
    <rect x="6" y="6" width="118" height="118" rx="26" fill="url(#cube-glass-bg)"
          stroke="rgba(255,255,255,0.7)" strokeWidth="1" />
    <rect x="10" y="10" width="60" height="40" rx="18" fill="url(#cube-glass-shine)" />
    <g transform="translate(30, 38)">
      <rect x="0"  y="14" width="22" height="22" rx="5" fill="#7c3aed" />
      <rect x="28" y="0"  width="20" height="18" rx="4" fill="#10b981" />
      <rect x="48" y="20" width="22" height="22" rx="5" fill="#ec4899" transform="rotate(8, 59, 31)" />
      <circle cx="14" cy="6" r="6" fill="#a78bfa" />
    </g>
  </svg>
);

export const GlassCapsuleSparkle = ({ size = 140 }) => (
  <svg width={size * 0.78} height={size} viewBox="0 0 110 140" style={{ display: 'block' }}>
    <defs>
      <linearGradient id="cap-glass-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%"  stopColor="#ffffff" stopOpacity="0.9" />
        <stop offset="50%" stopColor="#e0dcf3" stopOpacity="0.78" />
        <stop offset="100%" stopColor="#c8c0e8" stopOpacity="0.85" />
      </linearGradient>
      <linearGradient id="cap-glass-shine" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
        <stop offset="60%" stopColor="#ffffff" stopOpacity="0.05" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
    </defs>
    <rect x="6" y="6" width="98" height="128" rx="40" fill="url(#cap-glass-bg)"
          stroke="rgba(255,255,255,0.7)" strokeWidth="1" />
    <ellipse cx="55" cy="40" rx="36" ry="26" fill="url(#cap-glass-shine)" />
    <g transform="translate(55, 70)" fill="#7c3aed">
      <path d="M0 -28 L5 -8 L25 -3 L5 2 L0 22 L-5 2 L-25 -3 L-5 -8 Z" />
      <circle cx="-18" cy="20" r="3" fill="#a78bfa" />
      <circle cx="18"  cy="-22" r="2.5" fill="#a78bfa" />
    </g>
  </svg>
);

// Small floating glass orb — pure decoration
export const GlassOrb = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" style={{ display: 'block' }}>
    <defs>
      <radialGradient id={`orb-${size}`} cx="0.35" cy="0.3" r="0.7">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
        <stop offset="50%" stopColor="#e9e3f7" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.4" />
      </radialGradient>
    </defs>
    <circle cx="18" cy="18" r="16" fill={`url(#orb-${size})`}
            stroke="rgba(255,255,255,0.6)" strokeWidth="0.8" />
    <ellipse cx="13" cy="13" rx="5" ry="3" fill="rgba(255,255,255,0.7)" />
  </svg>
);

export const GlassDishWithCylinders = ({ width = 520, height = 400 }) => (
  <svg width={width} height={height} viewBox="0 0 520 400" style={{ display: 'block' }}>
    <defs>
      <linearGradient id="cyl-purple" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"  stopColor="#5b21b6" stopOpacity="0.45" />
        <stop offset="40%" stopColor="#a78bfa" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#5b21b6" stopOpacity="0.5" />
      </linearGradient>
      <linearGradient id="cyl-violet" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"  stopColor="#7c3aed" stopOpacity="0.55" />
        <stop offset="50%" stopColor="#c4b5fd" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.5" />
      </linearGradient>
      <linearGradient id="cyl-cyan" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"  stopColor="#0891b2" stopOpacity="0.45" />
        <stop offset="50%" stopColor="#67e8f9" stopOpacity="0.92" />
        <stop offset="100%" stopColor="#0891b2" stopOpacity="0.45" />
      </linearGradient>
      <linearGradient id="cyl-clear" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"  stopColor="#94a3b8" stopOpacity="0.30" />
        <stop offset="50%" stopColor="#ffffff" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.30" />
      </linearGradient>
      <radialGradient id="dish-grad" cx="0.5" cy="0.4" r="0.65">
        <stop offset="0%"  stopColor="#ffffff" stopOpacity="0.85" />
        <stop offset="60%" stopColor="#cbd5e1" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#64748b" stopOpacity="0.35" />
      </radialGradient>
      <linearGradient id="dish-rim" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"  stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.5" />
      </linearGradient>
      <linearGradient id="cyl-top-shine" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.4" />
      </linearGradient>
    </defs>
    <ellipse cx="260" cy="320" rx="220" ry="40" fill="url(#dish-grad)" opacity="0.45" />
    <ellipse cx="260" cy="305" rx="220" ry="40" fill="none" stroke="url(#dish-rim)" strokeWidth="2" />
    <ellipse cx="260" cy="305" rx="220" ry="40" fill="rgba(255,255,255,0.12)" />
    <path d="M40 305 Q 40 350 100 360 L 420 360 Q 480 350 480 305"
          fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />

    <g style={{ animation: 'float-slow 7s ease-in-out infinite' }}>
      <rect x="120" y="160" width="44" height="148" fill="url(#cyl-clear)" rx="2" />
      <ellipse cx="142" cy="160" rx="22" ry="6" fill="url(#cyl-top-shine)" />
      <ellipse cx="142" cy="308" rx="22" ry="6" fill="rgba(148,163,184,0.4)" />
    </g>
    <g style={{ animation: 'float-med 6s ease-in-out infinite', animationDelay: '0.4s' }}>
      <rect x="180" y="120" width="50" height="188" fill="url(#cyl-violet)" rx="2" />
      <ellipse cx="205" cy="120" rx="25" ry="7" fill="url(#cyl-top-shine)" />
      <ellipse cx="205" cy="308" rx="25" ry="7" fill="rgba(124,58,237,0.5)" />
    </g>
    <g style={{ animation: 'float-fast 5s ease-in-out infinite', animationDelay: '0.2s' }}>
      <rect x="248" y="180" width="48" height="128" fill="url(#cyl-cyan)" rx="2" />
      <ellipse cx="272" cy="180" rx="24" ry="6.5" fill="url(#cyl-top-shine)" />
      <ellipse cx="272" cy="308" rx="24" ry="6.5" fill="rgba(8,145,178,0.5)" />
    </g>
    <g style={{ animation: 'float-slow 8s ease-in-out infinite', animationDelay: '0.7s' }}>
      <rect x="316" y="100" width="52" height="208" fill="url(#cyl-purple)" rx="2" />
      <ellipse cx="342" cy="100" rx="26" ry="7" fill="url(#cyl-top-shine)" />
      <ellipse cx="342" cy="308" rx="26" ry="7" fill="rgba(91,33,182,0.5)" />
    </g>
    <g style={{ animation: 'float-med 6.5s ease-in-out infinite', animationDelay: '0.9s' }}>
      <rect x="386" y="220" width="38" height="88" fill="url(#cyl-clear)" rx="2" />
      <ellipse cx="405" cy="220" rx="19" ry="5" fill="url(#cyl-top-shine)" />
      <ellipse cx="405" cy="308" rx="19" ry="5" fill="rgba(148,163,184,0.4)" />
    </g>

    <ellipse cx="260" cy="350" rx="200" ry="14" fill="rgba(124,58,237,0.18)" />
  </svg>
);
