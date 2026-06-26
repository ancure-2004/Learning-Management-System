import React, { useState, useMemo } from 'react';
import { theme as T } from '@/theme';
import I from '@/components/Icon';
import { Card, CardTitle, FilterPill, Gauge } from './ui';

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   TODAY'S TIMETABLE â€” vertical timeline of class periods
   Each row shows time bracket + subject + meta + status pill.
   "Current" period gets an animated pulse ring on its time tile.
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export const TodaysTimetableCard = ({ classes }) => {
  const statusStyles = {
    completed: { bg: T.surfaceMuted, fg: T.text3, label: 'Done',     dot: T.text4 },
    current:   { bg: T.accentSoft,   fg: T.accent, label: 'Now',      dot: T.accent },
    upcoming:  { bg: T.blueSoft,     fg: T.blue,   label: 'Upcoming', dot: T.blue },
  };

  return (
    <Card style={{ flex: 1, overflow: 'hidden' }}>
      <CardTitle right={<FilterPill label="Today" />}>Today's Timetable</CardTitle>
      <div style={{
        flex: 1, overflowY: 'auto', display: 'flex',
        flexDirection: 'column', gap: 6,
      }}>
        {classes.length === 0 ? (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            color: T.text3, gap: 10, padding: '20px',
          }}>
            <I name="check" size={28} />
            <div style={{ fontSize: 13, fontWeight: 500 }}>No classes today</div>
          </div>
        ) : classes.map((c, i) => {
          const s = statusStyles[c.status] || statusStyles.upcoming;
          const isCurrent = c.status === 'current';
          return (
            <button key={i} className="ch-row-btn" style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px',
              borderRadius: 14,
              background: isCurrent ? T.accentSoft + '70' : 'transparent',
              border: `1px solid ${isCurrent ? T.accentBorder + '50' : 'transparent'}`,
              cursor: 'pointer',
              textAlign: 'left', fontFamily: 'inherit',
              opacity: c.status === 'completed' ? 0.62 : 1,
              width: '100%',
            }}>
              {/* Time tile â€” compact */}
              <div style={{
                position: 'relative',
                width: 58, flexShrink: 0,
                background: s.bg, color: s.fg,
                borderRadius: 11, padding: '7px 4px',
                textAlign: 'center',
                border: `1px solid ${s.fg}22`,
                boxShadow: isCurrent
                  ? `0 4px 12px ${T.accent}33, 0 1px 0 rgba(255,255,255,0.6) inset`
                  : `0 2px 6px ${s.fg}14, 0 1px 0 rgba(255,255,255,0.5) inset`,
              }}>
                {isCurrent && <span className="ch-pulse-ring" />}
                <div style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                  {c.time}
                </div>
                <div style={{ fontSize: 9, fontWeight: 600, marginTop: 3, opacity: 0.75 }}>
                  {c.endTime}
                </div>
              </div>

              {/* Subject + meta â€” give this all remaining space */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13.5, fontWeight: 600, color: T.text,
                  letterSpacing: '-0.02em',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  textDecoration: c.status === 'completed' ? 'line-through' : 'none',
                  textDecorationColor: T.text4,
                  marginBottom: 3,
                }}>
                  {c.subject}
                </div>
                <div style={{
                  fontSize: 11, color: T.text3, fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
                }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 110 }}>
                    <I name="teacher" size={10} /> {c.teacher}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                    <I name="room" size={10} /> {c.room}
                  </span>
                </div>
              </div>

              {/* Status pill â€” compact */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '4px 8px', borderRadius: 99,
                background: s.bg, color: s.fg,
                fontSize: 10, fontWeight: 700,
                border: `1px solid ${s.fg}22`,
                flexShrink: 0, whiteSpace: 'nowrap',
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot }} />
                {s.label}
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   PENDING ASSESSMENTS â€” list with severity, type, due date
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const severityConfig = {
  critical: { bg: T.redSoft,   fg: T.red,    border: T.red    + '38' },
  warning:  { bg: T.amberSoft, fg: T.amber,  border: T.amber  + '38' },
  normal:   { bg: T.blueSoft,  fg: T.blue,   border: T.blue   + '38' },
};

