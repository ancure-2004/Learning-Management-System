import { theme } from '@/theme';
/**
 * AdminLayout.jsx
 * ─────────────────────────────────────────────────────────────────────────
 * Shared layout wrapper for every admin page.
 * Provides: dark sidebar · frosted-glass topbar · scrollable main area.
 * Each admin page just renders <AdminLayout title="…" actions={<…>}>.
 *
 * Also exports:
 *   T          — design tokens (keep in sync with Dashboard.jsx)
 *   NAV        — sidebar nav config (same shape as Dashboard)
 *   ChIcon     — SVG icon component
 *   trackRecent— localStorage helper (same key as Dashboard)
 * ─────────────────────────────────────────────────────────────────────────
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Sidebar, { ActionButton, useHistoryNav, useSidebarState } from '@/layouts/Sidebar';
import NotificationBell from '@/components/NotificationBell';
import GlobalSearchBar from '@/components/GlobalSearchBar';

/* ─── GLOBAL FONT INJECTION ─────────────────────────────────────────── */
const FONT_STYLE = `
`;

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS  (must stay in sync with Dashboard.jsx)
   ═══════════════════════════════════════════════════════════════ */
export const T = theme;

/* ═══════════════════════════════════════════════════════════════
   ICON RENDERER
   ═══════════════════════════════════════════════════════════════ */
const ICON_PATHS = {
  overview:  'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
  dept:      'M3 21V8l9-5 9 5v13M9 21V12h6v9',
  program:   'M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z',
  class:     'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm14 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  subject:   'M4 19.5v-15A2.5 2.5 0 016.5 2H20v20H6.5a2.5 2.5 0 010-5H20',
  teacher:   'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z',
  room:      'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z',
  timetable: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
  users:     'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm14 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  syllabus:  'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  progress:  'M22 12h-4l-3 9L9 3l-3 9H2',
  rating:    'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  report:    'M3 3v18h18 M7 14l4-4 4 4 5-5',
  calendar:  'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
  bell:      'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0',
  search:    'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  plus:      'M12 5v14M5 12h14',
  close:     'M18 6L6 18M6 6l12 12',
  edit:      'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
  trash:     'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
  check:     'M20 6L9 17l-5-5',
  alert:     'M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
  filter:    'M22 3H2l8 9.46V19l4 2v-8.54z',
  arrow:     'M5 12h14m-6-6l6 6-6 6',
  chev:      'M9 18l6-6-6-6',
  chevDown:  'M6 9l6 6 6-6',
  info:      'M12 16v-4M12 8h.01M22 12A10 10 0 1112 2a10 10 0 0110 10z',
  bolt:      'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
};

export const ChIcon = ({ name, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0, display: 'block' }}>
    <path d={ICON_PATHS[name] || ICON_PATHS.overview} />
  </svg>
);

/* ═══════════════════════════════════════════════════════════════
   NAV CONFIG  (same as Dashboard.jsx)
   ═══════════════════════════════════════════════════════════════ */
export const NAV = [
  {
    section: null,
    items: [{ label: 'Overview', icon: 'overview', path: '/dashboard', pinned: true }],
  },
  {
    section: 'Academic',
    items: [
      { label: 'Departments', icon: 'dept',    path: '/departments' },
      { label: 'Programs',    icon: 'program', path: '/programs' },
      { label: 'Classes',     icon: 'class',   path: '/academic-resources', pinned: true },
      { label: 'Subjects',    icon: 'subject', path: '/subjects',           pinned: true },
      { label: 'Teachers',    icon: 'teacher', path: '/teachers',           pinned: true },
      { label: 'Classrooms',  icon: 'room',    path: '/classrooms' },
    ],
  },
  {
    section: 'Scheduling',
    items: [
      { label: 'Assignments', icon: 'syllabus',  path: '/assign-subjects'                  },
      { label: 'Timetables',  icon: 'timetable', path: '/schedule',          pinned: true  },
      { label: 'Calendar',    icon: 'calendar',  path: '/academic-calendar', pinned: true  },
    ],
  },
  {
    section: 'Insights',
    items: [
      { label: 'Progress',    icon: 'progress', path: '/insights',            pinned: true  },
      { label: 'Performance', icon: 'rating',   path: '/teacher-performance'              },
      { label: 'Reports',     icon: 'report',   path: '/reports',             pinned: true  },
    ],
  },
  {
    section: 'System',
    items: [
      { label: 'Users',    icon: 'users',   path: '/users' },
      { label: 'Syllabus', icon: 'syllabus',path: '/manage-syllabus' },
      { label: 'Leave Requests', icon: 'calendar', path: '/admin-leaves', pinned: true },
    ],
  },
];

