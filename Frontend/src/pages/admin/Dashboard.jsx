import { theme } from '@/theme';
import React, { useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import classService from '@/services/classService';
import timetableService from '@/services/timetableService';
import classSubjectService from '@/services/classSubjectService';
import calendarService from '@/services/calendarService';
import leaveService from '@/services/leaveService';
import progressService from '@/services/progressService';
import reportService from '@/services/reportService';
import Sidebar, { ActionButton, useHistoryNav, useSidebarState } from '@/layouts/Sidebar';
import NotificationBell from '@/components/NotificationBell';
import GlobalSearchBar from '@/components/GlobalSearchBar';
import I from '@/components/Icon';
import { KpiStrip } from './components/ui';
import {
  CriticalSubjectsCard,
  ComplianceTrendCard,
  ActionRequiredCard,
  ComplianceHealthCard,
  UpcomingCard,
  JumpBackInCard,
} from './components/cards';

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   DESIGN TOKENS
   Light-theme palette adapted from the reference dashboard:
   white cards on a soft lavender background, dark-slate type, very
   gentle shadows, purple accent. The sidebar (imported separately)
   stays its existing dark style â€” high contrast like the reference.
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const T = theme;

const TOPBAR_H = 64;

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   GLOBAL STYLES â€” keyframes, hover classes, light scrollbars
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const GLOBAL_STYLES = `

@keyframes donutSpin {
  from { transform: rotate(-90deg) scale(0.94); opacity: 0; }
  to   { transform: rotate(0deg)   scale(1);    opacity: 1; }
}
@keyframes lineDraw {
  from { stroke-dashoffset: 1000; }
  to   { stroke-dashoffset: 0; }
}
@keyframes ch-trend-dot-in {
  from { opacity: 0; transform: scale(0); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes ch-trend-area-in {
  from { opacity: 0; }
  to   { opacity: 1; }
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
.ch-cta-btn:active {
  transform: translateY(0) scale(0.98);
}

.ch-pill-btn {
  transition: all 260ms cubic-bezier(0.4, 0, 0.2, 1);
}
.ch-pill-btn:hover {
  background: ${T.accent} !important;
  color: #fff !important;
  transform: translateY(-1px);
}

.ch-icon-btn { transition: background 240ms cubic-bezier(0.4, 0, 0.2, 1), color 240ms cubic-bezier(0.4, 0, 0.2, 1); }
.ch-icon-btn:hover {
  background: ${T.surfaceMuted} !important;
  color: ${T.text} !important;
}

.ch-donut { animation: donutSpin 900ms cubic-bezier(0.16, 1, 0.3, 1) both; transform-origin: center; }

.ch-trend-line {
  stroke-dasharray: 1000;
  animation: lineDraw 1800ms cubic-bezier(0.16, 1, 0.3, 1) 200ms both;
}
.ch-trend-area {
  animation: ch-trend-area-in 1100ms cubic-bezier(0.16, 1, 0.3, 1) 400ms both;
  opacity: 0;
}
.ch-trend-dot {
  transform-origin: center;
  transform-box: fill-box;
  opacity: 0;
}

/* Focus rings */
.ch-row-btn:focus-visible,
.ch-cta-btn:focus-visible,
.ch-pill-btn:focus-visible,
.ch-kpi-card:focus-visible {
  outline: 2px solid ${T.accent2};
  outline-offset: 2px;
}
`;

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   NAV CONFIG
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export const NAV = [
  {
    section: null,
    items: [{ label: 'Overview', icon: 'overview', path: '/dashboard', pinned: true }],
  },
  {
    section: 'Academic',
    items: [
      { label: 'Departments', icon: 'dept',     path: '/departments' },
      { label: 'Programs',    icon: 'program',  path: '/programs' },
      { label: 'Classes',     icon: 'class',    path: '/academic-resources', pinned: true },
      { label: 'Subjects',    icon: 'subject',  path: '/subjects',           pinned: true },
      { label: 'Teachers',    icon: 'teacher',  path: '/teachers',           pinned: true },
      { label: 'Classrooms',  icon: 'room',     path: '/classrooms' },
    ],
  },
  {
    section: 'Scheduling',
    items: [
      { label: 'Assignments', icon: 'syllabus',  path: '/assign-subjects' },
      { label: 'Timetables',  icon: 'timetable', path: '/schedule',           pinned: true  },
      { label: 'Calendar',    icon: 'calendar',  path: '/academic-calendar',  pinned: true  },
    ],
  },
  {
    section: 'Insights',
    items: [
      { label: 'Progress',    icon: 'progress',  path: '/insights',           pinned: true  },
      { label: 'Performance', icon: 'rating',    path: '/teacher-performance'               },
      { label: 'Reports',     icon: 'report',    path: '/reports',            pinned: true  },
    ],
  },
  {
    section: 'System',
    items: [
      { label: 'Users',     icon: 'users',    path: '/users' },
      { label: 'Syllabus',  icon: 'syllabus', path: '/manage-syllabus' },
    ],
  },
];

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   RECENT-ITEMS UTIL
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const RECENT_KEY = 'chronos.admin.recent';

export const trackRecent = (label, path, icon = 'overview') => {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const filtered = list.filter(r => r.path !== path);
    filtered.unshift({ label, path, icon, timestamp: Date.now() });
    localStorage.setItem(RECENT_KEY, JSON.stringify(filtered.slice(0, 12)));
  } catch (_) { /* ignore */ }
};

