/**
 * insightsUi.jsx — Chronos Admin / Insights
 * ─────────────────────────────────────────────────────────────────────────
 * Shared chart primitives + presentational helpers used across the three
 * Insights tabs (Reports, Progress, Performance).
 * ─────────────────────────────────────────────────────────────────────────
 */
import React from 'react';
import { theme as T } from '@/theme';
import { ChIcon } from '@/layouts/AdminLayout';

/* ═══ CHART PALETTE (drawn from T tokens) ═══════════════════════════════ */
const C = {
  accent: T.accent,   // purple
  blue:   T.blue,
  green:  T.green,
  amber:  T.amber,
  red:    T.red,
  pink:   '#ec4899',
  teal:   '#14b8a6',
  indigo: '#6366f1',
};
export const CHART_COLORS = [C.accent, C.blue, C.green, C.amber, C.red, C.pink, C.teal, C.indigo];
export const chartColor = (i) => CHART_COLORS[i % CHART_COLORS.length];

/* ═══ SHARED CHART PRIMITIVES ════════════════════════════════════════════ */
const CHART_FONT = { fontFamily: T.font, fontSize: 11, fill: T.text3 };

/* Custom Tooltip */
export const ChartTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 10, padding: '10px 14px',
      boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
      fontFamily: T.font,
    }}>
      {label && <div style={{ fontSize: 11, color: T.text3, marginBottom: 6, fontWeight: 600 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: i < payload.length-1 ? 4 : 0 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color || p.fill || T.accent }} />
          <span style={{ fontSize: 12, color: T.text2, fontWeight: 500 }}>{p.name}:</span>
          <span style={{ fontSize: 12, color: T.text, fontWeight: 700 }}>
            {formatter ? formatter(p.value, p.name, p) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

/* Shared chart card wrapper */
export const ChartCard = ({ title, subtitle, children, style }) => (
  <div style={{
    background: T.surface, border: `1px solid ${T.border}`,
    borderRadius: 20, padding: '20px 22px',
    boxShadow: T.shadowCard,
    animation: 'admin-fade-up 500ms cubic-bezier(0.16,1,0.3,1) both',
    ...style,
  }}>
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: T.text, letterSpacing: '-0.025em' }}>{title}</div>
      {subtitle && <div style={{ fontSize: 11.5, color: T.text3, marginTop: 3, fontWeight: 500 }}>{subtitle}</div>}
    </div>
    {children}
  </div>
);

/* KPI metric tile */
export const MetricTile = ({ label, value, color = T.accent, icon, sub, delay = 0 }) => (
  <div style={{
    background: T.surface, border: `1px solid ${T.border}`,
    borderRadius: 18, padding: '16px 20px',
    boxShadow: T.shadowCard,
    animation: `admin-fade-up 500ms cubic-bezier(0.16,1,0.3,1) ${delay}ms both`,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
      <span style={{ fontSize: 11.5, fontWeight: 600, color: T.text3, letterSpacing: '-0.005em' }}>{label}</span>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}18`, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ChIcon name={icon || 'report'} size={13} />
      </div>
    </div>
    <div style={{ fontSize: 28, fontWeight: 700, color: T.text, letterSpacing: '-0.05em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
      {value ?? '—'}
    </div>
    {sub && <div style={{ fontSize: 11, color: T.text3, marginTop: 6, fontWeight: 500 }}>{sub}</div>}
  </div>
);

/* Spinner */
export const Spinner = ({ text = 'Loading…' }) => (
  <div style={{ padding: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
    <div style={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid ${T.accentSoft}`, borderTopColor: T.accent, animation: 'spin 0.7s linear infinite' }} />
    <span style={{ fontSize: 13, color: T.text3, fontWeight: 500 }}>{text}</span>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   STATUS HELPERS (shared Progress + Reports)
   ═══════════════════════════════════════════════════════════════ */
const STATUS_CFG = {
  ahead:    { label: 'Ahead',    color: T.green, bg: T.greenSoft },
  on_track: { label: 'On Track', color: T.blue,  bg: T.blueSoft  },
  at_risk:  { label: 'At Risk',  color: T.amber, bg: T.amberSoft },
  behind:   { label: 'Behind',   color: T.red,   bg: T.redSoft   },
};
export const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status] || { label: status || 'Unknown', color: T.text3, bg: T.surfaceMuted };
  return (
    <span style={{
      padding: '3px 9px', borderRadius: 99, fontSize: 11, fontWeight: 700,
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}28`,
      letterSpacing: '0.01em',
    }}>
      {cfg.label}
    </span>
  );
};

/* Star rating display (Performance) */
export const StarDisplay = ({ value = 0, max = 5, size = 14 }) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
      <div style={{ position:'relative', display:'inline-flex' }}>
        {/* Background stars */}
        <div style={{ display:'flex', gap:2, color:T.text4 }}>
          {Array.from({length:max}).map((_,i) => (
            <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          ))}
        </div>
        {/* Foreground stars (clipped) */}
        <div style={{ position:'absolute', top:0, left:0, overflow:'hidden', width:`${pct}%`, display:'flex', gap:2, color:T.amber }}>
          {Array.from({length:max}).map((_,i) => (
            <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink:0 }}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          ))}
        </div>
      </div>
    </div>
  );
};