/* ─── RECENT TRACKING UTIL ──────────────────────────────────── */
const RECENT_KEY = 'chronos.admin.recent';
export const trackRecent = (label, path, icon = 'overview') => {
  try {
    const raw  = localStorage.getItem(RECENT_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const filtered = list.filter(r => r.path !== path);
    filtered.unshift({ label, path, icon, timestamp: Date.now() });
    localStorage.setItem(RECENT_KEY, JSON.stringify(filtered.slice(0, 12)));
  } catch (_) {}
};

/* ═══════════════════════════════════════════════════════════════
   GLOBAL STYLES  (keyframes + scrollbar polish)
   ═══════════════════════════════════════════════════════════════ */
const GLOBAL = `
@keyframes admin-fade-up {
  from { opacity:0; transform:translateY(8px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes admin-drawer-in {
  from { opacity:0; transform:translateX(24px); }
  to   { opacity:1; transform:translateX(0); }
}
@keyframes admin-overlay-in {
  from { opacity:0; }
  to   { opacity:1; }
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes admin-toast-in {
  from { opacity:0; transform:translateY(-10px) scale(0.96); }
  to   { opacity:1; transform:translateY(0) scale(1); }
}
.ch-admin-row {
  transition: background 220ms cubic-bezier(0.4,0,0.2,1);
}
.ch-admin-row:hover { background: rgba(15,23,42,0.025) !important; }
.ch-admin-btn {
  transition: all 220ms cubic-bezier(0.4,0,0.2,1);
}
.ch-admin-btn:hover {
  transform: translateY(-1px);
  filter: brightness(1.06);
}
.ch-admin-btn:active { transform: translateY(0) scale(0.98); }

/* Scrollbars */
.ch-admin *::-webkit-scrollbar { width:6px; height:6px; }
.ch-admin *::-webkit-scrollbar-track { background:transparent; }
.ch-admin *::-webkit-scrollbar-thumb { background:rgba(15,23,42,0.10); border-radius:3px; }
.ch-admin *::-webkit-scrollbar-thumb:hover { background:rgba(15,23,42,0.18); }

/* Input focus ring */
.ch-admin input:focus, .ch-admin select:focus, .ch-admin textarea:focus {
  outline: 2px solid rgba(124,58,237,0.35) !important;
  outline-offset: 0px !important;
  border-color: rgba(124,58,237,0.55) !important;
}
`;

/* ═══════════════════════════════════════════════════════════════
   TOP BAR  (frosted-glass, same as Dashboard)
   ═══════════════════════════════════════════════════════════════ */
const TopBar = ({ collapsed, onToggleSidebar }) => {
  const { canBack, canForward, goBack, goForward } = useHistoryNav();
  return (
    <div style={{
      height: T.TOPBAR_H,
      padding: '0 20px',
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
        <ActionButton icon="sidebar"  label={collapsed ? 'Expand' : 'Collapse'} onClick={onToggleSidebar} />
        <ActionButton icon="back"    label="Go back"    onClick={goBack}    disabled={!canBack} />
        <ActionButton icon="forward" label="Go forward" onClick={goForward} disabled={!canForward} />
      </div>

      <GlobalSearchBar />

      <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
        <NotificationBell />
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PAGE HEADER (title + subtitle + actions row)
   ═══════════════════════════════════════════════════════════════ */
const PageHeader = ({ title, subtitle, actions }) => (
  <div style={{
    padding: '22px 28px 18px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    flexShrink: 0, gap: 16,
    animation: 'admin-fade-up 500ms cubic-bezier(0.16,1,0.3,1) both',
  }}>
    <div style={{ minWidth: 0 }}>
      <h1 style={{
        fontSize: 28, fontWeight: 700, color: T.text, margin: 0,
        letterSpacing: '-0.04em', lineHeight: 1.1,
      }}>
        {title}
      </h1>
      {subtitle && (
        <div style={{
          fontSize: 13, color: T.text3, marginTop: 5, fontWeight: 500,
          letterSpacing: '-0.005em',
        }}>
          {subtitle}
        </div>
      )}
    </div>
    {actions && (
      <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
        {actions}
      </div>
    )}
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   ADMIN LAYOUT  (default export)
   Props:
     title      string        – page heading
     subtitle   string?       – muted subheading
     actions    ReactNode?    – right-side header buttons
     children   ReactNode     – page body
     currentPath string?      – auto-detected if omitted
   ═══════════════════════════════════════════════════════════════ */
const AdminLayout = ({ title, subtitle, actions, children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { collapsed, toggleCollapsed } = useSidebarState();

  const handleLogout = () => { logout(); navigate('/login'); };

  /* Track this page visit in "Jump Back In" */
  useEffect(() => {
    if (title) trackRecent(title, location.pathname, 'overview');
  }, [location.pathname]);   // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="ch-admin" style={{
      position: 'relative',
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      background: T.bg,
      color: T.text,
      fontFamily: T.font,
      fontFeatureSettings: '"tnum" 1,"ss01" 1,"ss02" 1,"calt" 1',
      textRendering: 'optimizeLegibility',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      letterSpacing: '-0.005em',
    }}>
      <style dangerouslySetInnerHTML={{ __html: FONT_STYLE + GLOBAL }} />

      {/* ─── SIDEBAR ─────────────────────────────────────────── */}
      <div style={{
        height: `calc(100vh - ${T.TOPBAR_H}px)`,
        marginTop: T.TOPBAR_H,
        flexShrink: 0,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <Sidebar
          user={user}
          onLogout={handleLogout}
          onNavigate={navigate}
          currentPath={location.pathname}
          navConfig={NAV}
          iconRenderer={(name, size) => <ChIcon name={name} size={size} />}
          collapsed={collapsed}
          onToggleCollapse={toggleCollapsed}
        />
      </div>

      {/* ─── MAIN ────────────────────────────────────────────── */}
      <main style={{
        flex: 1, minWidth: 0, minHeight: 0,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', background: T.bg,
      }}>
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0,
          overflowY: 'auto',
        }}>
          {/* spacer so content starts below frosted topbar */}
          <div style={{ height: T.TOPBAR_H, flexShrink: 0 }} />

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

      {/* ─── TOP BAR OVERLAY ─────────────────────────────────── */}
      <TopBar collapsed={collapsed} onToggleSidebar={toggleCollapsed} />
    </div>
  );
};

export default AdminLayout;

/* ═══════════════════════════════════════════════════════════════
   SHARED UI PRIMITIVES — exported for use in admin pages
   ═══════════════════════════════════════════════════════════════ */

/** White rounded card */
export const Card = ({ children, style, ...rest }) => (
  <div style={{
    background: T.surface, border: `1px solid ${T.border}`,
    borderRadius: 24, padding: '20px 24px',
    boxShadow: T.shadowCard, minWidth: 0, ...style,
  }} {...rest}>
    {children}
  </div>
);

/** Gradient primary button */
export const PrimaryBtn = ({ children, onClick, disabled, style, icon }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="ch-admin-btn"
    style={{
      background: disabled
        ? T.surfaceMuted
        : `linear-gradient(135deg,${T.accent2} 0%,${T.accent} 60%,#6d28d9 100%)`,
      color: disabled ? T.text3 : '#fff',
      border: 'none',
      padding: '10px 18px 10px 15px', borderRadius: 10,
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
      display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0,
      boxShadow: disabled ? 'none' : '0 4px 12px -2px rgba(124,58,237,0.30)',
      letterSpacing: '-0.015em',
      ...style,
    }}
  >
    {icon && <ChIcon name={icon} size={14} />}
    {children}
  </button>
);

/** Ghost/secondary button */
export const GhostBtn = ({ children, onClick, style, icon, color }) => (
  <button
    onClick={onClick}
    style={{
      background: 'transparent',
      color: color || T.text2,
      border: `1px solid ${T.border}`,
      padding: '9px 15px', borderRadius: 10,
      cursor: 'pointer', fontSize: 13, fontWeight: 600,
      fontFamily: 'inherit',
      display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0,
      letterSpacing: '-0.01em',
      transition: `all 200ms ${T.ease}`,
      ...style,
    }}
    onMouseEnter={e => { e.currentTarget.style.background=T.surfaceMuted; e.currentTarget.style.borderColor=T.borderHi; }}
    onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor=T.border; }}
  >
    {icon && <ChIcon name={icon} size={14} />}
    {children}
  </button>
);

/** Danger icon button (delete) */
export const DangerBtn = ({ onClick, title = 'Delete' }) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      width: 30, height: 30, borderRadius: 8,
      background: 'transparent', border: 'none',
      color: T.text3, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: `all 200ms ${T.ease}`, fontFamily: 'inherit',
    }}
    onMouseEnter={e => { e.currentTarget.style.background=T.redSoft; e.currentTarget.style.color=T.red; }}
    onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color=T.text3; }}
  >
    <ChIcon name="trash" size={14} />
  </button>
);

