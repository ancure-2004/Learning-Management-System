import { theme } from '@/theme';
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import timetableService from '@/services/timetableService';
import calendarService from '@/services/calendarService';
import Sidebar, { ActionButton, useHistoryNav, useSidebarState } from '@/layouts/Sidebar';
import { STUDENT_NAV } from '@/layouts/StudentLayout';
import NotificationBell from '@/components/NotificationBell';
import GlobalSearchBar from '@/components/GlobalSearchBar';
import I from '@/components/Icon';
import { KpiCapsule } from './components/ui';
import {
  TodaysTimetableCard,
  AttendanceCard,
  CalendarCard,
  HolidaysCard,
  QuickLinksCard,
} from './components/cards';
import SearchModal from './components/SearchModal';

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   DESIGN TOKENS
   Identical palette to the admin Dashboard so the two surfaces
   feel like the same product. Only the *content* changes per role.
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const T = theme;

const TOPBAR_H = 64;

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   GLOBAL STYLES â€” same animation system as the admin Dashboard
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const GLOBAL_STYLES = `

@keyframes ch-pulse-ring {
  0%   { transform: scale(0.95); opacity: 0.7; }
  70%  { transform: scale(1.4); opacity: 0; }
  100% { transform: scale(1.4); opacity: 0; }
}

.ch-tile-cell { animation: tileEnter 700ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.ch-tile-cell.d1 { animation-delay: 0ms; }
.ch-tile-cell.d2 { animation-delay: 90ms; }
.ch-tile-cell.d3 { animation-delay: 180ms; }
.ch-tile-cell.d4 { animation-delay: 270ms; }
.ch-tile-cell.d5 { animation-delay: 360ms; }
.ch-tile-cell.d6 { animation-delay: 450ms; }
.ch-tile-cell.d7 { animation-delay: 540ms; }
.ch-tile-cell.d8 { animation-delay: 630ms; }

.ch-kpi-card {
  transition: transform 400ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 400ms cubic-bezier(0.4, 0, 0.2, 1);
}
.ch-kpi-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.10), 0 24px 56px rgba(15, 23, 42, 0.14), 0 1px 0 rgba(255,255,255,0.8) inset !important;
}

.ch-row-btn { transition: background 260ms cubic-bezier(0.4, 0, 0.2, 1), transform 260ms cubic-bezier(0.4, 0, 0.2, 1); }
.ch-row-btn:hover { background: ${T.surfaceMuted} !important; }
.ch-row-btn:active { transform: scale(0.99); }

.ch-cta-btn { transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1), filter 300ms cubic-bezier(0.4, 0, 0.2, 1); }
.ch-cta-btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.06);
  box-shadow: 0 10px 22px -3px rgba(124, 58, 237, 0.40), 0 1px 0 rgba(255, 255, 255, 0.2) inset !important;
}

.ch-pill-btn { transition: all 260ms cubic-bezier(0.4, 0, 0.2, 1); }
.ch-pill-btn:hover {
  background: ${T.accent} !important; color: #fff !important;
  transform: translateY(-1px);
}

.ch-icon-btn { transition: background 240ms cubic-bezier(0.4, 0, 0.2, 1), color 240ms cubic-bezier(0.4, 0, 0.2, 1); }
.ch-icon-btn:hover { background: ${T.surfaceMuted} !important; color: ${T.text} !important; }

.ch-cal-day { transition: background 200ms ease, color 200ms ease, transform 200ms ease; }
.ch-cal-day:hover { background: ${T.surfaceMuted}; transform: scale(1.05); }

.ch-pulse-ring {
  position: absolute; inset: 0; border-radius: inherit;
  border: 2px solid ${T.accent};
  animation: ch-pulse-ring 1800ms cubic-bezier(0.16, 1, 0.3, 1) infinite;
  pointer-events: none;
}

.ch-row-btn:focus-visible, .ch-cta-btn:focus-visible, .ch-pill-btn:focus-visible, .ch-kpi-card:focus-visible {
  outline: 2px solid ${T.accent2}; outline-offset: 2px;
}
`;

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   STUDENT NAV CONFIG
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
/* Student NAV â€” imported from StudentLayout (single source of truth) */
const NAV = STUDENT_NAV;

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   TOPBAR â€” same translucent overlay style as admin
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const TopBar = ({ collapsed, onToggleSidebar, onSearch }) => {
  const { canBack, canForward, goBack, goForward } = useHistoryNav();
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50,
      height: TOPBAR_H,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 22px',
      background: 'rgba(238, 240, 245, 0.98)',
      borderBottom: '1px solid rgba(15, 23, 42, 0.06)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 3,
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        padding: '7px 9px',
        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 0 rgba(255,255,255,0.7) inset',
        flexShrink: 0,
      }}>
        <ActionButton icon="sidebar" label={collapsed ? 'Expand' : 'Collapse'} onClick={onToggleSidebar} />
        <ActionButton icon="back"    label="Back"    onClick={goBack}    disabled={!canBack} />
        <ActionButton icon="forward" label="Forward" onClick={goForward} disabled={!canForward} />
      </div>

      <GlobalSearchBar />

      <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
        <NotificationBell />
      </div>
    </div>
  );
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   PAGE HEADER â€” greeting on the left, KPI capsules on the right.
   Capsules are compact horizontal pills
   so they communicate the same information as the previous hero KPI
   cards while taking ~40% of the vertical space.
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const PageHeader = ({ student, kpis }) => {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      marginBottom: 22, gap: 24, flexWrap: 'wrap',
    }}>
      {/* Greeting block */}
      <div className="ch-tile-cell d1" style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 12, color: T.text3, fontWeight: 600,
          letterSpacing: '0.06em', textTransform: 'uppercase',
          marginBottom: 6,
        }}>
          {dateStr}
        </div>
        <h1 style={{
          margin: 0,
          fontSize: 28, fontWeight: 700, color: T.text,
          letterSpacing: '-0.04em', lineHeight: 1.1,
        }}>
          {greeting}, {student?.firstName || 'Student'}
        </h1>
        <div style={{
          marginTop: 6,
          fontSize: 13.5, color: T.text3, fontWeight: 500,
          letterSpacing: '-0.005em',
        }}>
          {student?.className || 'Class info'} Â· Roll {student?.rollNo || 'â€”'}
        </div>
      </div>

      {/* KPI capsules â€” right-aligned, wrap to new line on narrow screens.
         Attended capsule is intentionally omitted; that metric lives in
         the Attendance gauge below, so showing it twice was redundant. */}
      {kpis && (
        <div className="ch-tile-cell d2" style={{
          display: 'flex', flexWrap: 'wrap', gap: 8,
          justifyContent: 'flex-end',
          alignItems: 'center',
          minWidth: 0,
        }}>
          <KpiCapsule {...kpis.todayClasses} />
          <KpiCapsule {...kpis.attendance} />
          <KpiCapsule {...kpis.nextHoliday} />
        </div>
      )}
    </div>
  );
};


