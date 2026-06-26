/**
 * StudentAttendancePage.jsx — Chronos Student
 * Attendance overview for the student.
 * No backend attendance endpoint yet — shows empty state.
 * Route: /student-attendance
 */
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import StudentLayout, {
  StudentCard, StudentEmptyState, StudentIcon, StudentT as T,
} from '@/layouts/StudentLayout';

/* ─── Full 270° gauge matching the app's purple identity ──────── */
const AttendanceGauge = ({ percent, size = 220 }) => {
  const cx = size / 2;
  const cy = size / 2 + 10;
  const r  = size / 2 - 22;
  const sw = 16; // stroke width

  // 270° arc: starts at 135° ends at 405° (=45°)
  const toRad   = (d) => (d * Math.PI) / 180;
  const point   = (deg) => ({
    x: cx + r * Math.cos(toRad(deg)),
    y: cy + r * Math.sin(toRad(deg)),
  });

  const startDeg = 135;
  const totalArc = 270;
  const pct      = Math.max(0, Math.min(100, percent));
  const fillArc  = (pct / 100) * totalArc;

  const trackStart = point(startDeg);
  const trackEnd   = point(startDeg + totalArc);
  const fillEnd    = point(startDeg + fillArc);
  const fillLarge  = fillArc > 180 ? 1 : 0;

  // Tick marks
  const ticks    = 54;
  const tickInR  = r - sw / 2 - 14;
  const tickOutR = r - sw / 2 - 5;

  // Color driven by threshold
  const gaugeColor = pct >= 85
    ? T.accent          // purple — good
    : pct >= 75
    ? T.amber           // amber — near threshold
    : T.red;            // red — below minimum

  const statusLabel = pct >= 85 ? 'Good Standing'
    : pct >= 75 ? 'Near Threshold' : 'Below Minimum';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg
        width={size}
        height={size * 0.86}
        viewBox={`0 0 ${size} ${size * 0.88}`}
        style={{ display: 'block' }}
      >
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0.5">
            <stop offset="0%"   stopColor="#a78bfa" />
            <stop offset="100%" stopColor={gaugeColor} />
          </linearGradient>
        </defs>

        {/* Track */}
        <path
          d={`M ${trackStart.x.toFixed(2)} ${trackStart.y.toFixed(2)}
              A ${r} ${r} 0 1 1 ${trackEnd.x.toFixed(2)} ${trackEnd.y.toFixed(2)}`}
          fill="none"
          stroke={`${gaugeColor}18`}
          strokeWidth={sw}
          strokeLinecap="round"
        />

        {/* Tick marks */}
        {Array.from({ length: ticks }).map((_, i) => {
          const t      = i / (ticks - 1);
          const tickDeg = startDeg + t * totalArc;
          const inner  = { x: cx + tickInR  * Math.cos(toRad(tickDeg)), y: cy + tickInR  * Math.sin(toRad(tickDeg)) };
          const outer  = { x: cx + tickOutR * Math.cos(toRad(tickDeg)), y: cy + tickOutR * Math.sin(toRad(tickDeg)) };
          return (
            <line
              key={i}
              x1={inner.x.toFixed(2)} y1={inner.y.toFixed(2)}
              x2={outer.x.toFixed(2)} y2={outer.y.toFixed(2)}
              stroke={T.text4}
              strokeWidth="1.2"
              opacity="0.4"
            />
          );
        })}

        {/* Fill arc */}
        {pct > 0 && (
          <path
            d={`M ${trackStart.x.toFixed(2)} ${trackStart.y.toFixed(2)}
                A ${r} ${r} 0 ${fillLarge} 1 ${fillEnd.x.toFixed(2)} ${fillEnd.y.toFixed(2)}`}
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth={sw}
            strokeLinecap="round"
            style={{
              strokeDasharray:  ((fillArc / 360) * 2 * Math.PI * r).toFixed(2),
              strokeDashoffset: ((fillArc / 360) * 2 * Math.PI * r).toFixed(2),
              animation: 'att-gauge-fill 1.2s cubic-bezier(0.16,1,0.3,1) 0.3s forwards',
            }}
          />
        )}

        {/* Center percentage */}
        <text
          x={cx} y={cy + 8}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={pct > 0 ? 42 : 32}
          fontWeight="700"
          fill={T.text}
          letterSpacing="-2"
          style={{ fontVariantNumeric: 'tabular-nums', fontFamily: T.font }}
        >
          {pct > 0 ? `${Math.round(pct)}%` : '—'}
        </text>

        {/* Sub label */}
        <text
          x={cx} y={cy + 36}
          textAnchor="middle"
          fontSize="10"
          fontWeight="700"
          fill={T.text4}
          letterSpacing="2"
          style={{ fontFamily: T.font, textTransform: 'uppercase' }}
        >
          PRESENT
        </text>
      </svg>

      {/* Status pill — sits just below the SVG */}
      {pct > 0 && (
        <div style={{
          marginTop: -6,
          padding: '4px 14px', borderRadius: 99,
          background: gaugeColor === T.accent ? T.accentSoft
            : gaugeColor === T.amber ? T.amberSoft : T.redSoft,
          border: `1px solid ${gaugeColor}28`,
          fontSize: 12, fontWeight: 700, color: gaugeColor,
          letterSpacing: '-0.01em',
        }}>
          {statusLabel}
        </div>
      )}

      <style>{`
        @keyframes att-gauge-fill {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
};

/* ─── Subject bar — purple-themed ────────────────────────────── */
const SubjectBar = ({ subject, percent, rank }) => {
  // Use opacity/lightness variations of the accent purple
  // High % = full accent, low % = red (only below 75%)
  const isBelowMin  = percent < 75;
  const barColor    = isBelowMin ? T.red : T.accent;
  const barColorEnd = isBelowMin ? '#dc2626' : '#6d28d9';
  const textColor   = isBelowMin ? T.red : T.accent;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      {/* Subject code */}
      <div style={{
        fontSize: 12.5, fontWeight: 700, color: T.text2,
        width: 52, flexShrink: 0, letterSpacing: '-0.01em',
      }}>
        {subject}
      </div>

      {/* Bar track */}
      <div style={{
        flex: 1, height: 10, borderRadius: 99,
        background: `${barColor}14`,
        overflow: 'hidden',
        border: `1px solid ${barColor}18`,
      }}>
        <div style={{
          height: '100%',
          width: `${percent}%`,
          borderRadius: 99,
          background: `linear-gradient(90deg, ${barColor}cc, ${barColorEnd})`,
          boxShadow: `0 2px 8px ${barColor}30`,
          transition: 'width 700ms cubic-bezier(0.16,1,0.3,1)',
          transitionDelay: `${rank * 80}ms`,
        }} />
      </div>

      {/* Percent value */}
      <div style={{
        fontSize: 13, fontWeight: 700, color: textColor,
        minWidth: 42, textAlign: 'right',
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.02em',
      }}>
        {percent}%
      </div>
    </div>
  );
};

/* ─── Stat tile ──────────────────────────────────────────────── */
const StatTile = ({ value, label, color }) => (
  <div style={{ textAlign: 'center', flex: 1 }}>
    <div style={{
      fontSize: 26, fontWeight: 700, color, letterSpacing: '-0.04em',
      fontVariantNumeric: 'tabular-nums', lineHeight: 1,
    }}>
      {value}
    </div>
    <div style={{ fontSize: 11, color: T.text3, fontWeight: 600, marginTop: 5, letterSpacing: '0.01em' }}>
      {label}
    </div>
  </div>
);

const Divider = () => (
  <div style={{ width: 1, alignSelf: 'stretch', background: T.divider, margin: '0 4px' }} />
);

/* ─── Main page ──────────────────────────────────────────────── */
const StudentAttendancePage = () => {
  const { user } = useAuth();

  // No backend attendance endpoint yet — will be populated once session logging is enabled
  const att = { present: 0, total: 0, bySubject: [] };
  const overall = att.total > 0 ? Math.round((att.present / att.total) * 100) : 0;
  const hasData = att.total > 0;

  return (
    <StudentLayout
      title="My Attendance"
      subtitle="Attendance overview across all subjects"
    >
      <div style={{ padding: '0 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Info banner */}
        <div style={{
          padding: '12px 16px', borderRadius: 14,
          background: T.accentSoft, border: `1px solid ${T.accentBorder}`,
          fontSize: 12.5, color: T.accent, fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <StudentIcon name="info" size={14} />
          <span>
            <strong>Coming soon:</strong> Detailed attendance tracking will be available once your
            institution enables session logging through the platform.
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 18 }}>

          {/* ─── Left: Overall gauge ────────────────────────── */}
          <StudentCard style={{ padding: '22px 20px', alignItems: 'center' }}>
            <div style={{
              fontSize: 13, fontWeight: 700, color: T.text,
              marginBottom: 12, alignSelf: 'flex-start',
              letterSpacing: '-0.02em',
            }}>
              Overall Attendance
            </div>

            {/* Gauge — centers itself */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <AttendanceGauge percent={overall} size={220} />
            </div>

            {/* Present / Absent / Total row */}
            {hasData ? (
              <div style={{
                marginTop: 16, width: '100%',
                display: 'flex', alignItems: 'center',
                padding: '12px 8px', borderRadius: 14,
                background: T.surfaceMuted, border: `1px solid ${T.border}`,
              }}>
                <StatTile value={att.present}           label="Present" color={T.accent} />
                <Divider />
                <StatTile value={att.total - att.present} label="Absent"  color={T.red}    />
                <Divider />
                <StatTile value={att.total}             label="Total"   color={T.text}   />
              </div>
            ) : (
              <div style={{
                marginTop: 16, width: '100%',
                padding: '12px', borderRadius: 12,
                background: T.surfaceMuted, border: `1px solid ${T.border}`,
                textAlign: 'center', fontSize: 12, color: T.text3, fontWeight: 500,
              }}>
                No attendance data yet
              </div>
            )}
          </StudentCard>

          {/* ─── Right: Subject-wise bars ───────────────────── */}
          <StudentCard style={{ padding: '22px 24px' }}>
            <div style={{
              fontSize: 13, fontWeight: 700, color: T.text,
              marginBottom: 20, letterSpacing: '-0.02em',
            }}>
              Subject-wise Attendance
            </div>

            {!hasData || att.bySubject.length === 0 ? (
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '40px 20px', gap: 12,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: T.accentSoft, color: T.accent,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <StudentIcon name="progress" size={22} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text2, letterSpacing: '-0.02em' }}>
                  No subject data yet
                </div>
                <div style={{ fontSize: 12, color: T.text3, fontWeight: 500, textAlign: 'center', maxWidth: 280 }}>
                  Subject-wise attendance will appear here once your teachers start logging sessions.
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {att.bySubject.map((s, i) => (
                    <SubjectBar key={i} subject={s.subject} percent={s.percent} rank={i} />
                  ))}
                </div>

                {/* Threshold reminder */}
                <div style={{
                  marginTop: 24, padding: '12px 16px', borderRadius: 12,
                  background: overall < 75 ? T.redSoft : overall < 85 ? T.amberSoft : T.accentSoft,
                  border: `1px solid ${overall < 75 ? T.red : overall < 85 ? T.amber : T.accent}28`,
                  fontSize: 12.5, fontWeight: 500,
                  color: overall < 75 ? T.red : overall < 85 ? T.amber : T.accent,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <StudentIcon name="alert" size={13} />
                  {overall >= 85
                    ? 'Your attendance is above the 75% minimum threshold. Keep it up!'
                    : overall >= 75
                      ? `You need ${Math.ceil((0.75 * att.total - att.present) / (1 - 0.75))} more classes to stay above the 75% threshold.`
                      : 'Your attendance is below the 75% minimum. Please contact your advisor.'}
                </div>
              </>
            )}
          </StudentCard>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentAttendancePage;
