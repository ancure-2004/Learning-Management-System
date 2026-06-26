import { theme } from '@/theme';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useStudentTimetable } from '@/hooks/queries';
import Sidebar, { ActionButton, useHistoryNav, useSidebarState } from '@/layouts/Sidebar';
import { STUDENT_NAV } from '@/layouts/StudentLayout';
import I from '@/components/Icon';

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS — identical to StudentDashboard / AdminLayout
   ═══════════════════════════════════════════════════════════════ */
const T = theme;

const TOPBAR_H = 64;

const GLOBAL = `
@keyframes st-fade-up {
  from { opacity:0; transform:translateY(8px); }
  to   { opacity:1; transform:translateY(0); }
}
.st-page *::-webkit-scrollbar { width:6px; height:6px; }
.st-page *::-webkit-scrollbar-track { background:transparent; }
.st-page *::-webkit-scrollbar-thumb { background:rgba(15,23,42,0.10); border-radius:3px; }
.st-page *::-webkit-scrollbar-thumb:hover { background:rgba(15,23,42,0.18); }
.st-day-cell { transition: background 180ms ease; }
.st-day-cell:hover { background: rgba(124,58,237,0.025) !important; }
`;

/* ═══════════════════════════════════════════════════════════════
   ICON — shared component via @/components/Icon
   ═══════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════
   STUDENT NAV
   ═══════════════════════════════════════════════════════════════ */
/* Student NAV — imported from StudentLayout (single source of truth) */
const NAV = STUDENT_NAV;

/* ═══════════════════════════════════════════════════════════════
   TOP BAR
   ═══════════════════════════════════════════════════════════════ */
