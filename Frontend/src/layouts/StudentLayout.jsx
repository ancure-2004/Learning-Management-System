import { theme } from '@/theme';
/**
 * StudentLayout.jsx — Chronos Student
 * Shared layout wrapper for all student pages.
 * Uses cleaned-up student NAV (no assessments, no performance, no broken routes).
 */
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Sidebar, { ActionButton, useHistoryNav, useSidebarState } from '@/layouts/Sidebar';
import NotificationBell from '@/components/NotificationBell';
import GlobalSearchBar from '@/components/GlobalSearchBar';

/* ─── Design tokens ────────────────────────────────────────────── */
const T = theme;
export { T as StudentT };

const TOPBAR_H = 64;

/* ─── Icon paths ────────────────────────────────────────────────── */
const ICON_PATHS = {
  overview:  'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
  timetable: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
  subject:   'M4 19.5v-15A2.5 2.5 0 016.5 2H20v20H6.5a2.5 2.5 0 010-5H20',
  check:     'M20 6L9 17l-5-5',
  rating:    'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  calendar:  'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
  bell:      'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0',
  sidebar:   'M3 4h18a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1z M9 4v16',
  back:      'M15 18l-6-6 6-6',
  forward:   'M9 18l6-6-6-6',
  alert:     'M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
  info:      'M12 16v-4M12 8h.01M22 12A10 10 0 1112 2a10 10 0 0110 10z',
  close:     'M18 6L6 18M6 6l12 12',
  chev:      'M9 18l6-6-6-6',
  chevDown:  'M6 9l6 6 6-6',
  progress:  'M22 12h-4l-3 9L9 3l-3 9H2',
  flag:      'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22V15',
  book:      'M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z',
  teacher:   'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z',
  room:      'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z',
  class:     'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm14 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
};

const Icon = ({ name, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0, display: 'block' }}>
    <path d={ICON_PATHS[name] || ICON_PATHS.overview} />
  </svg>
);
export { Icon as StudentIcon };

/* ─── Cleaned-up Student NAV (no broken routes) ─────────────────── */
export const STUDENT_NAV = [
  {
    section: null,
    items: [{ label: 'Overview', icon: 'overview', path: '/student-dashboard', pinned: true }],
  },
  {
    section: 'Academic',
    items: [
      { label: 'Timetable', icon: 'timetable', path: '/student-timetable', pinned: true },
      { label: 'Subjects',  icon: 'subject',   path: '/student-subjects',  pinned: true },
    ],
  },
  {
    section: 'Insights',
    items: [
      { label: 'Attendance',    icon: 'check',  path: '/student-attendance', pinned: true },
      { label: 'Rate Teachers', icon: 'rating', path: '/rate-teachers' },
    ],
  },
  {
    section: 'Resources',
    items: [
      { label: 'Calendar', icon: 'calendar', path: '/student-calendar', pinned: true },
      { label: 'Holidays', icon: 'flag',     path: '/student-holidays' },
      { label: 'Notices',  icon: 'bell',     path: '/student-notices'  },
    ],
  },
];


const GLOBAL = `
@keyframes student-fade-up {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes student-toast-in {
  from { opacity: 0; transform: translateY(-10px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.ch-student *::-webkit-scrollbar { width: 6px; height: 6px; }
.ch-student *::-webkit-scrollbar-track { background: transparent; }
.ch-student *::-webkit-scrollbar-thumb { background: rgba(15,23,42,0.10); border-radius: 3px; }
.ch-student *::-webkit-scrollbar-thumb:hover { background: rgba(15,23,42,0.18); }
.ch-student-row { transition: background 220ms cubic-bezier(0.4,0,0.2,1); }
.ch-student-row:hover { background: rgba(15,23,42,0.025) !important; }
`;

/* ─── TopBar ─────────────────────────────────────────────────────── */
const TopBar = ({ collapsed, onToggleSidebar }) => {
  const { canBack, canForward, goBack, goForward } = useHistoryNav();
  return (
    <div style={{
      height: TOPBAR_H, padding: '0 20px',
      display: 'flex', alignItems: 'center',
      background: 'rgba(238,240,245,0.98)',
      borderBottom: '1px solid rgba(15,23,42,0.06)',
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 3,
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: 14, padding: '7px 9px',
        boxShadow: '0 4px 14px rgba(15,23,42,0.08), 0 1px 0 rgba(255,255,255,0.7) inset',
        flexShrink: 0,
      }}>
        <ActionButton icon="sidebar" label={collapsed ? 'Expand' : 'Collapse'} onClick={onToggleSidebar} />
        <ActionButton icon="back"    label="Go back"    onClick={goBack}    disabled={!canBack} />
        <ActionButton icon="forward" label="Go forward" onClick={goForward} disabled={!canForward} />
      </div>
      <GlobalSearchBar />
      <div style={{ marginLeft: 'auto', flexShrink: 0 }}><NotificationBell /></div>
    </div>
  );
};

