import React, { useState } from 'react';
import { theme as T } from '@/theme';
import I from '@/components/Icon';
import { Card, CardTitle, FilterPill, Gauge, ComplianceCapsule } from './ui';
import { formatTimeAgo } from '../Dashboard';

/* Status / severity color resolvers */
const SEV_COLORS = {
  critical: { fg: T.red,   bg: T.redSoft,   border: 'rgba(239, 68, 68, 0.18)'  },
  warning:  { fg: T.amber, bg: T.amberSoft, border: 'rgba(245, 158, 11, 0.20)' },
  info:     { fg: T.blue,  bg: T.blueSoft,  border: 'rgba(59, 130, 246, 0.18)' },
};

const STATUS_COLORS = {
  behind:   { fg: T.red,   bg: T.redSoft,   border: 'rgba(239, 68, 68, 0.18)'  },
  at_risk:  { fg: T.amber, bg: T.amberSoft, border: 'rgba(245, 158, 11, 0.20)' },
  on_track: { fg: T.blue,  bg: T.blueSoft,  border: 'rgba(59, 130, 246, 0.18)' },
  ahead:    { fg: T.green, bg: T.greenSoft, border: 'rgba(16, 185, 129, 0.18)' },
};

const EVENT_COLORS = { holiday: T.red, vacation: T.red, exam: T.amber, event: T.blue };

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   CRITICAL SUBJECTS  (maps from reference's "Students Performance")
   Same row pattern: small avatar/icon + name+meta + percentage chip
   on the right. Uses per-row colored "avatars" with subject initials.
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export const CriticalSubjectsCard = ({ critical, onSubjectClick }) => (
  <Card style={{ height: '100%' }}>
    <CardTitle right={<FilterPill label="All" />}>Subject Performance</CardTitle>
    <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
      {critical.length === 0 ? (
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: T.text3, fontSize: 13, padding: 20,
        }}>
          All subjects on track
        </div>
      ) : critical.slice(0, 5).map((s, i, arr) => {
        const colors = STATUS_COLORS[s.status] || STATUS_COLORS.behind;
        const initials = (s.subjectName || 'SU').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
        return (
          <button
            key={i}
            className="ch-row-btn"
            onClick={() => onSubjectClick(s)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 8px',
              border: 'none', background: 'transparent',
              borderBottom: i < arr.length - 1 ? `1px solid ${T.divider}` : 'none',
              borderRadius: 8,
              width: '100%', cursor: 'pointer',
              fontFamily: 'inherit', textAlign: 'left',
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: `linear-gradient(135deg, ${colors.fg}38, ${colors.fg}1a)`,
              color: colors.fg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11.5, fontWeight: 700,
              border: `1px solid ${colors.border}`,
              letterSpacing: '0.02em',
              boxShadow: `0 5px 12px ${colors.fg}2e, 0 1px 0 rgba(255,255,255,0.55) inset`,
            }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13.5, fontWeight: 600, color: T.text,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                letterSpacing: '-0.02em',
              }}>
                {s.subjectName}
              </div>
              <div style={{
                fontSize: 11.5, color: T.text3, marginTop: 3, fontWeight: 500,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                letterSpacing: '-0.005em',
              }}>
                {[s.className, s.teacherName].filter(Boolean).join(' Â· ') || 'â€”'}
              </div>
            </div>
            <div style={{
              fontSize: 14, fontWeight: 700, color: colors.fg,
              fontVariantNumeric: 'tabular-nums', flexShrink: 0,
              letterSpacing: '-0.03em',
            }}>
              {s.percent != null ? `${s.percent}%` : s.urgency.toFixed(1)}
            </div>
          </button>
        );
      })}
    </div>
  </Card>
);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   COMPLIANCE TREND  (maps from reference's "Total attendance report")
   SVG line chart with smooth path, area fill, data point markers,
   and value labels on alternating points.
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export const TrendChart = ({ data, height = 280 }) => {
  const W = 640;
  const H = height;
  const padding = { top: 40, right: 30, bottom: 38, left: 56 };
  const cw = W - padding.left - padding.right;
  const ch = H - padding.top - padding.bottom;

  const [hoverIdx, setHoverIdx] = useState(null);

  if (!data || data.length === 0) return null;

  /* â”€â”€ Auto-scale Y-axis to data range â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
     Snap min DOWN and max UP to the nearest 10 (with one tick of
     headroom on each side) so the line uses the full chart height
     instead of crawling along the top, and gridlines land on round
     numbers. */
  const values = data.map(d => d.value);
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);
  const TICK_STEP = 10;
  let yMin = Math.max(0, Math.floor((dataMin - TICK_STEP) / TICK_STEP) * TICK_STEP);
  let yMax = Math.min(100, Math.ceil((dataMax + TICK_STEP) / TICK_STEP) * TICK_STEP);
  if (yMax - yMin < TICK_STEP * 2) yMax = Math.min(100, yMin + TICK_STEP * 2);
  const range = yMax - yMin;

  const ticks = [];
  for (let v = yMin; v <= yMax; v += TICK_STEP) ticks.push(v);

  const pts = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * cw,
    y: padding.top + ch - ((d.value - yMin) / range) * ch,
    value: d.value,
    label: d.label,
  }));

  /* Smooth cubic-bezier path through the points */
  const smoothPath = pts.reduce((acc, p, i, arr) => {
    if (i === 0) return `M ${p.x.toFixed(2)},${p.y.toFixed(2)}`;
    const prev = arr[i - 1];
    const cp1x = prev.x + (p.x - prev.x) / 2;
    const cp2x = prev.x + (p.x - prev.x) / 2;
    return acc + ` C ${cp1x.toFixed(2)},${prev.y.toFixed(2)} ${cp2x.toFixed(2)},${p.y.toFixed(2)} ${p.x.toFixed(2)},${p.y.toFixed(2)}`;
  }, '');

  const areaPath = smoothPath
    + ` L ${pts[pts.length - 1].x.toFixed(2)},${(padding.top + ch).toFixed(2)}`
    + ` L ${pts[0].x.toFixed(2)},${(padding.top + ch).toFixed(2)} Z`;

  /* Find the closest data point to the cursor's x position */
  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xRel = e.clientX - rect.left;
    const xVB  = (xRel / rect.width) * W;
    let closest = 0;
    let minDist = Infinity;
    pts.forEach((p, i) => {
      const d = Math.abs(p.x - xVB);
      if (d < minDist) { minDist = d; closest = i; }
    });
    setHoverIdx(closest);
  };

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
      onMouseMove={handleMove}
      onMouseLeave={() => setHoverIdx(null)}
      style={{ display: 'block', overflow: 'visible', cursor: 'crosshair' }}>
      <defs>
        <linearGradient id="trendArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={T.accent} stopOpacity="0.18" />
          <stop offset="100%" stopColor={T.accent} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Auto-scaled gridlines + Y-axis tick labels */}
      {ticks.map(p => {
        const y = padding.top + ch * (1 - (p - yMin) / range);
        return (
          <g key={p}>
            <line x1={padding.left} x2={padding.left + cw} y1={y} y2={y}
              stroke={T.divider} strokeDasharray="3,4" />
            <text x={padding.left - 14} y={y + 3.5} fontSize={10.5} fill={T.text3}
              textAnchor="end" fontWeight="500">{p}%</text>
          </g>
        );
      })}

      <path d={areaPath} fill="url(#trendArea)" className="ch-trend-area" />

      <path className="ch-trend-line" d={smoothPath}
        fill="none" stroke={T.accent} strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />

      {/* X-axis week labels */}
      {pts.map((p, i) => (
        <text key={`x${i}`} x={p.x} y={padding.top + ch + 22}
          fontSize={11.5} fill={hoverIdx === i ? T.text : T.text3}
          textAnchor="middle" fontWeight={hoverIdx === i ? 700 : 500}
          letterSpacing="-0.005em"
          style={{ transition: 'fill 150ms ease, font-weight 150ms ease' }}>
          {p.label}
        </text>
      ))}

      {/* Dark filled data point dots â€” stagger fade-in after the line draws */}
      {pts.map((p, i) => (
        <circle key={`d${i}`} className="ch-trend-dot"
          cx={p.x} cy={p.y} r="4.5"
          fill={T.text}
          style={{
            animation: `ch-trend-dot-in 450ms cubic-bezier(0.16, 1, 0.3, 1) ${1200 + i * 130}ms both`,
          }}
        />
      ))}

      {/* â”€â”€ Hover overlay: vertical guide + halo + tooltip â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
         Triggered by the SVG's onMouseMove handler. Rendered last so
         it sits on top of the line + dots. pointerEvents: none on the
         tooltip group prevents the cursor from "hovering itself". */}
      {hoverIdx !== null && (() => {
        const p = pts[hoverIdx];
        const tipW = 80, tipH = 26;
        // Clamp tooltip horizontally so it doesn't get cut off at edges
        const minX = padding.left + tipW / 2;
        const maxX = padding.left + cw - tipW / 2;
        const tipX = Math.max(minX, Math.min(maxX, p.x));
        const tipBottomY = p.y - 16;  // bottom edge of tooltip, 16px above the dot

        return (
          <g style={{ pointerEvents: 'none' }}>
            {/* Vertical guide line through the dot */}
            <line x1={p.x} x2={p.x} y1={padding.top} y2={padding.top + ch}
              stroke={T.text3} strokeDasharray="3,4" opacity="0.55" />

            {/* Two-layer halo around the hovered dot â€” outer soft, inner solid */}
            <circle cx={p.x} cy={p.y} r="12" fill={T.accent} opacity="0.14" />
            <circle cx={p.x} cy={p.y} r="7"  fill={T.accent} opacity="0.28" />
            <circle cx={p.x} cy={p.y} r="4.5" fill={T.text} />

            {/* Tooltip pill above the dot */}
            <rect x={tipX - tipW / 2} y={tipBottomY - tipH}
              width={tipW} height={tipH} rx="7"
              fill={T.text} />
            {/* Tiny pointer notch underneath the tooltip */}
            <path d={`M ${p.x - 5} ${tipBottomY} L ${p.x} ${tipBottomY + 5} L ${p.x + 5} ${tipBottomY} Z`}
              fill={T.text} />
            <text x={tipX} y={tipBottomY - tipH / 2 + 4}
              textAnchor="middle" fontSize="11.5" fontWeight="600"
              fill="#fff" letterSpacing="-0.005em"
              style={{ fontVariantNumeric: 'tabular-nums' }}>
              {p.label} Â· {p.value}%
            </text>
          </g>
        );
      })()}
    </svg>
  );
};

