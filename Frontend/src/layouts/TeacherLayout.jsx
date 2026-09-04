/**
 * TeacherLayout.jsx — Chronos
 * ─────────────────────────────────────────────────────────────────────────
 * Shared layout wrapper for every teacher page.
 * Provides the teacher-specific sidebar NAV (no admin tools visible).
 * Import and wrap any teacher page with <TeacherLayout title="…">.
 * ─────────────────────────────────────────────────────────────────────────
 */
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Sidebar, { ActionButton, useHistoryNav, useSidebarState } from '@/layouts/Sidebar';
import { T } from '@/layouts/AdminLayout';
import NotificationBell from '@/components/NotificationBell';
import GlobalSearchBar from '@/components/GlobalSearchBar';

const TOPBAR_H = 64;

/* ─── Teacher-only icon paths ─────────────────────────────────── */
const ICON_PATHS = {
  overview:  'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
  timetable: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
  class:     'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm14 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  log:       'M4 4h16v16H4z M4 8h16 M9 13h6 M9 17h6',
  syllabus:  'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  grade:     'M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2 M9 2h6v4H9z M9 14l2 2 4-4',
  progress:  'M22 12h-4l-3 9L9 3l-3 9H2',
  rating:    'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  star:      'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  calendar:  'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
  bell:      'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0',
  sidebar:   'M3 4h18a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1z M9 4v16',
  back:      'M15 18l-6-6 6-6',
  forward:   'M9 18l6-6-6-6',
  check:     'M20 6L9 17l-5-5',
  plus:      'M12 5v14M5 12h14',
  search:    'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  alert:     'M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
  info:      'M12 16v-4M12 8h.01M22 12A10 10 0 1112 2a10 10 0 0110 10z',
  report:    'M3 3v18h18 M7 14l4-4 4 4 5-5',
  teacher:   'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z',
  subject:   'M4 19.5v-15A2.5 2.5 0 016.5 2H20v20H6.5a2.5 2.5 0 010-5H20',
  chev:      'M9 18l6-6-6-6',
  chevDown:  'M6 9l6 6 6-6',
  trash:     'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
  close:     'M18 6L6 18M6 6l12 12',
  arrow:     'M5 12h14m-6-6l6 6-6 6',
};

const Icon = ({ name, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0, display: 'block' }}>
    <path d={ICON_PATHS[name] || ICON_PATHS.overview} />
  </svg>
);

/* ─── Teacher NAV — only teacher-relevant pages ───────────────── */
export const TEACHER_NAV = [
  {
    section: null,
    items: [{ label: 'Overview', icon: 'overview', path: '/teacher-dashboard', pinned: true }],
  },
  {
    section: 'Teaching',
    items: [
      { label: 'My Schedule',     icon: 'timetable', path: '/teacher-timetable',     pinned: true },
      { label: 'My Classes',      icon: 'class',     path: '/teacher-classes',       pinned: true },
      { label: 'Log Session',     icon: 'log',       path: '/log-session',           pinned: true },
      { label: 'My Syllabus',     icon: 'syllabus',  path: '/manage-syllabus',       pinned: true },
    ],
  },
  {
    section: 'Attendance',
    items: [
      { label: 'Mark Attendance', icon: 'check',    path: '/mark-attendance', pinned: true },
      { label: 'Leave Application', icon: 'calendar', path: '/teacher-leave',  pinned: true },
    ],
  },
  {
    section: 'Feedback',
    items: [
      { label: 'My Ratings', icon: 'star',     path: '/teacher-performance', pinned: true },
      { label: 'Calendar',   icon: 'calendar', path: '/teacher-calendar' },
    ],
  },
];


const GLOBAL = `
@keyframes teacher-fade-up {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes teacher-drawer-in {
  from { opacity: 0; transform: translateX(24px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes teacher-overlay-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes teacher-toast-in {
  from { opacity: 0; transform: translateY(-10px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.ch-teacher-row {
  transition: background 220ms cubic-bezier(0.4,0,0.2,1);
}
.ch-teacher-row:hover { background: rgba(15,23,42,0.025) !important; }
.ch-teacher-btn {
  transition: all 220ms cubic-bezier(0.4,0,0.2,1);
}
.ch-teacher-btn:hover { transform: translateY(-1px); filter: brightness(1.06); }
.ch-teacher-btn:active { transform: translateY(0) scale(0.98); }
.ch-teacher *::-webkit-scrollbar { width: 6px; height: 6px; }
.ch-teacher *::-webkit-scrollbar-track { background: transparent; }
.ch-teacher *::-webkit-scrollbar-thumb { background: rgba(15,23,42,0.10); border-radius: 3px; }
.ch-teacher *::-webkit-scrollbar-thumb:hover { background: rgba(15,23,42,0.18); }
.ch-teacher input:focus, .ch-teacher select:focus, .ch-teacher textarea:focus {
  outline: 2px solid rgba(124,58,237,0.35) !important;
  outline-offset: 0px !important;
  border-color: rgba(124,58,237,0.55) !important;
}
`;

/* ─── TopBar ─────────────────────────────────────────────────── */
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
        boxShadow: '0 4px 14px rgba(15,23,42,0.08), 0 1px 3px rgba(15,23,42,0.06), 0 1px 0 rgba(255,255,255,0.7) inset',
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