const getRecentItems = () => {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

export const formatTimeAgo = (ts) => {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  const hr  = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (min < 1)  return 'just now';
  if (min < 60) return `${min}m ago`;
  if (hr  < 24) return `${hr}h ago`;
  if (day < 2)  return 'yesterday';
  if (day < 7)  return `${day}d ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   TOP BAR
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const TopBar = ({ collapsed, onToggleSidebar }) => {
  const { canBack, canForward, goBack, goForward } = useHistoryNav();

  return (
    <div style={{
      height: TOPBAR_H,
      padding: '0 20px',
      display: 'flex', alignItems: 'center',
      background: 'rgba(238, 240, 245, 0.98)',
      borderBottom: '1px solid rgba(15, 23, 42, 0.06)',
      position: 'absolute',
      top: 0, left: 0, right: 0,
      zIndex: 50,
    }}>
      {/* Left â€” sidebar + nav */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 3,
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        padding: '7px 9px',
        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 0 rgba(255,255,255,0.7) inset',
        flexShrink: 0,
      }}>
        <ActionButton icon="sidebar" label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={onToggleSidebar} />
        <ActionButton icon="back"    label="Go back"     onClick={goBack}    disabled={!canBack} />
        <ActionButton icon="forward" label="Go forward"  onClick={goForward} disabled={!canForward} />
      </div>

      {/* Center â€” search (absolutely centered) */}
      <GlobalSearchBar />

      {/* Right â€” notifications pushed to far right */}
      <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
        <NotificationBell />
      </div>
    </div>
  );
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   PAGE HEADER â€” greeting + date on left, primary CTA on right
   Mirrors the reference's "Greatings, Karla! / 7 May, 2023" header.
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const PageHeader = ({ user, onGenerate }) => {
  const today = new Date().toLocaleDateString('en-US', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const firstName = user?.firstName || 'Admin';
  return (
    <div style={{
      padding: '20px 28px 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexShrink: 0,
      gap: 16,
    }}>
      <div style={{ minWidth: 0 }}>
        <h1 style={{
          fontSize: 28, fontWeight: 700, color: T.text, margin: 0,
          letterSpacing: '-0.04em', lineHeight: 1.1,
        }}>
          Greetings, {firstName}!
        </h1>
        <div style={{
          fontSize: 13, color: T.text3, marginTop: 6, fontWeight: 500,
          letterSpacing: '-0.005em',
        }}>
          {today}
        </div>
      </div>
      <button
        onClick={onGenerate}
        className="ch-cta-btn"
        style={{
          background: `linear-gradient(135deg, ${T.accent2} 0%, ${T.accent} 60%, #6d28d9 100%)`,
          color: '#fff', border: 'none',
          padding: '11px 18px 11px 15px', borderRadius: 10,
          cursor: 'pointer', fontSize: 13, fontWeight: 700,
          fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', gap: 8,
          flexShrink: 0,
          boxShadow: '0 4px 12px -2px rgba(124, 58, 237, 0.32), 0 1px 0 rgba(255, 255, 255, 0.2) inset',
          transition: `transform 280ms ${T.ease}, box-shadow 280ms ${T.ease}, filter 280ms ${T.ease}`,
          letterSpacing: '-0.015em',
        }}
      >
        <I name="bolt" size={14} />
        <span>Generate Timetable</span>
      </button>
    </div>
  );
};

