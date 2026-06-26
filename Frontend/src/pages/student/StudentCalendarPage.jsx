/**
 * StudentCalendarPage.jsx — Chronos Student
 * Academic calendar showing holidays, exams, and events.
 * Backend: GET /calendar
 * Route: /student-calendar
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import calendarService from '@/services/calendarService';
import StudentLayout, {
  StudentCard, StudentEmptyState, StudentSpinner, StudentIcon, StudentT as T,
} from '@/layouts/StudentLayout';

const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const pad = (n) => String(n).padStart(2, '0');
const dateKey = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

const EVENT_COLORS = {
  holiday:  { bg: T.redSoft,    fg: T.red,    dot: T.red    },
  vacation: { bg: T.redSoft,    fg: T.red,    dot: T.red    },
  exam:     { bg: T.amberSoft,  fg: T.amber,  dot: T.amber  },
  event:    { bg: T.accentSoft, fg: T.accent, dot: T.accent },
  default:  { bg: T.surfaceMuted, fg: T.text3, dot: T.text4 },
};
const typeColor = (type = '') => EVENT_COLORS[type.toLowerCase()] || EVENT_COLORS.default;

const MonthGrid = ({ year, month, events, selectedDate, onSelectDate }) => {
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <div className="keep-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 6 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 10.5, fontWeight: 700, color: T.text4, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '6px 0' }}>{d}</div>
        ))}
      </div>
      <div className="keep-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} />;
          const key     = dateKey(year, month, day);
          const dayEvts = events[key] || [];
          const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
          const isSel   = selectedDate === key;

          return (
            <button key={idx} onClick={() => onSelectDate(isSel ? null : key)} style={{
              padding: '6px 4px', borderRadius: 10,
              border: isSel ? `1.5px solid ${T.accent}` : '1px solid transparent',
              background: isSel ? T.accentSoft : isToday ? `${T.accent}10` : 'transparent',
              cursor: 'pointer', textAlign: 'center', fontFamily: 'inherit',
              transition: 'all 160ms ease',
            }}
              onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = T.surfaceMuted; }}
              onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = isToday ? `${T.accent}10` : 'transparent'; }}
            >
              <div style={{
                fontSize: 13, fontWeight: isToday ? 700 : 500,
                color: isToday ? T.accent : isSel ? T.accent : T.text,
                letterSpacing: '-0.01em', marginBottom: dayEvts.length ? 4 : 0,
                fontVariantNumeric: 'tabular-nums',
              }}>{day}</div>
              <div style={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                {dayEvts.slice(0, 3).map((ev, i) => (
                  <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: typeColor(ev.eventType).dot, flexShrink: 0 }} />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const StudentCalendarPage = () => {
  const { user } = useAuth();
  const today = new Date();
  const [year,         setYear]         = useState(today.getFullYear());
  const [month,        setMonth]        = useState(today.getMonth());
  const [events,       setEvents]       = useState({});
  const [eventsList,   setEventsList]   = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');

  useEffect(() => {
    if (!user) return;

    calendarService.getAll()
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.events || data || []);
        setEventsList(list);

        const map = {};
        list.forEach(ev => {
          const d = new Date(ev.startDate || ev.date);
          if (isNaN(d)) return;
          const k = dateKey(d.getFullYear(), d.getMonth(), d.getDate());
          if (!map[k]) map[k] = [];
          map[k].push(ev);
        });
        setEvents(map);
      })
      .catch(() => setError('Could not load calendar events.'))
      .finally(() => setLoading(false));
  }, [user]);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const selectedEvents = selectedDate ? (events[selectedDate] || []) : [];
  const upcomingEvents = eventsList
    .filter(ev => new Date(ev.startDate || ev.date) >= today)
    .sort((a, b) => new Date(a.startDate || a.date) - new Date(b.startDate || b.date))
    .slice(0, 8);

  return (
    <StudentLayout title="Academic Calendar" subtitle="Holidays, exams, and important events">
      <div style={{ padding: '0 28px', display: 'flex', gap: 20 }}>

        {/* Left: Calendar grid */}
        <div style={{ flex: '0 0 420px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <StudentCard style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <button onClick={prevMonth} style={{ width: 32, height: 32, borderRadius: 9, background: T.surfaceMuted, border: `1px solid ${T.border}`, cursor: 'pointer', color: T.text2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>
                <StudentIcon name="back" size={14} />
              </button>
              <div style={{ fontWeight: 700, fontSize: 15, color: T.text, letterSpacing: '-0.025em' }}>
                {MONTHS[month]} {year}
              </div>
              <button onClick={nextMonth} style={{ width: 32, height: 32, borderRadius: 9, background: T.surfaceMuted, border: `1px solid ${T.border}`, cursor: 'pointer', color: T.text2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>
                <StudentIcon name="forward" size={14} />
              </button>
            </div>

            {loading ? <StudentSpinner text="Loading…" /> : (
              <MonthGrid year={year} month={month} events={events} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
            )}

            {/* Legend */}
            <div style={{ display: 'flex', gap: 14, marginTop: 14, flexWrap: 'wrap' }}>
              {[['holiday','Holiday'],['exam','Exam'],['event','Event']].map(([type, label]) => {
                const tc = typeColor(type);
                return (
                  <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: tc.dot }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: T.text3 }}>{label}</span>
                  </div>
                );
              })}
            </div>
          </StudentCard>
        </div>

        {/* Right: Event list */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {error && (
            <div style={{ padding: '12px 16px', borderRadius: 12, background: T.amberSoft, border: `1px solid ${T.amber}33`, color: T.amber, fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
              <StudentIcon name="alert" size={14} />
              {error}
            </div>
          )}

          {/* Selected date events */}
          {selectedDate && (
            <StudentCard style={{ padding: '18px 20px' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 12 }}>
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
              {selectedEvents.length === 0 ? (
                <div style={{ fontSize: 13, color: T.text3, fontWeight: 500 }}>No events on this day.</div>
              ) : selectedEvents.map((ev, i) => {
                const tc = typeColor(ev.eventType);
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: i < selectedEvents.length - 1 ? `1px solid ${T.divider}` : 'none' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: tc.dot, marginTop: 4, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: T.text }}>{ev.title}</div>
                      {ev.description && <div style={{ fontSize: 12, color: T.text3, marginTop: 3 }}>{ev.description}</div>}
                      <span style={{ marginTop: 6, display: 'inline-block', padding: '2px 8px', borderRadius: 99, background: tc.bg, color: tc.fg, fontSize: 10, fontWeight: 700 }}>
                        {ev.eventType || 'Event'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </StudentCard>
          )}

          {/* Upcoming events */}
          <StudentCard style={{ padding: '18px 20px', flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 16 }}>Upcoming Events</div>
            {loading ? (
              <StudentSpinner text="Loading events…" />
            ) : upcomingEvents.length === 0 ? (
              <StudentEmptyState icon="calendar" message="No upcoming events" subtext="Academic events will appear here once added by your admin." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {upcomingEvents.map((ev, i) => {
                  const tc = typeColor(ev.eventType);
                  const evDate = new Date(ev.startDate || ev.date);
                  return (
                    <div key={i} className="ch-student-row" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px', borderRadius: 12, cursor: 'pointer' }}>
                      <div style={{ width: 48, height: 48, borderRadius: 13, flexShrink: 0, background: tc.bg, color: tc.fg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontVariantNumeric: 'tabular-nums' }}>
                        <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1 }}>{evDate.getDate()}</div>
                        <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 1 }}>{MONTHS[evDate.getMonth()].slice(0, 3)}</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: T.text, letterSpacing: '-0.02em' }}>{ev.title}</div>
                        {ev.description && <div style={{ fontSize: 11.5, color: T.text3, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.description}</div>}
                      </div>
                      <span style={{ padding: '3px 9px', borderRadius: 99, background: tc.bg, color: tc.fg, fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                        {ev.eventType || 'Event'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </StudentCard>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentCalendarPage;
