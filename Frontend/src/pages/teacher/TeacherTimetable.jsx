import { theme } from '@/theme';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTeacherTimetable } from '@/hooks/queries';
import Sidebar, { ActionButton, useHistoryNav, useSidebarState } from '@/layouts/Sidebar';
import { TEACHER_NAV } from '@/layouts/TeacherLayout';
import I from '@/components/Icon';

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS — identical to TeacherDashboard / AdminLayout
   ═══════════════════════════════════════════════════════════════ */
const T = theme;

const TOPBAR_H = 64;

const GLOBAL = `
@keyframes ch-fade-up {
  from { opacity:0; transform:translateY(8px); }
  to   { opacity:1; transform:translateY(0); }
}
.ch-tt *::-webkit-scrollbar { width:6px; height:6px; }
.ch-tt *::-webkit-scrollbar-track { background:transparent; }
.ch-tt *::-webkit-scrollbar-thumb { background:rgba(15,23,42,0.10); border-radius:3px; }
.ch-tt *::-webkit-scrollbar-thumb:hover { background:rgba(15,23,42,0.18); }
.ch-cell-btn { transition: background 180ms ease; }
.ch-cell-btn:hover { background: ${T.accentSoft} !important; }
.ch-tab-btn  { transition: all 200ms cubic-bezier(0.4,0,0.2,1); }
.ch-seg-opt  { transition: all 200ms cubic-bezier(0.4,0,0.2,1); }
`;

/* ═══════════════════════════════════════════════════════════════
   ICON — shared component via @/components/Icon
   ═══════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════
   TEACHER NAV
   ═══════════════════════════════════════════════════════════════ */