/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   EMPTY INITIAL STATE â€” all real data comes from the backend.
   Components render empty/zero states gracefully.
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const EMPTY_DATA = {
  student:      { firstName: '', className: '', rollNo: '' },
  todayClasses: [],
  attendance:   { present: 0, total: 0, bySubject: [] },
  calendarEvents: [],
  holidays:     [],
};

/* Composite data-loader: fetches the student timetable + calendar, derives
   today's classes and upcoming holidays, and returns the object that
   previously fed setData(). Falls back to the empty shell on failure. */
async function loadDashboard(user) {
  const student = {
    firstName: user.firstName || '',
    className: user.className || '',
    rollNo:    user.rollNo    || '',
  };

  try {
    // Fetch student timetable and calendar events in parallel.
    // /timetables/student/:userId will 404 if no timetable is published yet â€” that's fine.
    const [ttRes, calRes] = await Promise.allSettled([
      timetableService.getForStudent(user._id),
      calendarService.getAll(),
    ]);

    // Derive today's classes from the published timetable
    let todayClasses = [];
    if (ttRes.status === 'fulfilled') {
      const timetable = ttRes.value?.timetable || ttRes.value;
      const schedule  = timetable?.schedule || [];
      const now = new Date();
      const dayIdx = now.getDay() - 1; // 0=Mon..4=Fri, -1=Sun, 5=Sat
      const SLOTS     = ['9:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00'];
      const END_SLOTS = ['9:50','10:50','11:50','12:50','13:50','14:50','15:50','16:50'];
      const curHour   = now.getHours() + now.getMinutes() / 60;

      if (dayIdx >= 0 && dayIdx <= 4 && schedule[dayIdx]) {
        schedule[dayIdx].forEach((slot, si) => {
          if (!slot?.length) return;
          slot.forEach(entry => {
            if (!entry.subject || entry.event) return;
            const startH = 9 + si;
            const status = curHour > startH + 1 ? 'completed' : curHour >= startH ? 'current' : 'upcoming';
            todayClasses.push({
              time: SLOTS[si], endTime: END_SLOTS[si],
              subject: entry.subject, teacher: entry.teacher || 'â€”',
              room: entry.classroom || 'â€”', status,
            });
          });
        });
      }
    }

    // Derive upcoming holidays from calendar events
    let holidays = [];
    if (calRes.status === 'fulfilled') {
      const calList = Array.isArray(calRes.value) ? calRes.value : (calRes.value?.events || []);
      const now = new Date();
      holidays = calList
        .filter(ev => ['holiday','vacation'].includes((ev.eventType||'').toLowerCase()))
        .map(ev => {
          const d = new Date(ev.startDate || ev.date);
          const daysAway = Math.max(0, Math.ceil((d - now) / 86400000));
          return {
            date: ev.startDate || ev.date,
            month: d.toLocaleString('en', { month: 'short' }),
            day: d.getDate(),
            name: ev.title || 'Holiday',
            type: 'public',
            daysAway,
          };
        })
        .filter(h => h.daysAway >= 0)
        .sort((a, b) => a.daysAway - b.daysAway)
        .slice(0, 5);
    }

    return {
      ...EMPTY_DATA,
      student,
      todayClasses: todayClasses.length ? todayClasses : [],
      holidays:     holidays.length     ? holidays     : [],
    };
  } catch (err) {
    console.warn('Student dashboard load failed:', err);
    // Merge user info into demo data
    return { ...EMPTY_DATA, student };
  }
}