export const ComplianceTrendCard = ({ trend }) => (
  <Card style={{ height: '100%' }}>
    <CardTitle right={<FilterPill label="Weekly" />}>Compliance Trend</CardTitle>
    <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center' }}>
      <TrendChart data={trend} />
    </div>
  </Card>
);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   ACTION REQUIRED  (maps from reference's "Teaching Lessons" card)
   Wide horizontal list. Each row mirrors the lesson row pattern:
     icon tile Â· count + severity Â· label + subtitle Â· category Â·
     [Open] reminder-style pill button.
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export const ActionRow = ({ alert, onClick, last }) => {
  const colors = SEV_COLORS[alert.severity] || SEV_COLORS.info;
  return (
    <button
      className="ch-row-btn"
      onClick={() => onClick(alert)}
      style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '14px 12px',
        border: 'none', background: 'transparent',
        borderBottom: !last ? `1px solid ${T.divider}` : 'none',
        borderRadius: 8,
        width: '100%', cursor: 'pointer',
        fontFamily: 'inherit', textAlign: 'left',
      }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 12, flexShrink: 0,
        background: colors.bg, color: colors.fg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${colors.border}`,
        boxShadow: `0 5px 12px ${colors.fg}26, 0 1px 0 rgba(255,255,255,0.6) inset`,
      }}>
        <I name="alert" size={18} />
      </div>

      <div style={{ flexShrink: 0, minWidth: 90 }}>
        <div style={{
          fontSize: 13.5, fontWeight: 700, color: T.text,
          letterSpacing: '-0.025em',
        }}>
          {alert.count} {alert.severity === 'critical' ? 'Critical' : alert.severity === 'warning' ? 'Warning' : 'Info'}
        </div>
        <div style={{
          fontSize: 11, color: T.text3, marginTop: 3, fontWeight: 500,
          letterSpacing: '-0.005em',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <span style={{
            width: 4, height: 4, borderRadius: '50%',
            background: colors.fg, flexShrink: 0,
          }} />
          {alert.shortPath}
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13.5, fontWeight: 600, color: T.text,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          letterSpacing: '-0.02em',
        }}>
          {alert.label}
        </div>
        <div style={{
          fontSize: 11.5, color: T.text3, marginTop: 3, fontWeight: 500,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          letterSpacing: '-0.005em',
        }}>
          {alert.subtitle}
        </div>
      </div>

      {alert.category && (
        <div style={{
          fontSize: 12, fontWeight: 600, color: T.text2,
          flexShrink: 0, padding: '0 6px',
          letterSpacing: '-0.015em',
        }}>
          {alert.category}
        </div>
      )}

      <div className="ch-pill-btn" style={{
        background: T.accentSoft, color: T.accent,
        border: `1px solid ${T.accentBorder}`,
        padding: '7px 15px', borderRadius: 99,
        fontSize: 11.5, fontWeight: 700,
        flexShrink: 0,
        letterSpacing: '-0.005em',
      }}>
        Open
      </div>
    </button>
  );
};

export const ActionRequiredCard = ({ alerts, onClick }) => (
  <Card style={{ height: '100%' }}>
    <CardTitle right={
      <span style={{ fontSize: 11, color: T.text3, fontWeight: 500 }}>
        {alerts.length} {alerts.length === 1 ? 'item' : 'items'}
      </span>
    }>
      Action Required
    </CardTitle>
    <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
      {alerts.length === 0 ? (
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', color: T.text3, fontSize: 13, padding: 20, gap: 6,
        }}>
          <I name="check" size={20} />
          <span>All clear â€” nothing needs attention</span>
        </div>
      ) : alerts.slice(0, 4).map((a, i, arr) => (
        <ActionRow key={i} alert={a} onClick={onClick} last={i === arr.length - 1} />
      ))}
    </div>
  </Card>
);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   USER PROFILE STRIP  (top of right column, mirrors reference)
   Bell + avatar (initials) + name + email.
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export const UserProfileStrip = ({ user }) => {
  const firstName = user?.firstName || 'Admin';
  const lastName  = user?.lastName  || 'User';
  const email     = user?.email     || 'admin@chronos.edu';
  const initials = (firstName[0] || 'A') + (lastName[0] || 'U');

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px',
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: 14,
      boxShadow: T.shadowCard,
    }}>
      <button style={{
        width: 32, height: 32, borderRadius: 8,
        background: T.surfaceMuted, border: `1px solid ${T.border}`,
        color: T.text2, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, position: 'relative',
        fontFamily: 'inherit',
      }} title="Notifications">
        <I name="bell" size={14} />
        <span style={{
          position: 'absolute', top: 6, right: 7,
          width: 6, height: 6, borderRadius: '50%',
          background: T.red,
          border: `1.5px solid ${T.surface}`,
        }} />
      </button>

      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: `linear-gradient(135deg, ${T.accent2}, ${T.accent})`,
        color: '#fff', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12.5, fontWeight: 600,
        letterSpacing: '0.02em',
        boxShadow: '0 2px 6px rgba(124, 58, 237, 0.25)',
      }}>
        {initials.toUpperCase()}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12.5, fontWeight: 600, color: T.text,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          letterSpacing: '-0.005em',
        }}>
          {firstName} {lastName}
        </div>
        <div style={{
          fontSize: 10.5, color: T.text3,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          marginTop: 1,
        }}>
          {email}
        </div>
      </div>
    </div>
  );
};

export const ComplianceHealthCard = ({ compliance }) => {
  const total = compliance.ahead + compliance.onTrack + compliance.atRisk + compliance.behind;
  // Gauge fill = share of subjects in good standing (ahead + on_track).
  const healthy    = compliance.ahead + compliance.onTrack;
  const healthyPct = total > 0 ? (healthy / total) * 100 : 0;

  return (
    <Card style={{ padding: '18px 20px' }}>
      <CardTitle right={<FilterPill label="All" />}>Compliance Health</CardTitle>

      {/* Speedometer gauge â€” fill (and center number) represent the
         percentage of subjects in good standing. */}
      <div style={{
        display: 'flex', justifyContent: 'center',
        marginTop: 2, marginBottom: 2,
      }}>
        <Gauge percent={healthyPct} label="ON TRACK" size={230} />
      </div>

      {/* Context line â€” ties the percentage back to the actual counts */}
      <div style={{
        textAlign: 'center',
        fontSize: 12, color: T.text3, fontWeight: 500,
        marginBottom: 14,
        letterSpacing: '-0.005em',
      }}>
        <span style={{ color: T.text2, fontWeight: 700 }}>{healthy}</span>
        {' of '}
        <span style={{ color: T.text2, fontWeight: 700 }}>{total}</span>
        {' subjects on track'}
      </div>

      {/* Capsule legend â€” 2Ã—2 grid, compact and colorful */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
      }}>
        <ComplianceCapsule color={T.green} label="Ahead"    count={compliance.ahead}   />
        <ComplianceCapsule color={T.blue}  label="On track" count={compliance.onTrack} />
        <ComplianceCapsule color={T.amber} label="At risk"  count={compliance.atRisk}  />
        <ComplianceCapsule color={T.red}   label="Behind"   count={compliance.behind}  />
      </div>
    </Card>
  );
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   UPCOMING EVENTS  (right column, mirrors reference's Upcoming)
   Date on left + vertical accent bar + title + time-range.
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export const UpcomingCard = ({ events, onClick }) => {
  const fmtTime = d => new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
  const fmtDate = d => new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

  return (
    <Card>
      <CardTitle right={<FilterPill label="7 days" />}>Upcoming Events</CardTitle>
      {events.length === 0 ? (
        <div style={{
          color: T.text3, fontSize: 12, padding: '16px 0', textAlign: 'center',
        }}>
          Nothing upcoming
        </div>
      ) : (
        <div>
          {events.slice(0, 3).map((e, i) => {
            const eventColor = EVENT_COLORS[e.eventType] || T.blue;
            return (
              <button
                key={i}
                className="ch-row-btn"
                onClick={onClick}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 11,
                  padding: '10px 6px',
                  border: 'none', background: 'transparent',
                  borderBottom: i < Math.min(events.length, 3) - 1 ? `1px solid ${T.divider}` : 'none',
                  borderRadius: 8, width: '100%',
                  cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                }}
              >
                <div style={{
                  fontSize: 11, fontWeight: 600, color: T.text2,
                  minWidth: 50, flexShrink: 0,
                  letterSpacing: '0.005em', paddingTop: 1,
                }}>
                  {fmtDate(e.startDate)}
                </div>
                <div style={{
                  width: 3, alignSelf: 'stretch', borderRadius: 2,
                  background: eventColor, flexShrink: 0,
                  minHeight: 32,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                  fontSize: 12.5, fontWeight: 600, color: T.text,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  letterSpacing: '-0.02em',
                  }}>
                  {e.title}
                  </div>
                  <div style={{
                  fontSize: 10.5, color: T.text3, marginTop: 3, fontWeight: 500,
                    letterSpacing: '-0.005em',
                  }}>
                    {e.timeRange || fmtTime(e.startDate)}
                </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   JUMP BACK IN  (right column, mirrors reference's "My Notes")
   List rows with cycling colored icon tiles.
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export const JumpBackInCard = ({ items, onClick }) => (
  <Card>
    <CardTitle right={
      <span style={{ fontSize: 11, color: T.text3, fontWeight: 500 }}>
        Recent
      </span>
    }>
      Jump Back In
    </CardTitle>
    {items.length === 0 ? (
      <div style={{
        color: T.text3, fontSize: 12, padding: '16px 0', textAlign: 'center',
      }}>
        No recent activity
      </div>
    ) : (
      <div>
        {items.slice(0, 4).map((it, i, arr) => {
          const dotColors = [T.green, T.red, T.amber, T.blue];
          const color = dotColors[i % dotColors.length];
          return (
            <button
              key={`${it.path}-${it.timestamp}`}
              className="ch-row-btn"
              onClick={() => onClick(it.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 11,
                padding: '9px 6px',
                border: 'none', background: 'transparent',
                borderBottom: i < arr.length - 1 ? `1px solid ${T.divider}` : 'none',
                borderRadius: 8, width: '100%',
                cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
              }}
            >
              <span style={{
                width: 30, height: 30, borderRadius: 9,
                background: `${color}24`, color: color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                border: `1px solid ${color}38`,
                boxShadow: `0 4px 10px ${color}26, 0 1px 0 rgba(255,255,255,0.5) inset`,
              }}>
                <I name={it.icon || 'overview'} size={13} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 12.5, fontWeight: 600, color: T.text,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  letterSpacing: '-0.02em',
                }}>
                  {it.label}
                </div>
                <div style={{
                  fontSize: 10.5, color: T.text3, marginTop: 2, fontWeight: 500,
                  letterSpacing: '-0.005em',
                }}>
                  {formatTimeAgo(it.timestamp)}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    )}
  </Card>
);
