import React from 'react';
import { theme as T } from '@/theme';
import I from '@/components/Icon';

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   PRIMITIVES
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export const Card = ({ children, style, className = '', ...rest }) => (
  <div className={`ch-card ${className}`} style={{
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: 26,
    padding: '18px 20px',
    boxShadow: T.shadowCard,
    display: 'flex', flexDirection: 'column',
    minWidth: 0, minHeight: 0,
    ...style,
  }} {...rest}>
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
    fontSize: 11.5, fontWeight: 600, letterSpacing: '-0.005em',
    cursor: 'pointer', fontFamily: 'inherit',
  }}>
    {label}
    <I name="chevDown" size={12} />
  </button>
);

export const CardTitle = ({ children, right, subtitle }) => (
  <div style={{
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    marginBottom: 14, gap: 10,
  }}>
    <div style={{ minWidth: 0 }}>
      <h3 style={{
        margin: 0, fontSize: 15.5, fontWeight: 700,
        color: T.text, letterSpacing: '-0.025em',
      }}>{children}</h3>
      {subtitle && (
        <div style={{
          fontSize: 11.5, color: T.text3, fontWeight: 500,
          marginTop: 2, letterSpacing: '-0.005em',
        }}>{subtitle}</div>
      )}
    </div>
    {right}
  </div>
);

/* Small horizontal KPI tile used in the hero's right column.
   Different visual treatment from the student's capsules: full
   card with shadow, more breathing room, but minimal in width. */
export const KpiTile = ({ icon, label, value, suffix, color, urgent }) => (
  <div className="ch-card" style={{
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: 18,
    padding: '12px 14px',
    boxShadow: T.shadowCard,
    display: 'flex', alignItems: 'center', gap: 12,
    flex: 1,
  }}>
    <div style={{
      position: 'relative',
      width: 36, height: 36, borderRadius: 11,
      background: `linear-gradient(135deg, ${color}24, ${color}10)`,
      color: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      border: `1px solid ${color}30`,
      boxShadow: `0 4px 10px ${color}26, 0 1px 0 rgba(255,255,255,0.7) inset`,
    }}>
      <I name={icon} size={17} />
      {urgent && (
        <span style={{
          position: 'absolute', top: -2, right: -2,
          width: 9, height: 9, borderRadius: '50%',
          background: T.red,
          boxShadow: `0 0 0 2px ${T.surface}`,
        }} />
      )}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontSize: 11, color: T.text3, fontWeight: 500,
        letterSpacing: '-0.005em', marginBottom: 2,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 19, fontWeight: 700, color: T.text,
        letterSpacing: '-0.04em', lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
        {suffix && <span style={{
          fontSize: 12, fontWeight: 600, color: T.text3,
          letterSpacing: '-0.02em', marginLeft: 1,
        }}>{suffix}</span>}
      </div>
    </div>
  </div>
);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   SYLLABUS RING â€” circular progress ring for class cards
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export const SyllabusRing = ({ percent, size = 48, color = T.accent }) => {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, percent)) / 100) * c;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={`${color}1f`} strokeWidth="3" />
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          style={{
            strokeDashoffset: c,
            animation: `ch-ring-fill 1200ms cubic-bezier(0.16, 1, 0.3, 1) 600ms forwards`,
            '--target-offset': offset,
          }}
          ref={(el) => {
            // Workaround for animating to a computed value:
            // set the final dashoffset as inline style after mount.
            if (el) {
              el.style.strokeDashoffset = c;
              requestAnimationFrame(() => {
                el.style.transition = 'stroke-dashoffset 1200ms cubic-bezier(0.16, 1, 0.3, 1) 600ms';
                el.style.strokeDashoffset = offset;
              });
            }
          }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700, color: T.text,
        letterSpacing: '-0.03em',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {Math.round(percent)}%
      </div>
    </div>
  );
};