/** Edit icon button */
export const EditBtn = ({ onClick, title = 'Edit' }) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      width: 30, height: 30, borderRadius: 8,
      background: 'transparent', border: 'none',
      color: T.text3, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: `all 200ms ${T.ease}`, fontFamily: 'inherit',
    }}
    onMouseEnter={e => { e.currentTarget.style.background=T.accentSoft; e.currentTarget.style.color=T.accent; }}
    onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color=T.text3; }}
  >
    <ChIcon name="edit" size={14} />
  </button>
);

/** Form field input */
export const Field = ({ label, required, children, hint }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
    <label style={{
      fontSize: 12, fontWeight: 600, color: T.text2,
      letterSpacing: '-0.005em',
    }}>
      {label}{required && <span style={{ color:T.red, marginLeft:3 }}>*</span>}
    </label>
    {children}
    {hint && (
      <span style={{ fontSize:11, color:T.text3, fontWeight:500 }}>{hint}</span>
    )}
  </div>
);

/** Styled input */
export const Input = ({ style, ...props }) => (
  <input
    {...props}
    style={{
      width: '100%', boxSizing: 'border-box',
      padding: '9px 12px', borderRadius: 10,
      border: `1px solid ${T.border}`,
      background: T.surfaceMuted, color: T.text,
      fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
      letterSpacing: '-0.005em',
      transition: `border-color 200ms ${T.ease}, background 200ms ${T.ease}`,
      outline: 'none',
      ...style,
    }}
  />
);