/* Status / severity label resolver (used by the data-fetching layer) */
const STATUS_LABELS = {
  ahead: 'Ahead', on_track: 'On track', at_risk: 'At risk', behind: 'Behind',
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   ADMIN BENTO â€” assembled layout

   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
   â”‚ KPI 1 â”‚ KPI 2 â”‚ KPI 3 â”‚ KPI 4         â”‚  User profile strip â”‚
   â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤  Compliance Health  â”‚
   â”‚ Subject           â”‚ Compliance       â”‚  Upcoming Events    â”‚
   â”‚ Performance       â”‚ Trend            â”‚  Jump Back In       â”‚
   â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤                     â”‚
   â”‚ Action Required (wide list)          â”‚                     â”‚
   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const AdminBento = ({ data, user, onAction, onAlert }) => (
  <div style={{
    padding: '0 28px 24px',
    display: 'grid',
    gridTemplateColumns: '1fr 320px',
    gap: 18,
    flexShrink: 0,
  }}>
    {/* â•â•â• LEFT COLUMN â•â•â• */}
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 16,
      minWidth: 0, minHeight: 0,
    }}>
      {/* Row 1 â€” KPI strip (4 cards) */}
      <KpiStrip kpis={data.kpis} />

      {/* Row 2 â€” Subject Performance + Compliance Trend */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '0.85fr 1.6fr',
        gridAutoRows: '340px',
        gap: 14,
      }}>
        <div className="ch-tile-cell d5" style={{ minWidth: 0 }}>
          <CriticalSubjectsCard
            critical={data.critical}
            onSubjectClick={() => onAction('/progress-dashboard')}
          />
        </div>
        <div className="ch-tile-cell d6" style={{ minWidth: 0 }}>
          <ComplianceTrendCard trend={data.trend} />
        </div>
      </div>

      {/* Row 3 â€” Action Required wide list */}
      <div className="ch-tile-cell d7" style={{ minHeight: 280 }}>
        <ActionRequiredCard alerts={data.alerts} onClick={onAlert} />
      </div>
    </div>

    {/* â•â•â• RIGHT COLUMN â•â•â•
       User profile strip moved out of the bento (admin name + email
       are already visible in the page header / sidebar footer). The
       freed vertical space is given to Compliance Health, which now
       gets a larger donut and bigger legend rows. */}
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 14,
      minWidth: 0,
    }}>
      <div className="ch-tile-cell d2"><ComplianceHealthCard compliance={data.compliance} /></div>
      <div className="ch-tile-cell d4"><UpcomingCard events={data.events} onClick={() => onAction('/academic-calendar')} /></div>
      <div className="ch-tile-cell d6"><JumpBackInCard items={data.recent} onClick={onAction} /></div>
    </div>
  </div>
);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   ROOT DASHBOARD
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const SEV_ORDER = { critical: 0, warning: 1, info: 2 };
const sortAlerts = (alerts) =>
  [...alerts].sort((a, b) => {
    const sevDiff = (SEV_ORDER[a.severity] ?? 9) - (SEV_ORDER[b.severity] ?? 9);
    if (sevDiff !== 0) return sevDiff;
    return (b.count ?? 0) - (a.count ?? 0);
  });

/* Empty shell rendered before/while the dashboard loads. */
const EMPTY_DATA = {
  alerts:     [],
  compliance: { ahead: 0, onTrack: 0, atRisk: 0, behind: 0 },
  critical:   [],
  events:     [],
  recent:     [],
  trend:      [],
  kpis: {
    totalClasses:     { value: 0, total: null,  delta: 0, deltaLabel: null, sublabel: 'Total classes',     icon: 'class',     color: T.accent },
    activeTimetables: { value: 0, total: null,  delta: 0, deltaLabel: null, sublabel: 'Active timetables', icon: 'timetable', color: T.blue   },
    pendingActions:   { value: 0, total: null,  delta: 0, deltaLabel: null, sublabel: 'Pending actions',   icon: 'alert',     color: T.amber, isInverted: true },
    totalSubjects:    { value: 0, total: null,  delta: 0, deltaLabel: null, sublabel: 'Total subjects',    icon: 'subject',   color: T.green  },
  },
};

/* Composite data-loader: fetches all entities, derives KPIs / bento data,
   and returns the object that previously fed setData(). */
