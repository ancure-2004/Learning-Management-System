import React from 'react';
import { theme as T } from '@/theme';
import I from '@/components/Icon';

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   CARD PRIMITIVES
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export const Card = ({ children, style, ...rest }) => (
  <div
    style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: 26,
      padding: '18px 20px',
      boxShadow: T.shadowCard,
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
      minHeight: 0,
      ...style,
    }}
    {...rest}
  >
    {children}
  </div>
);

export const CardTitle = ({ children, right }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 14, flexShrink: 0,
  }}>
    <h3 style={{
      fontSize: 15.5, fontWeight: 700, color: T.text, margin: 0,
      letterSpacing: '-0.025em',
    }}>
      {children}
    </h3>
    {right}
  </div>
);

/* Filter pill (e.g. "Weekly â–¾") used in the trend chart card title */
export const FilterPill = ({ label }) => (
  <button style={{
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    padding: '6px 11px',
    fontSize: 11.5, fontWeight: 600, color: T.text3,
    letterSpacing: '-0.005em',
    fontFamily: 'inherit', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 5,
  }}>
    <span>{label}</span>
    <I name="chevDown" size={11} />
  </button>
);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   KPI CARD  (white card, colored icon tile, big number, delta pill)
   Direct adaptation of the reference's "02/08 / Total classes" cards.
   Each card has its own accent color so the row reads as a colorful
   KPI strip â€” same visual rhythm as the reference's illustrated tiles.
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export const KpiCard = ({ label, value, total, delta, deltaLabel, icon, color, isInverted }) => {
  const showDelta = delta !== undefined && delta !== null && delta !== 0;
  const isPositive = isInverted ? delta < 0 : delta > 0;
  const deltaFg = isPositive ? T.green : T.red;
  const deltaBg = isPositive ? T.greenSoft : T.redSoft;
  const deltaBorder = isPositive ? 'rgba(16, 185, 129, 0.20)' : 'rgba(239, 68, 68, 0.20)';
  const formattedDelta = delta > 0 ? `+${delta}` : `${delta}`;
  const valueColor = color || T.accent;

  return (
    <div className="ch-kpi-card" tabIndex={0} style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: 28,
      padding: '18px 22px',
      boxShadow: T.shadowCard,
      display: 'flex', flexDirection: 'column',
      minWidth: 0,
      cursor: 'default',
    }}>
      {/* TOP ROW â€” icon tile + delta pill */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        marginBottom: 14,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: `linear-gradient(135deg, ${valueColor}1f, ${valueColor}0d)`,
          color: valueColor,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          border: `1px solid ${valueColor}2e`,
          boxShadow: `0 6px 14px ${valueColor}26, 0 1px 0 rgba(255,255,255,0.7) inset`,
        }}>
          <I name={icon} size={19} />
        </div>
        {showDelta && (
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: deltaFg, background: deltaBg,
            border: `1px solid ${deltaBorder}`,
            padding: '3px 9px', borderRadius: 99,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.01em',
            display: 'inline-flex', alignItems: 'center', gap: 3,
            lineHeight: 1.4,
          }}>
            <I name={isPositive ? 'trendUp' : 'trendDown'} size={10} />
            {formattedDelta}
          </span>
        )}
      </div>

      {/* Big number â€” uses X/Y format if total provided, like reference's "02/08" */}
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 4,
        lineHeight: 1, marginBottom: 6,
      }}>
        <span style={{
          fontSize: 32, fontWeight: 700, color: T.text,
          letterSpacing: '-0.05em', fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
        }}>
          {String(value).padStart(2, '0')}
        </span>
        {total != null && (
          <span style={{
            fontSize: 19, fontWeight: 600, color: T.text3,
            letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums',
          }}>
            /{String(total).padStart(2, '0')}
          </span>
        )}
      </div>

      {/* Label */}
      <div style={{
        fontSize: 13, color: T.text3, fontWeight: 500,
        letterSpacing: '-0.005em', lineHeight: 1.3,
      }}>
        {label}
      </div>

      {/* Footnote */}
      {deltaLabel && (
        <div style={{
          fontSize: 11, color: T.text4, fontWeight: 500,
          marginTop: 10, letterSpacing: '0.005em',
        }}>
          vs {deltaLabel}
        </div>
      )}
    </div>
  );
};