/** Styled custom select (replaces plain browser <select>) */
export const Select = ({ children, style, value, onChange, disabled, ...props }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  // Parse option children into [{value, label, disabled}]
  const options = React.useMemo(() => {
    const parse = (nodes) => {
      const result = [];
      React.Children.forEach(nodes, child => {
        if (!child) return;
        if (child.type === 'option') {
          result.push({ value: child.props.value ?? '', label: child.props.children, disabled: child.props.disabled });
        } else if (child.type === 'optgroup') {
          result.push(...parse(child.props.children));
        }
      });
      return result;
    };
    return parse(children);
  }, [children]);

  const selected = options.find(o => String(o.value) === String(value)) || options[0];

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const pick = (opt) => {
    if (opt.disabled) return;
    onChange?.({ target: { value: opt.value } });
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', boxSizing: 'border-box', ...style }}>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '9px 36px 9px 12px', borderRadius: 10,
          border: `1.5px solid ${open ? T.accent : T.border}`,
          background: open ? T.surface : T.surfaceMuted,
          color: selected?.value === '' ? T.text3 : T.text,
          fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
          letterSpacing: '-0.005em', textAlign: 'left',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none', display: 'flex', alignItems: 'center',
          boxShadow: open ? `0 0 0 3px ${T.accentSoft}` : 'none',
          transition: `all 200ms ${T.ease}`,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}
      >
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected?.label ?? '—'}
        </span>
        {/* Chevron */}
        <span style={{
          position: 'absolute', right: 10, top: '50%', transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`,
          transition: `transform 200ms ${T.ease}`, color: T.text3, display: 'flex', pointerEvents: 'none',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 9999,
          background: T.surface,
          border: `1.5px solid ${T.accentBorder}`,
          borderRadius: 14,
          boxShadow: '0 8px 32px rgba(15,23,42,0.14), 0 2px 8px rgba(15,23,42,0.08)',
          overflow: 'hidden',
          animation: 'admin-fade-up 160ms cubic-bezier(0.16,1,0.3,1)',
          maxHeight: 280, overflowY: 'auto',
        }}>
          {options.map((opt, i) => {
            const isCurrent = String(opt.value) === String(value);
            const isPlaceholder = opt.value === '' || opt.value === null || opt.value === undefined;
            return (
              <div
                key={i}
                onMouseDown={(e) => { e.preventDefault(); pick(opt); }}
                style={{
                  padding: '10px 14px',
                  fontSize: 13, fontWeight: isCurrent ? 700 : 500,
                  color: opt.disabled ? T.text4 : isPlaceholder ? T.text3 : isCurrent ? T.accent : T.text,
                  background: isCurrent ? T.accentSoft : 'transparent',
                  cursor: opt.disabled ? 'not-allowed' : 'pointer',
                  letterSpacing: '-0.01em',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  borderBottom: i < options.length - 1 ? `1px solid ${T.divider}` : 'none',
                  transition: `background 120ms ease`,
                }}
                onMouseEnter={e => { if (!isCurrent && !opt.disabled) e.currentTarget.style.background = T.surfaceMuted; }}
                onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.background = isCurrent ? T.accentSoft : 'transparent'; }}
              >
                <span>{opt.label}</span>
                {isCurrent && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/** Styled textarea */
export const Textarea = ({ style, ...props }) => (
  <textarea
    {...props}
    style={{
      width: '100%', boxSizing: 'border-box',
      padding: '9px 12px', borderRadius: 10,
      border: `1px solid ${T.border}`,
      background: T.surfaceMuted, color: T.text,
      fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
      letterSpacing: '-0.005em', resize: 'vertical',
      transition: `border-color 200ms ${T.ease}`,
      outline: 'none',
      ...style,
    }}
  />
);

/** Toast notification (success / error) */
export const Toast = ({ message, type = 'success', onClose }) => {
  const isErr = type === 'error';
  useEffect(() => {
    const t = setTimeout(onClose, 3800);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div style={{
      position:'fixed', top:20, right:24, zIndex:200,
      display:'flex', alignItems:'center', gap:10,
      background: T.surface, border:`1px solid ${isErr ? T.red+'33' : T.green+'33'}`,
      borderRadius:14, padding:'12px 16px',
      boxShadow:'0 8px 30px rgba(15,23,42,0.14)',
      animation:'admin-toast-in 360ms cubic-bezier(0.16,1,0.3,1)',
      maxWidth:380, fontFamily:T.font,
    }}>
      <div style={{
        width:30, height:30, borderRadius:9, flexShrink:0,
        background: isErr ? T.redSoft : T.greenSoft,
        color: isErr ? T.red : T.green,
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        <ChIcon name={isErr ? 'alert' : 'check'} size={15} />
      </div>
      <span style={{ fontSize:13, fontWeight:600, color:T.text, flex:1, letterSpacing:'-0.01em' }}>
        {message}
      </span>
      <button onClick={onClose} style={{
        background:'none', border:'none', cursor:'pointer',
        color:T.text3, display:'flex', fontFamily:'inherit',
        padding:2,
      }}>
        <ChIcon name="close" size={13} />
      </button>
    </div>
  );
};

/**
 * Slide-over drawer — appears from the right for add/edit forms.
 * Props: open, onClose, title, children
 */
export const Drawer = ({ open, onClose, title, children }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position:'fixed', inset:0, zIndex:80,
          background:'rgba(15,23,42,0.25)',
          backdropFilter:'blur(4px)',
          WebkitBackdropFilter:'blur(4px)',
          animation:'admin-overlay-in 280ms ease',
        }}
      />
      {/* Drawer panel */}
      <div style={{
        position:'fixed', top:0, right:0, bottom:0,
        width: 'min(480px,90vw)',
        background: T.surface,
        borderLeft: `1px solid ${T.border}`,
        boxShadow:'-20px 0 60px rgba(15,23,42,0.12)',
        zIndex:81,
        display:'flex', flexDirection:'column',
        animation:'admin-drawer-in 340ms cubic-bezier(0.16,1,0.3,1)',
        fontFamily:T.font,
      }}>
        {/* Drawer header */}
        <div style={{
          padding:'20px 24px',
          borderBottom:`1px solid ${T.divider}`,
          display:'flex', alignItems:'center', justifyContent:'space-between',
          flexShrink:0,
        }}>
          <h2 style={{
            fontSize:17, fontWeight:700, color:T.text, margin:0,
            letterSpacing:'-0.03em',
          }}>
            {title}
          </h2>
          <button onClick={onClose} style={{
            width:32, height:32, borderRadius:9,
            background:T.surfaceMuted, border:`1px solid ${T.border}`,
            cursor:'pointer', color:T.text2,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:'inherit',
          }}>
            <ChIcon name="close" size={15} />
          </button>
        </div>
        {/* Drawer body (scrollable) */}
        <div style={{
          flex:1, overflowY:'auto', padding:'24px',
          display:'flex', flexDirection:'column', gap:20,
        }}>
          {children}
        </div>
      </div>
    </>
  );
};

/**
 * Empty state — centered icon + message
 */
export const EmptyState = ({ icon = 'info', message, subtext }) => (
  <div style={{
    display:'flex', flexDirection:'column', alignItems:'center',
    justifyContent:'center', padding:'60px 24px', gap:12,
    color:T.text3,
  }}>
    <div style={{
      width:48, height:48, borderRadius:14,
      background:T.accentSoft, color:T.accent,
      display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      <ChIcon name={icon} size={22} />
    </div>
    <div style={{ fontSize:14, fontWeight:600, color:T.text2, letterSpacing:'-0.02em' }}>
      {message}
    </div>
    {subtext && (
      <div style={{ fontSize:12, fontWeight:500, color:T.text3, textAlign:'center', maxWidth:300 }}>
        {subtext}
      </div>
    )}
  </div>
);

/**
 * Table column header cell
 */
export const TH = ({ children, style }) => (
  <th style={{
    padding:'10px 16px', textAlign:'left',
    fontSize:11, fontWeight:700, color:T.text3,
    textTransform:'uppercase', letterSpacing:'0.06em',
    borderBottom:`1px solid ${T.divider}`,
    background:'transparent', ...style,
  }}>
    {children}
  </th>
);

/**
 * Table data cell
 */
export const TD = ({ children, style }) => (
  <td style={{
    padding:'12px 16px', fontSize:13,
    color:T.text, borderBottom:`1px solid ${T.divider}`,
    verticalAlign:'middle', ...style,
  }}>
    {children}
  </td>
);

/**
 * Badge / pill tag
 */
export const Badge = ({ children, color = T.accent, bg, border }) => (
  <span style={{
    display:'inline-flex', alignItems:'center',
    padding:'3px 9px', borderRadius:99,
    fontSize:11, fontWeight:700, letterSpacing:'0.01em',
    color: color,
    background: bg || `${color}18`,
    border: `1px solid ${border || color+'2e'}`,
  }}>
    {children}
  </span>
);

/**
 * Tab strip
 */
export const Tabs = ({ tabs, active, onChange }) => (
  <div style={{
    display:'flex', alignItems:'center', gap:2,
    padding:'4px',
    background:T.surfaceMuted, border:`1px solid ${T.border}`,
    borderRadius:12,
  }}>
    {tabs.map(tab => {
      const isActive = tab.id === active;
      return (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            padding:'8px 16px', borderRadius:9,
            border:'none', cursor:'pointer',
            background: isActive ? T.surface : 'transparent',
            color: isActive ? T.text : T.text3,
            fontSize:13, fontWeight: isActive ? 700 : 500,
            fontFamily:'inherit', letterSpacing:'-0.01em',
            boxShadow: isActive ? T.shadowCard : 'none',
            transition:`all 220ms ${T.ease}`,
            display:'flex', alignItems:'center', gap:6,
          }}
        >
          {tab.icon && <ChIcon name={tab.icon} size={13} />}
          {tab.label}
          {tab.count != null && (
            <span style={{
              padding:'1px 6px', borderRadius:99,
              background: isActive ? T.accentSoft : T.surfaceMuted,
              color: isActive ? T.accent : T.text3,
              fontSize:10.5, fontWeight:700,
            }}>
              {tab.count}
            </span>
          )}
        </button>
      );
    })}
  </div>
);

/**
 * Search input with icon
 */
export const SearchInput = ({ value, onChange, placeholder = 'Search…' }) => (
  <div style={{
    position:'relative', display:'flex', alignItems:'center',
  }}>
    <span style={{
      position:'absolute', left:10, color:T.text3, display:'flex',
      pointerEvents:'none',
    }}>
      <ChIcon name="search" size={14} />
    </span>
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        paddingLeft:32, paddingRight:12, paddingTop:8, paddingBottom:8,
        borderRadius:10, border:`1px solid ${T.border}`,
        background:T.surfaceMuted, color:T.text,
        fontSize:13, fontWeight:500, fontFamily:'inherit',
        letterSpacing:'-0.005em', outline:'none',
        width:220, transition:`border-color 200ms ${T.ease}, width 300ms ${T.ease}`,
      }}
      onFocus={e => { e.currentTarget.style.borderColor='rgba(124,58,237,0.55)'; e.currentTarget.style.width='280px'; }}
      onBlur={e => { e.currentTarget.style.borderColor=T.border; e.currentTarget.style.width='220px'; }}
    />
  </div>
);

/**
 * Confirm delete modal
 */
export const ConfirmModal = ({ open, onConfirm, onCancel, message }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <>
      <div onClick={onCancel} style={{
        position:'fixed', inset:0, zIndex:90,
        background:'rgba(15,23,42,0.30)',
        backdropFilter:'blur(6px)', WebkitBackdropFilter:'blur(6px)',
        animation:'admin-overlay-in 200ms ease',
      }}/>
      <div style={{
        position:'fixed', top:'50%', left:'50%',
        transform:'translate(-50%,-50%)',
        zIndex:91,
        background:T.surface, border:`1px solid ${T.border}`,
        borderRadius:20, padding:'24px 28px',
        width:'min(400px,90vw)',
        boxShadow:'0 20px 60px rgba(15,23,42,0.18)',
        fontFamily:T.font,
        animation:'admin-toast-in 280ms cubic-bezier(0.16,1,0.3,1)',
      }}>
        <div style={{
          width:44, height:44, borderRadius:12,
          background:T.redSoft, color:T.red,
          display:'flex', alignItems:'center', justifyContent:'center',
          marginBottom:14,
        }}>
          <ChIcon name="trash" size={20} />
        </div>
        <h3 style={{ fontSize:16, fontWeight:700, color:T.text, margin:'0 0 8px', letterSpacing:'-0.03em' }}>
          Confirm Deletion
        </h3>
        <p style={{ fontSize:13, color:T.text3, margin:'0 0 20px', lineHeight:1.55, fontWeight:500 }}>
          {message || 'Are you sure you want to delete this item? This action cannot be undone.'}
        </p>
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button onClick={onCancel} style={{
            padding:'9px 18px', borderRadius:10,
            background:T.surfaceMuted, border:`1px solid ${T.border}`,
            color:T.text2, fontSize:13, fontWeight:600,
            cursor:'pointer', fontFamily:'inherit',
          }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{
            padding:'9px 18px', borderRadius:10,
            background:`linear-gradient(135deg,${T.red},#dc2626)`,
            border:'none', color:'#fff',
            fontSize:13, fontWeight:700,
            cursor:'pointer', fontFamily:'inherit',
            boxShadow:'0 4px 12px rgba(239,68,68,0.30)',
          }}>
            Delete
          </button>
        </div>
      </div>
    </>
  );
};