/* Teacher NAV — imported from TeacherLayout (single source of truth) */
const NAV = TEACHER_NAV;

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
        boxShadow: '0 4px 14px rgba(15,23,42,0.08), 0 1px 3px rgba(15,23,42,0.06), 0 1px 0 rgba(255,255,255,0.7) inset',
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
        transition: 'transform 200ms ease, box-shadow 200ms ease', fontFamily: 'inherit',
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 22px rgba(15,23,42,0.14), 0 1px 0 rgba(255,255,255,0.7) inset'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = '0 4px 14px rgba(15,23,42,0.08), 0 1px 0 rgba(255,255,255,0.7) inset'; }}
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
const SlotCell = ({ entries }) => {
  if (!entries || entries.length === 0) {
    return (
      <div style={{
        height: '100%', minHeight: 70,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: T.text4, fontSize: 11.5, fontWeight: 500,
        letterSpacing: '-0.005em',
      }}>
        —
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '6px 4px' }}>
      {entries.map((entry, i) => {
        const isEvent = Boolean(entry.event);
        const isHoliday = isEvent && entry.event.toLowerCase().includes('holiday');

        if (isEvent) {
          return (
            <div key={i} style={{
              padding: '7px 10px', borderRadius: 9,
              background: isHoliday ? T.redSoft : T.amberSoft,
              color: isHoliday ? T.red : T.amber,
              border: `1px solid ${isHoliday ? T.red : T.amber}28`,
              fontSize: 11.5, fontWeight: 600, textAlign: 'center',
              letterSpacing: '-0.005em',
            }}>
              {entry.event}
            </div>
          );
        }

        return (
          <div key={i} className="ch-cell-btn" style={{
            padding: '8px 10px', borderRadius: 10,
            background: T.accentSoft,
            border: `1px solid ${T.accentBorder}`,
            cursor: 'default',
          }}>
            <div style={{
              fontSize: 12.5, fontWeight: 700, color: T.accent,
              letterSpacing: '-0.025em',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {entry.subject}
            </div>
            {entry.className && (
              <div style={{
                fontSize: 10.5, color: T.accent2, marginTop: 3,
                fontWeight: 600, letterSpacing: '-0.005em',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <I name="class" size={10} /> {entry.className}
              </div>
            )}
            <div style={{
              fontSize: 10.5, color: T.text3, marginTop: 2,
              fontWeight: 500, letterSpacing: '-0.005em',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <I name="room" size={10} /> {entry.classroom}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   FREE SLOT CELL (individual view)
   ═══════════════════════════════════════════════════════════════ */
const SingleSlotCell = ({ entry }) => {
  if (!entry) {
    return (
      <div style={{
        height: '100%', minHeight: 70,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: T.text4, fontSize: 11.5, fontWeight: 500,
      }}>—</div>
    );
  }

  const isEvent = Boolean(entry.event);
  const isHoliday = isEvent && entry.event.toLowerCase().includes('holiday');

  if (isEvent) {
    return (
      <div style={{
        margin: '6px 4px', padding: '8px 10px', borderRadius: 9,
        background: isHoliday ? T.redSoft : T.amberSoft,
        color: isHoliday ? T.red : T.amber,
        fontSize: 11.5, fontWeight: 600, textAlign: 'center',
      }}>
        {entry.event}
      </div>
    );
  }

  return (
    <div style={{
      margin: '6px 4px', padding: '8px 10px', borderRadius: 10,
      background: T.greenSoft,
      border: `1px solid ${T.green}30`,
    }}>
      <div style={{
        fontSize: 12.5, fontWeight: 700, color: T.green,
        letterSpacing: '-0.025em',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {entry.subject}
      </div>
      <div style={{
        fontSize: 10.5, color: T.text3, marginTop: 3,
        fontWeight: 500, letterSpacing: '-0.005em',
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

const TimetableGrid = ({ schedule, mode }) => (
  <div style={{ overflowX: 'auto' }}>
    <table style={{
      width: '100%', borderCollapse: 'collapse', minWidth: 700,
      fontSize: 12, fontFamily: T.font,
    }}>
      <thead>
        <tr>
          <th style={{
            padding: '10px 14px', textAlign: 'left',
            fontSize: 10.5, fontWeight: 700, color: T.text3,
            textTransform: 'uppercase', letterSpacing: '0.07em',
            borderBottom: `2px solid ${T.divider}`,
            background: T.surfaceMuted,
            borderRadius: '12px 0 0 0',
            width: 110, flexShrink: 0,
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
        {SLOT_TIMES.map((time, slotIdx) => (
          <tr key={slotIdx} style={{ borderBottom: `1px solid ${T.divider}` }}>
            <td style={{
              padding: '8px 14px',
              background: T.surfaceMuted,
              borderRight: `1px solid ${T.divider}`,
              verticalAlign: 'middle',
            }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: T.text2, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>
                {time.split('–')[0]}
              </div>
              <div style={{ fontSize: 10, color: T.text4, fontWeight: 500, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
                {time.split('–')[1]}
              </div>
            </td>
            {schedule.map((daySchedule, dayIdx) => {
              const cell = mode === 'combined' ? daySchedule[slotIdx] : daySchedule[slotIdx];
              return (
                <td key={dayIdx} style={{
                  verticalAlign: 'top',
                  borderLeft: `1px solid ${T.divider}`,
                  minWidth: 130,
                  transition: 'background 180ms ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.02)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  {mode === 'combined'
                    ? <SlotCell entries={Array.isArray(cell) ? cell : (cell ? [cell] : [])} />
                    : <SingleSlotCell entry={cell} />
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
const TeacherTimetable = () => {
  const [viewMode, setViewMode] = useState('combined');
  const [selectedClass, setSelectedClass] = useState(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { collapsed, toggleCollapsed } = useSidebarState();

  const { data: timetableData, isLoading: loading, error: queryError } =
    useTeacherTimetable(user?._id);
  const error = queryError ? (queryError.message || 'Failed to load your timetable') : '';

  const handleLogout = () => { logout(); navigate('/login'); };

  // Default the single-class view to the first class once data arrives.
  useEffect(() => {
    if (timetableData?.timetables?.length > 0) {
      setSelectedClass(prev => prev || timetableData.timetables[0]);
    }
  }, [timetableData]);

  /* Build combined weekly view */
  const combinedSchedule = React.useMemo(() => {
    if (!timetableData?.timetables) return [];
    const teacherName = `${user.firstName} ${user.lastName}`;
    const grid = Array.from({ length: 5 }, () => Array.from({ length: 8 }, () => []));
    timetableData.timetables.forEach(tt => {
      if (!tt?.schedule) return;
      for (let d = 0; d < 5; d++) {
        for (let s = 0; s < 8; s++) {
          const slot = tt.schedule[d][s];
          const entries = slot?.filter(e => e.teacher === teacherName) || [];
          entries.forEach(e => grid[d][s].push({ ...e, className: tt.class?.name || '' }));
        }
      }
    });
    return grid;
  }, [timetableData, user]);

  /* Build single-class view */
  const singleSchedule = React.useMemo(() => {
    if (!selectedClass?.schedule) return Array.from({ length: 5 }, () => Array(8).fill(null));
    const teacherName = `${user.firstName} ${user.lastName}`;
    return Array.from({ length: 5 }, (_, d) =>
      Array.from({ length: 8 }, (__, s) => {
        const slot = selectedClass.schedule[d][s];
        return slot?.find(e => e.teacher === teacherName) || null;
      })
    );
  }, [selectedClass, user]);

  const renderIcon = (name, size) => <I name={name} size={size} />;

  /* ─── Skeleton / Error states ─── */
  if (loading) {
    return (
      <div className="ch-tt chronos" style={{
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
          <div style={{ fontSize: 14, fontWeight: 600, color: T.text2 }}>Loading schedule…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ch-tt chronos" style={{
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
          currentPath="/teacher-timetable"
          navConfig={NAV}
          iconRenderer={renderIcon}
          collapsed={collapsed}
          onToggleCollapse={toggleCollapsed}
        />
      </div>

      {/* MAIN */}
      <main style={{
        flex: 1, minWidth: 0, overflowY: 'auto', overflowX: 'hidden',
        background: T.bg, position: 'relative',
      }}>
        <div style={{ height: TOPBAR_H }} />
        <div style={{ maxWidth: 1480, margin: '0 auto', padding: '20px 24px 40px' }}>

          {/* PAGE HEADER */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 22, gap: 16, flexWrap: 'wrap',
            animation: 'ch-fade-up 500ms cubic-bezier(0.16,1,0.3,1) both',
          }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: T.text, margin: 0, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                My Schedule
              </h1>
              <div style={{ fontSize: 13, color: T.text3, marginTop: 5, fontWeight: 500 }}>
                {user.firstName} {user.lastName} · {timetableData?.timetables?.length ?? 0} class{(timetableData?.timetables?.length ?? 0) !== 1 ? 'es' : ''} assigned
              </div>
            </div>

            {/* View toggle */}
            {timetableData?.timetables?.length > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 2,
                background: T.surfaceMuted, border: `1px solid ${T.border}`,
                borderRadius: 12, padding: 4,
              }}>
                {[
                  { id: 'combined',   label: 'Weekly View' },
                  { id: 'individual', label: 'Class View' },
                ].map(opt => {
                  const isActive = viewMode === opt.id;
                  return (
                    <button key={opt.id} className="ch-seg-opt"
                      onClick={() => setViewMode(opt.id)}
                      style={{
                        padding: '8px 16px', borderRadius: 9,
                        border: 'none', cursor: 'pointer',
                        background: isActive ? T.surface : 'transparent',
                        color: isActive ? T.text : T.text3,
                        fontSize: 12.5, fontWeight: isActive ? 700 : 500,
                        fontFamily: T.font,
                        boxShadow: isActive ? T.shadowCard : 'none',
                      }}>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ERROR */}
          {error && (
            <div style={{
              background: T.surface, border: `1px solid ${T.redSoft}`,
              borderRadius: 20, padding: '40px 24px',
              textAlign: 'center',
              boxShadow: T.shadowCard,
              animation: 'ch-fade-up 400ms ease both',
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, margin: '0 auto 14px',
                background: T.redSoft, color: T.red,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <I name="alert" size={24} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 8, letterSpacing: '-0.03em' }}>{error}</div>
              <div style={{ fontSize: 13, color: T.text3, fontWeight: 500, marginBottom: 20 }}>
                No timetables published yet. Contact your administrator.
              </div>
              <button onClick={() => navigate('/teacher-dashboard')} style={{
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

          {/* CONTENT */}
          {!error && timetableData && (
            <>
              {/* COMBINED VIEW */}
              {viewMode === 'combined' && (
                <div style={{
                  background: T.surface, border: `1px solid ${T.border}`,
                  borderRadius: 20, overflow: 'hidden', boxShadow: T.shadowCard,
                  animation: 'ch-fade-up 400ms cubic-bezier(0.16,1,0.3,1) both',
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
                      boxShadow: '0 4px 12px rgba(124,58,237,0.30)',
                      flexShrink: 0,
                    }}>
                      <I name="timetable" size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: T.text, letterSpacing: '-0.03em' }}>
                        Complete Weekly Schedule
                      </div>
                      <div style={{ fontSize: 12, color: T.text3, marginTop: 3, fontWeight: 500 }}>
                        All your classes across all sections
                      </div>
                    </div>
                  </div>

                  {/* Grid */}
                  <div style={{ padding: 0 }}>
                    <TimetableGrid schedule={combinedSchedule} mode="combined" />
                  </div>

                  {/* Legend */}
                  <div style={{
                    padding: '14px 22px',
                    borderTop: `1px solid ${T.divider}`,
                    background: T.surfaceMuted,
                    display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
                  }}>
                    {[
                      { color: T.accent, bg: T.accentSoft, label: 'Class Slot' },
                      { color: T.red,    bg: T.redSoft,    label: 'Holiday' },
                      { color: T.amber,  bg: T.amberSoft,  label: 'Event' },
                    ].map(l => (
                      <span key={l.label} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 7,
                        fontSize: 11.5, fontWeight: 600, color: T.text3,
                        letterSpacing: '-0.005em',
                      }}>
                        <span style={{
                          width: 10, height: 10, borderRadius: 3,
                          background: l.bg, border: `1.5px solid ${l.color}40`,
                        }} />
                        {l.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* INDIVIDUAL (class-wise) VIEW */}
              {viewMode === 'individual' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Class selector */}
                  <div style={{
                    background: T.surface, border: `1px solid ${T.border}`,
                    borderRadius: 20, padding: '18px 22px',
                    boxShadow: T.shadowCard,
                    animation: 'ch-fade-up 300ms ease both',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.text2, marginBottom: 10 }}>
                      Select class to view
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {timetableData.timetables.map(tt => {
                        const isActive = selectedClass?._id === tt._id;
                        return (
                          <button
                            key={tt._id}
                            className="ch-tab-btn"
                            onClick={() => setSelectedClass(tt)}
                            style={{
                              padding: '8px 16px', borderRadius: 10,
                              border: `1.5px solid ${isActive ? T.accent : T.border}`,
                              background: isActive ? T.accentSoft : T.surfaceMuted,
                              color: isActive ? T.accent : T.text2,
                              fontSize: 12.5, fontWeight: isActive ? 700 : 600,
                              cursor: 'pointer', fontFamily: T.font,
                              boxShadow: isActive ? `0 0 0 3px ${T.accentSoft}` : 'none',
                            }}>
                            {tt.class?.name || 'Class'} · Sem {tt.semester}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Individual timetable */}
                  {selectedClass && (
                    <div style={{
                      background: T.surface, border: `1px solid ${T.border}`,
                      borderRadius: 20, overflow: 'hidden', boxShadow: T.shadowCard,
                      animation: 'ch-fade-up 350ms cubic-bezier(0.16,1,0.3,1) both',
                    }}>
                      <div style={{
                        padding: '18px 22px',
                        background: `linear-gradient(135deg, ${T.greenSoft}, ${T.blueSoft})`,
                        borderBottom: `1px solid ${T.border}`,
                        display: 'flex', alignItems: 'center', gap: 14,
                      }}>
                        <div style={{
                          width: 42, height: 42, borderRadius: 12,
                          background: T.green, color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 4px 12px rgba(16,185,129,0.30)',
                          flexShrink: 0,
                        }}>
                          <I name="class" size={20} />
                        </div>
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: T.text, letterSpacing: '-0.03em' }}>
                            {selectedClass.class?.name || 'Class'} — Semester {selectedClass.semester}
                          </div>
                          <div style={{ fontSize: 12, color: T.text3, marginTop: 3, fontWeight: 500 }}>
                            Your teaching slots for this class only
                          </div>
                        </div>
                      </div>

                      <TimetableGrid schedule={singleSchedule} mode="individual" />
                    </div>
                  )}
                </div>
              )}

              {/* EMPTY — no timetables */}
              {timetableData.timetables.length === 0 && (
                <div style={{
                  background: T.surface, border: `1px solid ${T.border}`,
                  borderRadius: 20, padding: '60px 24px',
                  textAlign: 'center', boxShadow: T.shadowCard,
                  animation: 'ch-fade-up 400ms ease both',
                }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14, margin: '0 auto 14px',
                    background: T.accentSoft, color: T.accent,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <I name="timetable" size={24} />
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 6, letterSpacing: '-0.03em' }}>
                    No Teaching Schedule Yet
                  </div>
                  <div style={{ fontSize: 13, color: T.text3, fontWeight: 500, marginBottom: 20 }}>
                    You haven't been assigned to any classes, or timetables haven't been published.
                  </div>
                  <button onClick={() => navigate('/teacher-dashboard')} style={{
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
            </>
          )}
        </div>
      </main>

      <TopBar collapsed={collapsed} onToggleSidebar={toggleCollapsed} />
    </div>
  );
};

export default TeacherTimetable;