async function loadDashboard(user) {
  const recent = getRecentItems();

  const results = await Promise.allSettled([
    classService.getAll(),
    timetableService.getAll(),
    classSubjectService.getAll(),
    calendarService.getAll(),
    leaveService.getPending(),
  ]);

  const allFailed = results.every(r => r.status === 'rejected');
  if (allFailed) return { ...EMPTY_DATA, recent }; // keep empty shell

  const [classesR, timetablesR, csR, calendarR, leaveR] = results;
      const classes    = classesR.status    === 'fulfilled' ? (classesR.value    || []) : [];
      const timetables = timetablesR.status === 'fulfilled' ? (timetablesR.value || []) : [];
      const classSubs  = csR.status         === 'fulfilled' ? (csR.value         || []) : [];
      const calendar   = calendarR.status   === 'fulfilled' ? (calendarR.value   || []) : [];
      const pendingLeaves = leaveR.status   === 'fulfilled' ? (leaveR.value.count || 0) : 0;

      const alerts = [];

      const classesWithTT = new Set(timetables.map(t => t.class?._id || t.class));
      const classesNoTT   = classes.filter(c => !classesWithTT.has(c._id));
      if (classesNoTT.length > 0) {
        alerts.push({
          severity: 'critical', count: classesNoTT.length,
          label: classesNoTT.length === 1 ? 'Class needs timetable' : 'Classes need timetable',
          subtitle: 'Schedule generation blocked',
          category: 'Scheduling', shortPath: 'Timetables',
          path: '/view-timetables',
        });
      }

      const unassigned = classSubs.filter(cs => !cs.teacher);
      if (unassigned.length > 0) {
        alerts.push({
          severity: 'warning', count: unassigned.length,
          label: unassigned.length === 1 ? 'Subject without teacher' : 'Subjects without teacher',
          subtitle: 'Timetable may be incomplete',
          category: 'Assignments', shortPath: 'Assign',
          path: '/assign-subjects',
        });
      }

      /* Leave requests */
      if (pendingLeaves > 0) {
        alerts.push({
          severity: 'warning', count: pendingLeaves,
          label: pendingLeaves === 1 ? 'Leave request pending' : 'Leave requests pending',
          subtitle: 'Teacher leave awaiting your approval',
          category: 'Leave', shortPath: 'Leaves',
          path: '/admin-leaves',
        });
      }

      const now = new Date();
      const weekLater = new Date(now); weekLater.setDate(weekLater.getDate() + 7);
      const upcoming = calendar
        .filter(e => {
          const start = new Date(e.startDate);
          return start >= now && start <= weekLater;
        })
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        .map(e => ({
          ...e,
          timeRange: e.timeRange || (e.eventType === 'holiday' ? 'Full day' : ''),
        }));

      if (upcoming.length > 0) {
        alerts.push({
          severity: 'info', count: upcoming.length,
          label: upcoming.length === 1 ? upcoming[0].title : 'Events in next 7 days',
          subtitle: 'Plan scheduling around these',
          category: 'Calendar', shortPath: 'Calendar',
          path: '/academic-calendar',
        });
      }

      const compliance = { ahead: 0, onTrack: 0, atRisk: 0, behind: 0 };
      const critical = [];

      const progressFetches = await Promise.allSettled(
        classes.slice(0, 25).map(c =>
          progressService.getByClass(c._id).then(d => ({ classObj: c, data: d }))
        )
      );

      progressFetches.forEach(r => {
        if (r.status !== 'fulfilled') return;
        const { classObj, data: progressData } = r.value;
        const subjects = progressData?.subjects || [];

        subjects.forEach(s => {
          const status = s.complianceStatus || 'on_track';
          if      (status === 'ahead')    compliance.ahead++;
          else if (status === 'on_track') compliance.onTrack++;
          else if (status === 'at_risk')  compliance.atRisk++;
          else if (status === 'behind')   compliance.behind++;

          const urgency = s.urgencyScore ?? 0;
          if (urgency >= 3.0) {
            const teacherName =
              s.teacherName ||
              (s.teacher && (s.teacher.fullName ||
                `${s.teacher.firstName || ''} ${s.teacher.lastName || ''}`.trim())) ||
              '';
            critical.push({
              subjectName: s.subjectName || s.subject?.name || 'Subject',
              className:   classObj?.name || '',
              teacherName: teacherName || undefined,
              status,
              statusLabel: STATUS_LABELS[status] || '',
              percent:     s.coveragePercentage ?? null,
              classId:     classObj?._id,
              subjectId:   s.subject?._id || s.subjectId,
              urgency,
            });
          }
        });
      });

      critical.sort((a, b) => b.urgency - a.urgency);

      if (critical.length > 0) {
        alerts.unshift({
          severity: 'critical', count: critical.length,
          label: critical.length === 1 ? 'Subject critical urgency' : 'Subjects critical urgency',
          subtitle: 'Curriculum coverage at risk',
          category: 'Mathematics', shortPath: 'Progress',
          path: '/progress-dashboard',
        });
      }

      const totalSubjects =
        compliance.ahead + compliance.onTrack + compliance.atRisk + compliance.behind;
      const pendingActions = alerts.reduce((sum, a) => sum + (a.count ?? 0), 0);
      const activeTimetables = timetables.filter(t => t.isActive !== false).length;

      const kpis = {
        totalClasses: {
          value: classes.length,
          total: null, delta: 0, deltaLabel: null,
          sublabel: 'Total classes', icon: 'class', color: T.accent,
        },
        activeTimetables: {
          value: activeTimetables,
          total: classes.length || null,
          delta: 0, deltaLabel: null,
          sublabel: 'Active timetables', icon: 'timetable', color: T.blue,
        },
        pendingActions: {
          value: pendingActions,
          total: null, delta: 0, deltaLabel: null,
          sublabel: 'Pending actions', icon: 'alert', color: T.amber,
          isInverted: true,
        },
        totalSubjects: {
          value: totalSubjects,
          total: null, delta: 0, deltaLabel: null,
          sublabel: 'Total subjects', icon: 'subject', color: T.green,
        },
      };

      // Compliance trend series (planned /metrics feature). Best-effort fetch:
      // served by the demo mock offline, 404s gracefully on backends without it.
      let trend = [];
      try {
        const t = await reportService.complianceTrend();
        trend = Array.isArray(t) ? t : (t?.trend || []);
      } catch { /* metrics endpoint not available — leave empty */ }

      return {
        alerts:     sortAlerts(alerts),
        compliance,
        critical:   critical.slice(0, 5),
        events:     upcoming,
        recent,
        kpis,
        trend,
      };
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { collapsed, toggleCollapsed } = useSidebarState();

  const { data = EMPTY_DATA } = useQuery({
    queryKey: ['dashboard', 'admin', user?._id],
    queryFn: () => loadDashboard(user),
    enabled: !!user,
  });

  const handleLogout   = () => { logout(); navigate('/login'); };
  const handleGenerate = () => navigate('/view-timetables');
  const handleAction   = (path)  => { if (path)        navigate(path); };
  const handleAlert    = (alert) => { if (alert?.path) navigate(alert.path); };

  return (
    <div className="chronos" style={{
      position: 'relative',             // anchor for the absolute TopBar overlay
      display: 'flex',                  // row layout: sidebar | main
      height: '100vh',
      overflow: 'hidden',
      background: T.bg,
      color: T.text,
      fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
      fontFeatureSettings: '"tnum" 1, "ss01" 1, "ss02" 1, "calt" 1',
      textRendering: 'optimizeLegibility',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      letterSpacing: '-0.005em',
    }}>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_STYLES }} />

      {/* Sidebar wrapper â€” starts below the absolute topbar so the
         sidebar's brand logo isn't hidden behind the frosted overlay. */}
      <div style={{
        height: `calc(100vh - ${TOPBAR_H}px)`,
        marginTop: TOPBAR_H,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <Sidebar
          user={user}
          onLogout={handleLogout}
          onNavigate={navigate}
          currentPath="/dashboard"
          navConfig={NAV}
          iconRenderer={(name, size) => <I name={name} size={size} />}
          collapsed={collapsed}
          onToggleCollapse={toggleCollapsed}
        />
      </div>

      {/* Main column â€” full viewport height. The scroll container inside
         extends to the very top of main, so as the user scrolls, page
         content slides up behind the absolutely-positioned translucent
         topbar. A 64px spacer keeps initial content below the topbar. */}
      <main style={{
        flex: 1, minWidth: 0, minHeight: 0,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        background: T.bg,
      }}>
        <div style={{
          flex: 1,
          display: 'flex', flexDirection: 'column', minHeight: 0,
          overflowY: 'auto',
        }}>
          <div style={{ height: TOPBAR_H, flexShrink: 0 }} />
          <div style={{
            maxWidth: 1480, width: '100%', margin: '0 auto',
            display: 'flex', flexDirection: 'column',
          }}>
            <PageHeader user={user} onGenerate={handleGenerate} />
            <AdminBento
              data={data}
              user={user}
              onAction={handleAction}
              onAlert={handleAlert}
            />
          </div>
        </div>
      </main>

      {/* TopBar â€” absolute overlay across the full viewport width.
         Toolbar pill on the left, notification on the right. */}
      <TopBar
        collapsed={collapsed}
        onToggleSidebar={toggleCollapsed}
      />
    </div>
  );
};

export default Dashboard;
