import React from 'react';
import { theme as T } from '@/theme';
import I from '@/components/Icon';

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   PRIMITIVES â€” Card, KpiCard, FilterPill, CardTitle
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export const Card = ({ children, style, ...rest }) => (
  <div
    style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: 26,
      padding: '18px 20px',
      boxShadow: T.shadowCard,
      display: 'flex', flexDirection: 'column',
      minWidth: 0, minHeight: 0,
      ...style,
    }}
    {...rest}>
    {children}
  </div>
);

export const FilterPill = ({ label, onClick }) => (
  <button onClick={onClick} className="ch-pill-btn" style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '6px 11px',
    background: T.surfaceMuted,
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    color: T.text2,
    fontSize: 11.5, fontWeight: 600,
    letterSpacing: '-0.005em',
    cursor: 'pointer',
    fontFamily: 'inherit',
  }}>
    {label}
    <I name="chevDown" size={12} />
  </button>
);

export const CardTitle = ({ children, right }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 14, gap: 10,
  }}>
    <h3 style={{
      margin: 0, fontSize: 15.5, fontWeight: 700,
      color: T.text, letterSpacing: '-0.025em',
    }}>{children}</h3>
    {right}
  </div>
);

export const KpiCapsule = ({ icon, value, suffix, label, color }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: 10,
    padding: '8px 14px 8px 8px',
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: 99,
    boxShadow: T.shadowSoft,
    transition: 'transform 240ms ease, box-shadow 240ms ease',
    cursor: 'default',
  }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = T.shadowCard;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = T.shadowSoft;
    }}
  >
    <span style={{
      width: 28, height: 28, borderRadius: 9,
      background: `linear-gradient(135deg, ${color}24, ${color}10)`,
      color: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      border: `1px solid ${color}30`,
      boxShadow: `0 3px 8px ${color}26, 0 1px 0 rgba(255,255,255,0.7) inset`,
    }}>
      <I name={icon} size={14} />
    </span>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
      <span style={{
        fontSize: 15, fontWeight: 700, color: T.text,
        letterSpacing: '-0.035em', lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
        {suffix && <span style={{
          fontSize: 11.5, fontWeight: 600, color: T.text3,
          letterSpacing: '-0.02em',
        }}>{suffix}</span>}
      </span>
      <span style={{
        fontSize: 11.5, color: T.text3, fontWeight: 500,
        letterSpacing: '-0.005em',
        whiteSpace: 'nowrap',
      }}>{label}</span>
    </div>
  </div>
);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   ATTENDANCE GAUGE â€” speedometer, same shape as admin Compliance
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export const Gauge = ({ percent, label = 'PRESENT', size = 230 }) => {
  const cx = size / 2;
  const cy = size / 2 + 12;
  const r  = size / 2 - 18;
  const stroke = 14;

  const startDeg = 135;
  const totalArc = 270;
  const toRad = (d) => (d * Math.PI) / 180;
  const point = (deg, radius) => ({
    x: cx + radius * Math.cos(toRad(deg)),
    y: cy + radius * Math.sin(toRad(deg)),
  });

  const start = point(startDeg, r);
  const end   = point(startDeg + totalArc, r);
  const safePercent  = Math.max(0, Math.min(100, percent));
  const progressArc  = (safePercent / 100) * totalArc;
  const progEndDeg   = startDeg + progressArc;
  const progEnd      = point(progEndDeg, r);
  const progLargeArc = progressArc > 180 ? 1 : 0;

  const numTicks   = 56;
  const tickInnerR = r - stroke / 2 - 14;
  const tickOuterR = r - stroke / 2 - 6;

  return (
    <svg width={size} height={size * 0.92} viewBox={`0 0 ${size} ${size * 0.95}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="attGaugeProgress" x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0%"   stopColor={T.accent2} />
          <stop offset="100%" stopColor={T.accent} />
        </linearGradient>
      </defs>

      <path
        d={`M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 1 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`}
        fill="none" stroke="rgba(124, 58, 237, 0.14)"
        strokeWidth={stroke} strokeLinecap="round" />

      {safePercent > 0 && (() => {
        const progLength = (progressArc / 360) * 2 * Math.PI * r;
        return (
          <path
            d={`M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${progLargeArc} 1 ${progEnd.x.toFixed(2)} ${progEnd.y.toFixed(2)}`}
            fill="none" stroke="url(#attGaugeProgress)"
            strokeWidth={stroke} strokeLinecap="round"
            style={{
              strokeDasharray: progLength,
              strokeDashoffset: progLength,
              animation: 'ch-gauge-draw 1400ms cubic-bezier(0.16, 1, 0.3, 1) 700ms forwards',
            }}
          />
        );
      })()}

      {Array.from({ length: numTicks }).map((_, i) => {
        const t = i / (numTicks - 1);
        const tickDeg = startDeg + t * totalArc;
        const inner = point(tickDeg, tickInnerR);
        const outer = point(tickDeg, tickOuterR);
        return (
          <line key={i}
            x1={inner.x.toFixed(2)} y1={inner.y.toFixed(2)}
            x2={outer.x.toFixed(2)} y2={outer.y.toFixed(2)}
            stroke={T.text4} strokeWidth="1.2" opacity="0.45" />
        );
      })}

      <text x={cx} y={cy + 6} textAnchor="middle"
        fontSize="40" fontWeight="700" fill={T.text}
        letterSpacing="-0.05em"
        style={{
          fontVariantNumeric: 'tabular-nums',
          animation: 'ch-fade-up 600ms cubic-bezier(0.16, 1, 0.3, 1) 1400ms both',
          opacity: 0,
        }}>
        {Math.round(Math.max(0, Math.min(100, percent)))}%
      </text>
      <text x={cx} y={cy + 28} textAnchor="middle"
        fontSize="10" fill={T.text3} fontWeight="600"
        letterSpacing="0.1em"
        style={{
          animation: 'ch-fade-up 600ms cubic-bezier(0.16, 1, 0.3, 1) 1550ms both',
          opacity: 0,
        }}>
        {label}
      </text>
    </svg>
  );
};

export const SubjectCapsule = ({ subject, percent }) => {
  const color = percent >= 90 ? T.green : percent >= 75 ? T.blue : percent >= 65 ? T.amber : T.red;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: '6px 11px',
      background: `${color}14`,
      border: `1px solid ${color}28`,
      borderRadius: 99,
      fontSize: 12, fontWeight: 600,
      letterSpacing: '-0.01em',
      minWidth: 0,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: color, flexShrink: 0,
        boxShadow: `0 0 0 2.5px ${color}26`,
      }} />
      <span style={{
        color: T.text2, flex: 1, whiteSpace: 'nowrap',
        overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{subject}</span>
      <span style={{
        color: T.text, fontWeight: 700, fontSize: 12,
        letterSpacing: '-0.02em',
        fontVariantNumeric: 'tabular-nums',
        flexShrink: 0,
      }}>
        {percent}%
      </span>
    </div>
  );
};
