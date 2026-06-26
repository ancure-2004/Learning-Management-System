/**
 * StudentHolidaysPage.jsx — Chronos Student
 * Upcoming holidays and academic breaks.
 * Reuses the /calendar endpoint, filtered to holiday/vacation events.
 * Route: /student-holidays
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import calendarService from '@/services/calendarService';
import StudentLayout, {
  StudentCard, StudentEmptyState, StudentSpinner, StudentIcon, StudentT as T,
} from '@/layouts/StudentLayout';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const HolidayRow = ({ ev }) => {
  const d        = new Date(ev.startDate || ev.date);
  const today    = new Date();
  const daysAway = Math.max(0, Math.ceil((d - today) / 86400000));
  const isPast   = d < today;
  const isToday  = daysAway === 0;

  const color   = ev.eventType === 'holiday' ? T.red : T.amber;
  const bgColor = ev.eventType === 'holiday' ? T.redSoft : T.amberSoft;

  return (
    <div className="ch-student-row flex items-center gap-4 rounded-[14px] px-[14px] py-3 cursor-default" style={{
      opacity: isPast ? 0.5 : 1,
    }}>
      {/* Date tile */}
      <div className="w-[52px] h-[56px] rounded-[14px] flex-shrink-0 flex flex-col items-center justify-center" style={{
        background: `linear-gradient(180deg, ${color}22, ${color}12)`,
        border: `1px solid ${color}30`,
        boxShadow: `0 4px 10px ${color}18, 0 1px 0 rgba(255,255,255,0.6) inset`,
      }}>
        <div className="text-[9px] font-bold uppercase leading-none" style={{ color, letterSpacing: '0.08em' }}>
          {MONTHS[d.getMonth()].slice(0, 3)}
        </div>
        <div className="text-[22px] font-bold text-text leading-none mt-0.5" style={{ letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>
          {d.getDate()}
        </div>
        <div className="text-[9px] font-medium text-text3 mt-px">
          {d.toLocaleString('en', { weekday: 'short' })}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-bold text-text" style={{ letterSpacing: '-0.025em' }}>
          {ev.title}
        </div>
        {ev.description && (
          <div className="text-[12px] text-text3 mt-[3px] font-medium">
            {ev.description}
          </div>
        )}
        <div className="mt-1.5 inline-flex">
          <span className="px-2 py-0.5 rounded-[99px] text-[10.5px] font-bold" style={{
            background: bgColor, color,
            border: `1px solid ${color}28`,
          }}>
            {ev.eventType === 'vacation' ? 'Academic Break' : 'Public Holiday'}
          </span>
        </div>
      </div>

      {/* Days away badge */}
      <div className="text-right flex-shrink-0">
        {isPast ? (
          <div className="text-[11.5px] font-semibold text-text4">Past</div>
        ) : isToday ? (
          <div className="px-2.5 py-1 rounded-[99px] text-[11px] font-bold bg-green-soft text-green" style={{ border: `1px solid ${T.green}28` }}>Today!</div>
        ) : (
          <div>
            <div className="text-[20px] font-bold text-text leading-none" style={{ letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>
              {daysAway}
            </div>
            <div className="text-[10.5px] font-medium text-text3 mt-0.5">days away</div>
          </div>
        )}
      </div>
    </div>
  );
};

const StudentHolidaysPage = () => {
  const { user } = useAuth();
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!user) return;

    calendarService.getAll()
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.events || data || []);
        const holidays = list
          .filter(ev => ['holiday', 'vacation'].includes((ev.eventType || '').toLowerCase()))
          .sort((a, b) => new Date(a.startDate || a.date) - new Date(b.startDate || b.date));
        setEvents(holidays);
      })
      .catch(() => setError('Could not load holiday data.'))
      .finally(() => setLoading(false));
  }, [user]);

  const today    = new Date();
  const upcoming = events.filter(ev => new Date(ev.startDate || ev.date) >= today);
  const past     = events.filter(ev => new Date(ev.startDate || ev.date) < today).reverse();

  return (
    <StudentLayout
      title="Holidays"
      subtitle="Upcoming public holidays and academic breaks"
    >
      <div className="px-7 flex flex-col gap-5">

        {loading && <StudentCard><StudentSpinner text="Loading holidays…" /></StudentCard>}

        {!loading && error && (
          <div className="px-4 py-3 rounded-xl bg-amber-soft text-amber text-[13px] font-medium flex items-center gap-2" style={{ border: `1px solid ${T.amber}33` }}>
            <StudentIcon name="alert" size={14} />
            {error}
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <StudentCard>
            <StudentEmptyState
              icon="flag"
              message="No holidays scheduled"
              subtext="Your admin hasn't added any holidays to the academic calendar yet."
            />
          </StudentCard>
        )}

        {!loading && !error && upcoming.length > 0 && (
          <StudentCard style={{ padding: '18px 20px' }}>
            <div className="text-[14px] font-bold text-text mb-3.5">
              Upcoming — {upcoming.length} holiday{upcoming.length !== 1 ? 's' : ''}
            </div>
            <div className="flex flex-col gap-0.5">
              {upcoming.map((ev, i) => <HolidayRow key={i} ev={ev} />)}
            </div>
          </StudentCard>
        )}

        {!loading && !error && past.length > 0 && (
          <StudentCard style={{ padding: '18px 20px' }}>
            <div className="text-[14px] font-bold text-text mb-3.5">
              Past Holidays
            </div>
            <div className="flex flex-col gap-0.5">
              {past.map((ev, i) => <HolidayRow key={i} ev={ev} />)}
            </div>
          </StudentCard>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentHolidaysPage;