/* ─── Page Header ────────────────────────────────────────────── */
const PageHeader = ({ title, subtitle, actions }) => (
  <div style={{
    padding: '22px 28px 18px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    flexShrink: 0, gap: 16,
    animation: 'teacher-fade-up 500ms cubic-bezier(0.16,1,0.3,1) both',
  }}>
    <div style={{ minWidth: 0 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: T.text, margin: 0, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
        {title}
      </h1>
      {subtitle && (
        <div style={{ fontSize: 13, color: T.text3, marginTop: 5, fontWeight: 500, letterSpacing: '-0.005em' }}>
          {subtitle}
        </div>
      )}
    </div>
    {actions && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {actions}
      </div>
    )}
  </div>
);

/* ─── TeacherLayout (default export) ─────────────────────────── */
const TeacherLayout = ({ title, subtitle, actions, children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { collapsed, toggleCollapsed } = useSidebarState();

  const handleLogout = () => { logout(); navigate('/login'); };
  const renderIcon  = (name, size) => <Icon name={name} size={size} />;

  return (
    <div className="ch-teacher" style={{
      position: 'relative',
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      background: T.bg,
      color: T.text,
      fontFamily: "'Plus Jakarta Sans','Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif",
      fontFeatureSettings: '"tnum" 1,"ss01" 1,"ss02" 1,"calt" 1',
      textRendering: 'optimizeLegibility',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      letterSpacing: '-0.005em',
    }}>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL }} />

      {/* ─── Sidebar ─────────────────────────────────────────── */}
      <div style={{
        height: `calc(100vh - ${TOPBAR_H}px)`,
        marginTop: TOPBAR_H,
        flexShrink: 0,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <Sidebar
          user={user}
          onLogout={handleLogout}
          onNavigate={navigate}
          currentPath={location.pathname}
          navConfig={TEACHER_NAV}
          iconRenderer={renderIcon}
          collapsed={collapsed}
          onToggleCollapse={toggleCollapsed}
        />
      </div>

      {/* ─── Main ────────────────────────────────────────────── */}
      <main style={{
        flex: 1, minWidth: 0, minHeight: 0,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', background: T.bg,
      }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflowY: 'auto' }}>
          <div style={{ height: TOPBAR_H, flexShrink: 0 }} />
          <div style={{
            maxWidth: 1480, width: '100%', margin: '0 auto',
            display: 'flex', flexDirection: 'column', flex: 1,
            padding: '0 0 32px',
          }}>
            <PageHeader title={title} subtitle={subtitle} actions={actions} />
            {children}
          </div>
        </div>
      </main>

      {/* ─── TopBar Overlay ──────────────────────────────────── */}
      <TopBar collapsed={collapsed} onToggleSidebar={toggleCollapsed} />
    </div>
  );
};

export default TeacherLayout;

/* ─── Shared UI primitives for teacher pages ─────────────────── */
export { Icon as TeacherIcon };

export const TeacherCard = ({ children, style, ...rest }) => (
  <div style={{
    background: T.surface, border: `1px solid ${T.border}`,
    borderRadius: 24, padding: '20px 24px',
    boxShadow: T.shadowCard, minWidth: 0, ...style,
  }} {...rest}>
    {children}
  </div>
);

export const TeacherPrimaryBtn = ({ children, onClick, disabled, style, icon }) => (
  <button onClick={onClick} disabled={disabled} className="ch-teacher-btn" style={{
    background: disabled
      ? T.surfaceMuted
      : `linear-gradient(135deg,${T.accent2} 0%,${T.accent} 60%,#6d28d9 100%)`,
    color: disabled ? T.text3 : '#fff',
    border: 'none', padding: '10px 18px', borderRadius: 10,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
    display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0,
    boxShadow: disabled ? 'none' : '0 4px 12px -2px rgba(124,58,237,0.30)',
    letterSpacing: '-0.015em', ...style,
  }}>
    {icon && <Icon name={icon} size={14} />}
    {children}
  </button>
);

export const TeacherEmptyState = ({ icon = 'info', message, subtext }) => (
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
    <div style={{ fontSize: 14, fontWeight: 600, color: T.text2, letterSpacing: '-0.02em' }}>
      {message}
    </div>
    {subtext && (
      <div style={{ fontSize: 12, fontWeight: 500, color: T.text3, textAlign: 'center', maxWidth: 300 }}>
        {subtext}
      </div>
    )}
  </div>
);

export const TeacherSpinner = ({ text = 'Loading…' }) => (
  <div style={{ padding: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
    <div style={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid ${T.accentSoft}`, borderTopColor: T.accent, animation: 'spin 0.7s linear infinite' }} />
    <span style={{ fontSize: 13, color: T.text3, fontWeight: 500 }}>{text}</span>
  </div>
);

export const TeacherToast = ({ message, type = 'success', onClose }) => {
  React.useEffect(() => {
    const t = setTimeout(onClose, 3800);
    return () => clearTimeout(t);
  }, [onClose]);
  const isErr = type === 'error';
  return (
    <div style={{
      position: 'fixed', top: 20, right: 24, zIndex: 200,
      display: 'flex', alignItems: 'center', gap: 10,
      background: T.surface, border: `1px solid ${isErr ? T.red+'33' : T.green+'33'}`,
      borderRadius: 14, padding: '12px 16px',
      boxShadow: '0 8px 30px rgba(15,23,42,0.14)',
      animation: 'teacher-toast-in 360ms cubic-bezier(0.16,1,0.3,1)',
      maxWidth: 380, fontFamily: 'inherit',
    }}>
      <div style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, background: isErr ? T.redSoft : T.greenSoft, color: isErr ? T.red : T.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={isErr ? 'alert' : 'check'} size={15} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: T.text, flex: 1, letterSpacing: '-0.01em' }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.text3, display: 'flex', padding: 2, fontFamily: 'inherit' }}>
        <Icon name="close" size={13} />
      </button>
    </div>
  );
};