/* ─── PageHeader ─────────────────────────────────────────────────── */
const PageHeader = ({ title, subtitle, actions }) => (
  <div style={{
    padding: '22px 28px 18px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    flexShrink: 0, gap: 16,
    animation: 'student-fade-up 500ms cubic-bezier(0.16,1,0.3,1) both',
  }}>
    <div style={{ minWidth: 0 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: T.text, margin: 0, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
        {title}
      </h1>
      {subtitle && (
        <div style={{ fontSize: 13, color: T.text3, marginTop: 5, fontWeight: 500 }}>
          {subtitle}
        </div>
      )}
    </div>
    {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>{actions}</div>}
  </div>
);

/* ─── StudentLayout (default export) ────────────────────────────── */
const StudentLayout = ({ title, subtitle, actions, children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { collapsed, toggleCollapsed } = useSidebarState();

  const handleLogout = () => { logout(); navigate('/login'); };
  const renderIcon   = (name, size) => <Icon name={name} size={size} />;

  return (
    <div className="ch-student" style={{
      position: 'relative', display: 'flex', height: '100vh', overflow: 'hidden',
      background: T.bg, color: T.text,
      fontFamily: T.font,
      fontFeatureSettings: '"tnum" 1,"ss01" 1,"ss02" 1,"calt" 1',
      textRendering: 'optimizeLegibility',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      letterSpacing: '-0.005em',
    }}>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL }} />

      {/* Sidebar */}
      <div style={{
        height: `calc(100vh - ${TOPBAR_H}px)`,
        marginTop: TOPBAR_H, flexShrink: 0,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <Sidebar
          user={user}
          onLogout={handleLogout}
          onNavigate={navigate}
          currentPath={location.pathname}
          navConfig={STUDENT_NAV}
          iconRenderer={renderIcon}
          collapsed={collapsed}
          onToggleCollapse={toggleCollapsed}
        />
      </div>

      {/* Main */}
      <main style={{
        flex: 1, minWidth: 0, minHeight: 0,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', background: T.bg,
      }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflowY: 'auto' }}>
          <div style={{ height: TOPBAR_H, flexShrink: 0 }} />
          <div style={{
            maxWidth: 1480, width: '100%', margin: '0 auto',
            display: 'flex', flexDirection: 'column', flex: 1, padding: '0 0 32px',
          }}>
            <PageHeader title={title} subtitle={subtitle} actions={actions} />
            {children}
          </div>
        </div>
      </main>

      <TopBar collapsed={collapsed} onToggleSidebar={toggleCollapsed} />
    </div>
  );
};

export default StudentLayout;

/* ─── Shared primitives ─────────────────────────────────────────── */
export const StudentCard = ({ children, style, ...rest }) => (
  <div style={{
    background: T.surface, border: `1px solid ${T.border}`,
    borderRadius: 24, padding: '20px 24px',
    boxShadow: T.shadowCard, minWidth: 0, ...style,
  }} {...rest}>
    {children}
  </div>
);

export const StudentEmptyState = ({ icon = 'info', message, subtext }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '60px 24px', gap: 12, color: T.text3,
  }}>
    <div style={{
      width: 48, height: 48, borderRadius: 14,
      background: T.accentSoft, color: T.accent,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon name={icon} size={22} />
    </div>
    <div style={{ fontSize: 14, fontWeight: 600, color: T.text2, letterSpacing: '-0.02em' }}>{message}</div>
    {subtext && (
      <div style={{ fontSize: 12, fontWeight: 500, color: T.text3, textAlign: 'center', maxWidth: 300 }}>{subtext}</div>
    )}
  </div>
);

export const StudentSpinner = ({ text = 'Loading…' }) => (
  <div style={{ padding: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
    <div style={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid ${T.accentSoft}`, borderTopColor: T.accent, animation: 'spin 0.7s linear infinite' }} />
    <span style={{ fontSize: 13, color: T.text3, fontWeight: 500 }}>{text}</span>
  </div>
);