export const PendingAssessmentsCard = ({ assessments }) => (
  <Card style={{ flex: 1, overflow: 'hidden' }}>
    <CardTitle right={
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '4px 9px', borderRadius: 99,
        background: T.amberSoft, color: T.amber,
        fontSize: 11, fontWeight: 700, letterSpacing: '-0.005em',
        border: `1px solid ${T.amber}38`,
      }}>
        {assessments.length} pending
      </span>
    }>Pending Assessments</CardTitle>

    <div style={{
      flex: 1, overflowY: 'auto', display: 'flex',
      flexDirection: 'column', gap: 4,
    }}>
      {assessments.length === 0 ? (
        <div style={{
          padding: '40px 20px', textAlign: 'center',
          color: T.text3, fontSize: 13, fontWeight: 500,
        }}>All clear Â· no pending work</div>
      ) : assessments.map((a, i) => {
        const colors = severityConfig[a.severity] || severityConfig.normal;
        return (
          <button key={i} className="ch-row-btn" style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '11px 12px', borderRadius: 14,
            background: 'transparent', border: 'none',
            cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
          }}>
            {/* Type icon tile */}
            <div style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              background: colors.bg, color: colors.fg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${colors.border}`,
              boxShadow: `0 5px 12px ${colors.fg}26, 0 1px 0 rgba(255,255,255,0.6) inset`,
            }}>
              <I name="syllabus" size={18} />
            </div>

            {/* Title + subject */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13.5, fontWeight: 600, color: T.text,
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {a.title}
              </div>
              <div style={{
                fontSize: 11.5, color: T.text3, marginTop: 2,
                fontWeight: 500, letterSpacing: '-0.005em',
              }}>
                {a.subject} Â· {a.type}
              </div>
            </div>

            {/* Due date */}
            <div style={{
              minWidth: 80, textAlign: 'right', flexShrink: 0,
            }}>
              <div style={{
                fontSize: 13.5, fontWeight: 700, color: T.text,
                letterSpacing: '-0.025em',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {a.dueDate}
              </div>
              <div style={{
                fontSize: 11, color: colors.fg, marginTop: 2,
                fontWeight: 700, letterSpacing: '-0.005em',
              }}>
                in {a.daysLeft}d
              </div>
            </div>

            {/* Open pill */}
            <div className="ch-pill-btn" style={{
              padding: '6px 12px', borderRadius: 99,
              background: T.accentSoft, color: T.accent,
              fontSize: 11.5, fontWeight: 700,
              letterSpacing: '-0.005em',
              border: `1px solid ${T.accentBorder}`,
              flexShrink: 0,
            }}>Open</div>
          </button>
        );
      })}
    </div>
  </Card>
);

export const AttendanceCard = ({ attendance }) => {
  const percent = attendance.total > 0 ? (attendance.present / attendance.total) * 100 : 0;
  const status = percent >= 75 ? 'Above minimum' : attendance.total === 0 ? 'â€”' : 'Below minimum';
  const statusColor = percent >= 75 ? T.green : attendance.total === 0 ? T.text3 : T.red;

  return (
    <Card style={{ padding: '16px 20px', flex: 1 }}>
      <CardTitle right={<FilterPill label="Term" />}>My Attendance</CardTitle>

      <div style={{
        flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginTop: -4, marginBottom: 0,
      }}>
        <Gauge percent={percent} label="PRESENT" size={190} />
      </div>

      {attendance.total > 0 ? (
        <div style={{ textAlign: 'center', fontSize: 11.5, color: T.text3, fontWeight: 500, marginTop: -8 }}>
          <span style={{ color: T.text2, fontWeight: 700 }}>{attendance.present}</span>
          {' of '}
          <span style={{ color: T.text2, fontWeight: 700 }}>{attendance.total}</span>
          {' Â· '}
          <span style={{ color: statusColor, fontWeight: 700 }}>{status}</span>
        </div>
      ) : (
        <div style={{ textAlign: 'center', fontSize: 12, color: T.text3, fontWeight: 500, marginTop: -8 }}>
          Attendance tracking not yet enabled
        </div>
      )}
    </Card>
  );
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MINI CALENDAR â€” current month grid with event dots
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export const CalendarCard = ({ events, holidays }) => {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear]   = useState(today.getFullYear());

  const firstDay   = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startWeekday = firstDay.getDay();

  // Build a map of date number -> event types so we can decorate cells
  const eventsByDay = useMemo(() => {
    const map = {};
    events.forEach(e => {
      if (!map[e.date]) map[e.date] = new Set();
      map[e.date].add(e.type);
    });
    holidays.forEach(h => {
      const d = new Date(h.date);
      if (d.getMonth() === viewMonth && d.getFullYear() === viewYear) {
        if (!map[d.getDate()]) map[d.getDate()] = new Set();
        map[d.getDate()].add('holiday');
      }
    });
    return map;
  }, [events, holidays, viewMonth, viewYear]);

  const eventColor = (type) => ({
    holiday:    T.red,
    exam:       T.amber,
    assignment: T.blue,
  }[type] || T.text4);

  const monthName = firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const goPrev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const goNext = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const weekdayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <Card style={{ padding: '16px 18px', flex: 1 }}>
      <CardTitle right={
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <button onClick={goPrev} className="ch-icon-btn" style={{
            width: 26, height: 26, borderRadius: 7,
            background: 'transparent', border: 'none',
            color: T.text3, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <I name="chevLeft" size={14} />
          </button>
          <button onClick={goNext} className="ch-icon-btn" style={{
            width: 26, height: 26, borderRadius: 7,
            background: 'transparent', border: 'none',
            color: T.text3, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <I name="chevRight" size={14} />
          </button>
        </div>
      }>{monthName}</CardTitle>

      {/* Weekday header */}
      <div className="keep-grid" style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 2, marginBottom: 4,
      }}>
        {weekdayLabels.map((d, i) => (
          <div key={i} style={{
            textAlign: 'center',
            fontSize: 10, fontWeight: 700, color: T.text4,
            letterSpacing: '0.05em',
            padding: '4px 0',
          }}>{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="keep-grid" style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 2,
      }}>
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const isToday = d === today.getDate()
            && viewMonth === today.getMonth()
            && viewYear === today.getFullYear();
          const dayEvents = eventsByDay[d];

          return (
            <div key={i} className="ch-cal-day" style={{
              position: 'relative',
              aspectRatio: '1',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column',
              borderRadius: 9,
              fontSize: 12, fontWeight: isToday ? 700 : 500,
              color: isToday ? '#fff' : T.text2,
              background: isToday ? T.accent : 'transparent',
              cursor: 'pointer',
              boxShadow: isToday
                ? `0 4px 10px ${T.accent}40, 0 1px 0 rgba(255,255,255,0.3) inset`
                : 'none',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.02em',
            }}>
              <span style={{ lineHeight: 1 }}>{d}</span>
              {dayEvents && dayEvents.size > 0 && (
                <div style={{
                  display: 'flex', gap: 2, marginTop: 2,
                  position: 'absolute', bottom: 4,
                }}>
                  {Array.from(dayEvents).slice(0, 3).map((t, ei) => (
                    <span key={ei} style={{
                      width: 4, height: 4, borderRadius: '50%',
                      background: isToday ? '#fff' : eventColor(t),
                    }} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        marginTop: 10, paddingTop: 10,
        borderTop: `1px solid ${T.divider}`,
        fontSize: 10.5, fontWeight: 500, color: T.text3,
      }}>
        {[
          { color: T.red,   label: 'Holiday' },
          { color: T.amber, label: 'Exam' },
          { color: T.blue,  label: 'Task' },
        ].map((l, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: l.color,
              boxShadow: `0 0 0 2px ${l.color}24`,
            }} />
            {l.label}
          </span>
        ))}
      </div>
    </Card>
  );
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   NEXT HOLIDAYS â€” list of upcoming holidays w/ days-away counter
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export const HolidaysCard = ({ holidays }) => (
  <Card style={{ padding: '16px 18px', flex: 1 }}>
    <CardTitle right={<FilterPill label="Term" />}>Next Holidays</CardTitle>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {holidays.slice(0, 4).map((h, i) => {
        // Color the date tile based on holiday type
        const tileColor = h.type === 'public' ? T.red : T.accent;
        return (
          <button key={i} className="ch-row-btn" style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '8px 6px', borderRadius: 12,
            background: 'transparent', border: 'none',
            cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
          }}>
            {/* Date tile */}
            <div style={{
              width: 44, flexShrink: 0,
              background: `linear-gradient(180deg, ${tileColor}1c, ${tileColor}0d)`,
              border: `1px solid ${tileColor}30`,
              borderRadius: 11, padding: '5px 0',
              textAlign: 'center',
              boxShadow: `0 4px 10px ${tileColor}1f, 0 1px 0 rgba(255,255,255,0.6) inset`,
            }}>
              <div style={{
                fontSize: 9, fontWeight: 700, color: tileColor,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                lineHeight: 1,
              }}>{h.month}</div>
              <div style={{
                fontSize: 16, fontWeight: 700, color: T.text,
                letterSpacing: '-0.04em', marginTop: 2,
                fontVariantNumeric: 'tabular-nums',
                lineHeight: 1,
              }}>{h.day}</div>
            </div>

            {/* Name */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 12.5, fontWeight: 600, color: T.text,
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{h.name}</div>
              <div style={{
                fontSize: 10.5, color: T.text3, marginTop: 1,
                fontWeight: 500,
              }}>
                {h.type === 'public' ? 'Public holiday' : 'Academic break'}
              </div>
            </div>

            {/* Days away */}
            <div style={{
              fontSize: 11, fontWeight: 700, color: T.text2,
              letterSpacing: '-0.005em',
              flexShrink: 0,
              fontVariantNumeric: 'tabular-nums',
            }}>
              in {h.daysAway}d
            </div>
          </button>
        );
      })}
    </div>
  </Card>
);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   QUICK LINKS â€” action tiles below the attendance gauge
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export const QuickLinksCard = ({ navigate }) => {
  const links = [
    { icon: 'timetable', label: 'Full Timetable',  path: '/student-timetable',  color: T.accent },
    { icon: 'subject',   label: 'My Subjects',      path: '/student-subjects',   color: T.blue   },
    { icon: 'calendar',  label: 'Calendar',         path: '/student-calendar',   color: T.green  },
    { icon: 'flag',      label: 'Holidays',         path: '/student-holidays',   color: T.red    },
    { icon: 'rating',    label: 'Rate Teachers',    path: '/rate-teachers',      color: T.amber  },
    { icon: 'bell',      label: 'Notices',          path: '/student-notices',    color: T.text3  },
  ];
  return (
    <Card style={{ padding: '16px 18px', flex: 1, overflow: 'hidden' }}>
      <CardTitle>Quick Links</CardTitle>
      {/* Use repeat(2, minmax(0,1fr)) so cells can shrink to 0 and never force overflow */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
        {links.map((l, i) => (
          <button key={i} onClick={() => navigate(l.path)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 10px', borderRadius: 13,
            background: `${l.color}10`,
            border: `1px solid ${l.color}20`,
            cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
            transition: 'all 220ms cubic-bezier(0.4,0,0.2,1)',
            minWidth: 0, overflow: 'hidden',
          }}
            onMouseEnter={e => { e.currentTarget.style.background=`${l.color}1c`; e.currentTarget.style.transform='translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background=`${l.color}10`; e.currentTarget.style.transform='translateY(0)'; }}
          >
            <span style={{
              width: 28, height: 28, borderRadius: 8, flexShrink: 0,
              background: `${l.color}18`, color: l.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${l.color}28`,
            }}>
              <I name={l.icon} size={13} />
            </span>
            <span style={{
              fontSize: 11.5, fontWeight: 600, color: T.text2,
              letterSpacing: '-0.01em',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              minWidth: 0, flex: 1,
            }}>{l.label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
};