const TopBar = ({ collapsed, onToggleSidebar }) => {
  const { canBack, canForward, goBack, goForward } = useHistoryNav();
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50,
      height: TOPBAR_H,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 22px',
      background: 'rgba(238,240,245,0.72)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderBottom: '1px solid rgba(15,23,42,0.04)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 3,
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: 14, padding: '7px 9px',
        boxShadow: '0 4px 14px rgba(15,23,42,0.08), 0 1px 0 rgba(255,255,255,0.7) inset',
      }}>
        <ActionButton icon="sidebar"  label={collapsed ? 'Expand' : 'Collapse'} onClick={onToggleSidebar} />
        <ActionButton icon="back"     label="Back"    onClick={goBack}    disabled={!canBack} />
        <ActionButton icon="forward"  label="Forward" onClick={goForward} disabled={!canForward} />
      </div>
      <button style={{
        width: 44, height: 44, borderRadius: 14,
        background: T.surface, border: `1px solid ${T.border}`,
        boxShadow: '0 4px 14px rgba(15,23,42,0.08), 0 1px 0 rgba(255,255,255,0.7) inset',
        cursor: 'pointer', color: T.text2, position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'transform 200ms ease', fontFamily: 'inherit',
      }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <I name="bell" size={20} />
        <span style={{ position: 'absolute', top: 10, right: 11, width: 8, height: 8, borderRadius: '50%', background: T.red, border: `2px solid ${T.surface}` }} />
      </button>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SLOT CELL
   ═══════════════════════════════════════════════════════════════ */
const SlotCell = ({ entry }) => {
  if (!entry) {
    return (
      <div style={{
        height: '100%', minHeight: 70,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: T.text4, fontSize: 11.5, fontWeight: 500,
      }}>—</div>
    );
  }

  const isEvent   = Boolean(entry.event);
  const isHoliday = isEvent && entry.event.toLowerCase().includes('holiday');

  if (isEvent) {
    return (
      <div style={{
        margin: '6px 4px', padding: '8px 10px', borderRadius: 9,
        background: isHoliday ? T.redSoft : T.amberSoft,
        color: isHoliday ? T.red : T.amber,
        fontSize: 11.5, fontWeight: 600, textAlign: 'center',
        border: `1px solid ${isHoliday ? T.red : T.amber}28`,
      }}>
        {entry.event}
      </div>
    );
  }

  return (
    <div style={{
      margin: '6px 4px', padding: '8px 10px', borderRadius: 10,
      background: T.accentSoft,
      border: `1px solid ${T.accentBorder}`,
    }}>
      <div style={{
        fontSize: 12.5, fontWeight: 700, color: T.accent,
        letterSpacing: '-0.025em',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {entry.subject}
      </div>
      <div style={{
        fontSize: 10.5, color: T.text3, marginTop: 3,
        fontWeight: 500,
        display: 'flex', alignItems: 'center', gap: 4,
      }}>
        <I name="teacher" size={10} /> {entry.teacher}
      </div>
      <div style={{
        fontSize: 10.5, color: T.text3, marginTop: 2,
        fontWeight: 500,
        display: 'flex', alignItems: 'center', gap: 4,
      }}>
        <I name="room" size={10} /> {entry.classroom}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   TIMETABLE GRID
   ═══════════════════════════════════════════════════════════════ */
const DAY_NAMES  = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const SLOT_TIMES = ['09:00–10:00','10:00–11:00','11:00–12:00','12:00–13:00','13:00–14:00','14:00–15:00','15:00–16:00','16:00–17:00'];

const TimetableGrid = ({ schedule }) => (
  <div style={{ overflowX: 'auto' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700, fontSize: 12, fontFamily: T.font }}>
      <thead>
        <tr>
          <th style={{
            padding: '10px 14px', textAlign: 'left',
            fontSize: 10.5, fontWeight: 700, color: T.text3,
            textTransform: 'uppercase', letterSpacing: '0.07em',
            borderBottom: `2px solid ${T.divider}`,
            background: T.surfaceMuted, width: 110,
          }}>Time</th>
          {DAY_NAMES.map(d => (
            <th key={d} style={{
              padding: '10px 14px', textAlign: 'center',
              fontSize: 10.5, fontWeight: 700, color: T.text3,
              textTransform: 'uppercase', letterSpacing: '0.07em',
              borderBottom: `2px solid ${T.divider}`,
              background: T.surfaceMuted,
              borderLeft: `1px solid ${T.divider}`,
            }}>{d}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {SLOT_TIMES.map((time, si) => (
          <tr key={si} style={{ borderBottom: `1px solid ${T.divider}` }}>
            <td style={{
              padding: '8px 14px', background: T.surfaceMuted,
              borderRight: `1px solid ${T.divider}`, verticalAlign: 'middle',
            }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: T.text2, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>
                {time.split('–')[0]}
              </div>
              <div style={{ fontSize: 10, color: T.text4, fontWeight: 500, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
                {time.split('–')[1]}
              </div>
            </td>
            {schedule.map((daySchedule, di) => {
              const entry = daySchedule[si];
              const isArray = Array.isArray(entry);
              const entries = isArray ? entry : (entry ? [entry] : []);
              return (
                <td key={di} className="st-day-cell" style={{
                  verticalAlign: 'top',
                  borderLeft: `1px solid ${T.divider}`,
                  minWidth: 130,
                }}>
                  {entries.length > 0
                    ? entries.map((e, i) => <SlotCell key={i} entry={e} />)
                    : <SlotCell entry={null} />
                  }
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const StudentTimetable = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { collapsed, toggleCollapsed } = useSidebarState();

  const { data: timetable, isLoading: loading, error: queryError } =
    useStudentTimetable(user?._id);
  const error = queryError ? (queryError.message || 'Failed to load your timetable') : '';

  const handleLogout = () => { logout(); navigate('/login'); };

  /* Build schedule — timetable.schedule is [5][8][entries] */
  const schedule = React.useMemo(() => {
    if (!timetable?.schedule) return null;
    return timetable.schedule;
  }, [timetable]);

  const renderIcon = (name, size) => <I name={name} size={size} />;

  if (loading) {
    return (
      <div className="st-page" style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: T.bg, fontFamily: T.font,
      }}>
        <style>{GLOBAL}</style>
        <div style={{ textAlign: 'center', color: T.text3 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, margin: '0 auto 14px',
            background: T.accentSoft, color: T.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <I name="timetable" size={22} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.text2 }}>Loading timetable…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="st-page chronos" style={{
      position: 'relative', display: 'flex',
      height: '100vh', overflow: 'hidden',
      background: T.bg, color: T.text,
      fontFamily: T.font,
      fontFeatureSettings: '"tnum" 1,"ss01" 1,"ss02" 1,"calt" 1',
      textRendering: 'optimizeLegibility',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      letterSpacing: '-0.005em',
    }}>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL }} />

      {/* SIDEBAR */}
      <div style={{ marginTop: TOPBAR_H, height: `calc(100vh - ${TOPBAR_H}px)`, flexShrink: 0 }}>
        <Sidebar
          user={user}
          onLogout={handleLogout}
          onNavigate={navigate}
          currentPath="/student-timetable"
          navConfig={NAV}
          iconRenderer={renderIcon}
          collapsed={collapsed}
          onToggleCollapse={toggleCollapsed}
        />
      </div>

      {/* MAIN */}
      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', overflowX: 'hidden', background: T.bg, position: 'relative' }}>
        <div style={{ height: TOPBAR_H }} />
        <div style={{ maxWidth: 1480, margin: '0 auto', padding: '20px 24px 40px' }}>

          {/* PAGE HEADER */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 22, flexWrap: 'wrap', gap: 12,
            animation: 'st-fade-up 500ms cubic-bezier(0.16,1,0.3,1) both',
          }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: T.text, margin: 0, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                My Timetable
              </h1>
              <div style={{ fontSize: 13, color: T.text3, marginTop: 5, fontWeight: 500 }}>
                {timetable?.class?.name || user.className || 'Class'} · Semester {timetable?.semester || '—'}
              </div>
            </div>

            {/* Quick info pills */}
            {timetable && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { label: timetable.class?.name || 'Class',     color: T.accent },
                  { label: `Sem ${timetable.semester}`,          color: T.blue },
                  { label: timetable.academicYear || new Date().getFullYear(), color: T.green },
                ].map((p, i) => (
                  <span key={i} style={{
                    display: 'inline-flex', alignItems: 'center',
                    padding: '5px 12px', borderRadius: 99,
                    background: `${p.color}14`,
                    border: `1px solid ${p.color}28`,
                    fontSize: 12, fontWeight: 700, color: p.color,
                    letterSpacing: '-0.01em',
                  }}>
                    {p.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ERROR */}
          {error && (
            <div style={{
              background: T.surface, border: `1px solid ${T.divider}`,
              borderRadius: 20, padding: '50px 24px', textAlign: 'center',
              boxShadow: T.shadowCard,
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, margin: '0 auto 14px',
                background: T.redSoft, color: T.red,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <I name="alert" size={24} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 6, letterSpacing: '-0.03em' }}>{error}</div>
              <div style={{ fontSize: 13, color: T.text3, fontWeight: 500, marginBottom: 20 }}>
                No timetable is available yet. Please contact your administrator.
              </div>
              <button onClick={() => navigate('/student-dashboard')} style={{
                padding: '10px 20px', borderRadius: 10,
                background: `linear-gradient(135deg,${T.accent2} 0%,${T.accent} 60%,#6d28d9 100%)`,
                border: 'none', color: '#fff',
                fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: T.font,
                boxShadow: '0 4px 12px -2px rgba(124,58,237,0.30)',
              }}>
                Back to Dashboard
              </button>
            </div>
          )}

          {/* TIMETABLE */}
          {!error && timetable && schedule && (
            <div style={{
              background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 20, overflow: 'hidden', boxShadow: T.shadowCard,
              animation: 'st-fade-up 400ms cubic-bezier(0.16,1,0.3,1) both',
            }}>
              {/* Card header */}
              <div style={{
                padding: '18px 22px',
                background: `linear-gradient(135deg, ${T.accentSoft}, ${T.blueSoft})`,
                borderBottom: `1px solid ${T.border}`,
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: T.accent, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(124,58,237,0.30)', flexShrink: 0,
                }}>
                  <I name="timetable" size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.text, letterSpacing: '-0.03em' }}>
                    Weekly Schedule
                  </div>
                  <div style={{ fontSize: 12, color: T.text3, marginTop: 3, fontWeight: 500 }}>
                    {timetable.class?.name} · Academic Year {timetable.academicYear || new Date().getFullYear()}
                  </div>
                </div>
              </div>

              <TimetableGrid schedule={schedule} />

              {/* Legend */}
              <div style={{
                padding: '14px 22px',
                borderTop: `1px solid ${T.divider}`,
                background: T.surfaceMuted,
                display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
              }}>
                {[
                  { color: T.accent, bg: T.accentSoft, label: 'Class' },
                  { color: T.red,    bg: T.redSoft,    label: 'Holiday' },
                  { color: T.amber,  bg: T.amberSoft,  label: 'Event' },
                ].map(l => (
                  <span key={l.label} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    fontSize: 11.5, fontWeight: 600, color: T.text3,
                  }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: l.bg, border: `1.5px solid ${l.color}40` }} />
                    {l.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* EMPTY */}
          {!error && !timetable && (
            <div style={{
              background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 20, padding: '60px 24px', textAlign: 'center',
              boxShadow: T.shadowCard, animation: 'st-fade-up 400ms ease both',
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, margin: '0 auto 14px',
                background: T.accentSoft, color: T.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <I name="timetable" size={24} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 6, letterSpacing: '-0.03em' }}>
                No Timetable Available
              </div>
              <div style={{ fontSize: 13, color: T.text3, fontWeight: 500, marginBottom: 20 }}>
                Your class timetable hasn't been published yet.
              </div>
              <button onClick={() => navigate('/student-dashboard')} style={{
                padding: '10px 20px', borderRadius: 10,
                background: `linear-gradient(135deg,${T.accent2} 0%,${T.accent} 60%,#6d28d9 100%)`,
                border: 'none', color: '#fff',
                fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: T.font,
                boxShadow: '0 4px 12px -2px rgba(124,58,237,0.30)',
              }}>
                Back to Dashboard
              </button>
            </div>
          )}

        </div>
      </main>

      <TopBar collapsed={collapsed} onToggleSidebar={toggleCollapsed} />
    </div>
  );
};

export default StudentTimetable;