const StudentBento = ({ data, navigate }) => {
  const attendancePct = data.attendance.total > 0
    ? Math.round((data.attendance.present / data.attendance.total) * 100)
    : 0;

  const kpis = {
    todayClasses: {
      icon: 'timetable',
      value: data.todayClasses.length,
      label: 'Today',
      color: T.accent,
    },
    attendance: {
      icon: 'check',
      value: attendancePct,
      suffix: '%',
      label: 'Attended',
      color: T.green,
    },
    nextHoliday: {
      icon: 'flag',
      value: data.holidays[0]?.daysAway ?? 'â€”',
      suffix: data.holidays[0] ? 'd' : '',
      label: 'Next holiday',
      color: T.red,
    },
  };

  return (
    <>
      <PageHeader student={data.student} kpis={kpis} />

      <div style={{
        display: 'grid',
        /* Pure fr ratios â€” no pixel minimums so the grid never overflows the viewport */
        gridTemplateColumns: '0.85fr 1.3fr 1fr',
        gap: 14,
        alignItems: 'start',
        minWidth: 0,
      }}>
        {/* COL 1 â€” Attendance (300px) + Quick Links (346px) = 660 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
          <div className="ch-tile-cell d3" style={{
            height: 300,
            display: 'flex', flexDirection: 'column', minHeight: 0,
          }}>
            <AttendanceCard attendance={data.attendance} />
          </div>
          <div className="ch-tile-cell d4" style={{
            height: 346,
            display: 'flex', flexDirection: 'column', minHeight: 0,
          }}>
            <QuickLinksCard navigate={navigate} />
          </div>
        </div>

        {/* COL 2 â€” Todayâ€™s Timetable (full height â€” widest column so nothing truncates) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
          <div className="ch-tile-cell d3" style={{
            height: 660,
            display: 'flex', flexDirection: 'column', minHeight: 0,
          }}>
            <TodaysTimetableCard classes={data.todayClasses} />
          </div>
        </div>

        {/* COL 3 â€” Calendar (360) + Holidays (286) = 660 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
          <div className="ch-tile-cell d4" style={{
            height: 360,
            display: 'flex', flexDirection: 'column', minHeight: 0,
          }}>
            <CalendarCard events={data.calendarEvents} holidays={data.holidays} />
          </div>
          <div className="ch-tile-cell d5" style={{
            height: 286,
            display: 'flex', flexDirection: 'column', minHeight: 0,
          }}>
            <HolidaysCard holidays={data.holidays} />
          </div>
        </div>
      </div>
    </>
  );
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MAIN COMPONENT
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { collapsed, toggleCollapsed } = useSidebarState();

  const [searchOpen, setSearchOpen] = useState(false);

  const { data = EMPTY_DATA } = useQuery({
    queryKey: ['dashboard', 'student', user?._id],
    queryFn: () => loadDashboard(user),
    enabled: !!user,
  });

  const handleAction   = (path) => navigate(path);
  const handleLogout   = () => { logout(); navigate('/login'); };
  const handleSearch   = () => setSearchOpen(true);

  /* Global âŒ˜K / Ctrl+K opens the search palette */
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const renderIcon = (name, size) => <I name={name} size={size} />;
  const currentPath = '/student-dashboard';

  return (
    <div className="chronos" style={{
      position: 'relative',
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      background: T.bg,
      fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      color: T.text,
      letterSpacing: '-0.005em',
      fontFeatureSettings: '"tnum" 1, "ss01" 1, "ss02" 1, "calt" 1',
      textRendering: 'optimizeLegibility',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
    }}>
      <style>{GLOBAL_STYLES}</style>

      {/* Sidebar â€” same dark sidebar, just student NAV */}
      <div style={{
        marginTop: TOPBAR_H, height: `calc(100vh - ${TOPBAR_H}px)`,
        flexShrink: 0,
      }}>
        <Sidebar
          user={user}
          onLogout={handleLogout}
          onNavigate={handleAction}
          currentPath={currentPath}
          navConfig={NAV}
          iconRenderer={renderIcon}
          collapsed={collapsed}
          onToggleCollapse={toggleCollapsed}
        />
      </div>

      {/* Main scroll area */}
      <main style={{
        flex: 1, minWidth: 0,
        overflowY: 'auto', overflowX: 'hidden',
        position: 'relative',
        background: `linear-gradient(180deg, ${T.bg} 0%, ${T.bgAlt} 100%)`,
      }}>
        {/* Spacer so content starts below the absolute topbar */}
        <div style={{ height: TOPBAR_H }} />

        <div style={{
          maxWidth: 1480,
          margin: '0 auto',
          padding: '20px 22px 40px',
        }}>
          {/* PageHeader is rendered inside StudentBento now so it can
             receive the computed kpis from the same source of truth. */}
          <StudentBento data={data} navigate={handleAction} />
        </div>
      </main>

      <TopBar
        collapsed={collapsed}
        onToggleSidebar={toggleCollapsed}
        onSearch={handleSearch}
      />

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onAction={handleAction}
      />
    </div>
  );
};

export default StudentDashboard;