export const KpiStrip = ({ kpis }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 14,
  }}>
    <div className="ch-tile-cell d1">
      <KpiCard
        label={kpis.totalClasses.sublabel} value={kpis.totalClasses.value}
        total={kpis.totalClasses.total}
        delta={kpis.totalClasses.delta} deltaLabel={kpis.totalClasses.deltaLabel}
        icon={kpis.totalClasses.icon} color={kpis.totalClasses.color}
      />
    </div>
    <div className="ch-tile-cell d2">
      <KpiCard
        label={kpis.activeTimetables.sublabel} value={kpis.activeTimetables.value}
        total={kpis.activeTimetables.total}
        delta={kpis.activeTimetables.delta} deltaLabel={kpis.activeTimetables.deltaLabel}
        icon={kpis.activeTimetables.icon} color={kpis.activeTimetables.color}
      />
    </div>
    <div className="ch-tile-cell d3">
      <KpiCard
        label={kpis.pendingActions.sublabel} value={kpis.pendingActions.value}
        total={kpis.pendingActions.total}
        delta={kpis.pendingActions.delta} deltaLabel={kpis.pendingActions.deltaLabel}
        icon={kpis.pendingActions.icon} color={kpis.pendingActions.color}
        isInverted={kpis.pendingActions.isInverted}
      />
    </div>
    <div className="ch-tile-cell d4">
      <KpiCard
        label={kpis.totalSubjects.sublabel} value={kpis.totalSubjects.value}
        total={kpis.totalSubjects.total}
        delta={kpis.totalSubjects.delta} deltaLabel={kpis.totalSubjects.deltaLabel}
        icon={kpis.totalSubjects.icon} color={kpis.totalSubjects.color}
      />
    </div>
  </div>
);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   COMPLIANCE HEALTH (speedometer gauge + capsule legend)
   270Â° gauge arc opening at the bottom with tick marks around the
   inner edge, big number at center, and four colored capsule pills
   below for the breakdown â€” gauge takes most of the visual weight.
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export const Gauge = ({ percent, label = 'ON TRACK', size = 230 }) => {
  const cx = size / 2;
  const cy = size / 2 + 12;          // shift down slightly â€” the gap is at the bottom
  const r  = size / 2 - 18;
  const stroke = 14;

  const startDeg = 135;              // lower-left
  const totalArc = 270;              // sweep up around the top to lower-right
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

  // Tick marks just inside the arc â€” give it the speedometer feel
  const numTicks   = 56;
  const tickInnerR = r - stroke / 2 - 14;
  const tickOuterR = r - stroke / 2 - 6;

  return (
    <svg width={size} height={size * 0.92} viewBox={`0 0 ${size} ${size * 0.95}`}
      style={{ display: 'block' }}>
      <defs>
        <linearGradient id="gaugeProgress" x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0%"   stopColor={T.accent2} />
          <stop offset="100%" stopColor={T.accent} />
        </linearGradient>
      </defs>

      {/* Background track â€” light purple */}
      <path
        d={`M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 1 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`}
        fill="none" stroke="rgba(124, 58, 237, 0.14)"
        strokeWidth={stroke} strokeLinecap="round"
      />

      {/* Progress arc â€” gradient purple, animated stroke draw on mount */}
      {safePercent > 0 && (() => {
        const progLength = (progressArc / 360) * 2 * Math.PI * r;
        return (
          <path
            d={`M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${progLargeArc} 1 ${progEnd.x.toFixed(2)} ${progEnd.y.toFixed(2)}`}
            fill="none" stroke="url(#gaugeProgress)"
            strokeWidth={stroke} strokeLinecap="round"
            style={{
              strokeDasharray: progLength,
              strokeDashoffset: progLength,
              animation: 'ch-gauge-draw 1400ms cubic-bezier(0.16, 1, 0.3, 1) 700ms forwards',
            }}
          />
        );
      })()}

      {/* Tick marks around the inner edge */}
      {Array.from({ length: numTicks }).map((_, i) => {
        const t = i / (numTicks - 1);
        const tickDeg = startDeg + t * totalArc;
        const inner = point(tickDeg, tickInnerR);
        const outer = point(tickDeg, tickOuterR);
        return (
          <line key={i}
            x1={inner.x.toFixed(2)} y1={inner.y.toFixed(2)}
            x2={outer.x.toFixed(2)} y2={outer.y.toFixed(2)}
            stroke={T.text4} strokeWidth="1.2" opacity="0.45"
          />
        );
      })}

      {/* Center value + label â€” fade in after gauge has drawn most of the way */}
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

/* Compact capsule pill â€” colored dot + label + count, color-tinted bg.
   Used in a 2Ã—2 grid below the gauge so the legend takes minimal room. */
export const ComplianceCapsule = ({ color, label, count }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '7px 12px',
    background: `${color}14`,
    border: `1px solid ${color}28`,
    borderRadius: 99,
    fontSize: 12, fontWeight: 600,
    letterSpacing: '-0.01em',
    minWidth: 0,
  }}>
    <span style={{
      width: 7, height: 7, borderRadius: '50%',
      background: color, flexShrink: 0,
      boxShadow: `0 0 0 2.5px ${color}26`,
    }} />
    <span style={{
      color: T.text2, flex: 1, whiteSpace: 'nowrap',
      overflow: 'hidden', textOverflow: 'ellipsis',
    }}>{label}</span>
    <span style={{
      color: T.text, fontWeight: 700, fontSize: 13,
      letterSpacing: '-0.02em',
      fontVariantNumeric: 'tabular-nums',
      flexShrink: 0,
    }}>
      {count}
    </span>
  </div>
);
