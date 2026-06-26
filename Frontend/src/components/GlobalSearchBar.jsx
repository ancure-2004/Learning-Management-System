import { theme } from '@/theme';
/**
 * GlobalSearchBar.jsx — Chronos
 * ─────────────────────────────────────────────────────────────────────────
 * A universal search bar that sits in the CENTER of every topbar.
 * - Replaces the old "search" button in the toolbar pill
 * - Panel extends DOWN from the bar with a smooth origin animation
 * - Background dims behind the panel (not a full-screen modal)
 * - Role-aware: loads relevant entities for admin/teacher/student
 * - ⌘K / Ctrl+K focuses the bar from anywhere
 * - Full keyboard navigation (↑↓ navigate, Enter select, Esc close)
 *
 * Usage: <GlobalSearchBar /> — drop it into any topbar center slot.
 *        Reads role from useAuth() and navigates with useNavigate().
 * ─────────────────────────────────────────────────────────────────────────
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { NAV } from '@/layouts/AdminLayout';
import { TEACHER_NAV } from '@/layouts/TeacherLayout';
import { STUDENT_NAV } from '@/layouts/StudentLayout';
import teacherService from '@/services/teacherService';
import authService from '@/services/authService';
import classService from '@/services/classService';
import subjectService from '@/services/subjectService';
import leaveService from '@/services/leaveService';

const RECENT_KEY_ADMIN   = 'chronos.admin.recent';
const RECENT_KEY_TEACHER = 'chronos.teacher.recent';
const RECENT_KEY_STUDENT = 'chronos.student.recent';

/* ─── Tokens ──────────────────────────────────────────────────── */
const T = theme;

/* ─── Category colors ─────────────────────────────────────────── */
const CAT_COLORS = {
  Pages:            { color: T.accent, bg: T.accentSoft },
  Recent:           { color: T.text3,  bg: T.surfaceMuted },
  Teachers:         { color: T.blue,   bg: T.blueSoft },
  Students:         { color: T.green,  bg: T.greenSoft },
  Classes:          { color: T.amber,  bg: T.amberSoft },
  Subjects:         { color: '#8b5cf6', bg: '#f5f3ff' },
  'Leave Requests': { color: T.red,    bg: T.redSoft },
  'My Classes':     { color: T.blue,   bg: T.blueSoft },
  'My Leaves':      { color: T.amber,  bg: T.amberSoft },
};
const catColor = (cat) => CAT_COLORS[cat] || { color: T.text3, bg: T.surfaceMuted };

/* ─── Icon SVG ────────────────────────────────────────────────── */
const PATHS = {
  search:    'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  teacher:   'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z',
  student:   'M12 14l9-5-9-5-9 5 9 5zM12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z',
  class:     'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm14 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  subject:   'M4 19.5v-15A2.5 2.5 0 016.5 2H20v20H6.5a2.5 2.5 0 010-5H20',
  calendar:  'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
  leave:     'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  overview:  'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
  timetable: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
  bolt:      'M13 2L3 14h9l-2 8L21 10h-9l2-8z',
  clock:     'M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2',
  report:    'M3 3v18h18 M7 14l4-4 4 4 5-5',
  progress:  'M22 12h-4l-3 9L9 3l-3 9H2',
  syllabus:  'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  dept:      'M3 21V8l9-5 9 5v13M9 21V12h6v9',
  room:      'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z',
  users:     'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm14 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  rating:    'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
};

const Ico = ({ name, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0, display: 'block' }}>
    <path d={PATHS[name] || PATHS.overview} />
  </svg>
);

/* ─── Recent helpers ──────────────────────────────────────────── */
const getRecentKey = (role) =>
  role === 'teacher' ? RECENT_KEY_TEACHER : role === 'student' ? RECENT_KEY_STUDENT : RECENT_KEY_ADMIN;

export const trackRecent = (role, label, path, icon = 'overview') => {
  try {
    const key = getRecentKey(role);
    const raw  = localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];
    const filtered = list.filter(r => r.path !== path);
    filtered.unshift({ label, path, icon, ts: Date.now(), timestamp: Date.now() });
    localStorage.setItem(key, JSON.stringify(filtered.slice(0, 10)));
  } catch (_) {}
};

const getRecent = (role) => {
  try {
    const raw = localStorage.getItem(getRecentKey(role));
    const items = raw ? JSON.parse(raw) : [];
    // Normalise: support both 'ts' and 'timestamp' keys written by old code
    return items.map(r => ({ ...r, ts: r.ts || r.timestamp || Date.now() }));
  } catch { return []; }
};

const fmtAgo = (ts) => {
  if (!ts || isNaN(ts)) return 'recently';
  const d = Date.now() - ts;
  const m = Math.floor(d / 60000);
  const h = Math.floor(d / 3600000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

/* ─── Nav for role ────────────────────────────────────────────── */
const navForRole = (role) => {
  if (role === 'teacher') return TEACHER_NAV;
  if (role === 'student') return STUDENT_NAV;
  return NAV;
};

/* ─── Main Component ──────────────────────────────────────────── */
const GlobalSearchBar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || 'student';

  const [isOpen,    setIsOpen]    = useState(false);
  const [query,     setQuery]     = useState('');
  const [selIdx,    setSelIdx]    = useState(0);
  const [allItems,  setAllItems]  = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [loaded,    setLoaded]    = useState(false);
  const [barFocus,  setBarFocus]  = useState(false);

  const inputRef    = useRef(null);
  const wrapperRef  = useRef(null);
  const panelRef    = useRef(null);

  /* ── Load search index (once) ──────────────────────────────── */
  const loadIndex = useCallback(async () => {
    if (loaded) return;
    setLoading(true);
    const items = [];

    /* Pages from nav */
    navForRole(role).forEach(group =>
      group.items.forEach(item => items.push({
        label: item.label,
        sublabel: group.section || 'Navigation',
        icon: item.icon || 'overview',
        category: 'Pages',
        path: item.path,
      }))
    );

    /* Role-specific entity data */
    if (role === 'admin') {
      const [teachersR, usersR, classesR, subjectsR, leaveR] = await Promise.allSettled([
        teacherService.getAll(),
        authService.getUsers(),
        classService.getAll(),
        subjectService.getAll(),
        leaveService.getAll(),
      ]);

      (teachersR.value || []).forEach(t => items.push({
        label: t.name,
        sublabel: t.department || 'Teacher',
        icon: 'teacher',
        category: 'Teachers',
        path: '/teachers',
      }));

      (usersR.value?.users || usersR.value || [])
        .filter(u => u.role === 'student')
        .forEach(u => items.push({
          label: `${u.firstName} ${u.lastName}`,
          sublabel: u.email || u.program || 'Student',
          icon: 'student',
          category: 'Students',
          path: '/users',
        }));

      (classesR.value || []).forEach(c => items.push({
        label: c.name || c.code,
        sublabel: c.code || `Semester ${c.semester}`,
        icon: 'class',
        category: 'Classes',
        path: '/academic-resources',
      }));

      (subjectsR.value || []).forEach(s => items.push({
        label: s.name || s.code,
        sublabel: s.code || s.subjectType || 'Subject',
        icon: 'subject',
        category: 'Subjects',
        path: '/subjects',
      }));

      (leaveR.value?.leaves || []).forEach(l => items.push({
        label: `${l.teacher?.firstName || ''} ${l.teacher?.lastName || ''}`.trim() || 'Teacher',
        sublabel: `${l.leaveType} leave · ${new Date(l.startDate).toLocaleDateString('en-IN', { day:'numeric', month:'short' })} – ${new Date(l.endDate).toLocaleDateString('en-IN', { day:'numeric', month:'short' })} · ${l.status}`,
        icon: 'leave',
        category: 'Leave Requests',
        path: '/admin-leaves',
      }));
    }

    if (role === 'teacher') {
      const [leavesR] = await Promise.allSettled([
        leaveService.getMine(),
      ]);
      (leavesR.value?.leaves || []).forEach(l => items.push({
        label: `${l.leaveType} leave`,
        sublabel: `${new Date(l.startDate).toLocaleDateString('en-IN',{day:'numeric',month:'short'})} – ${new Date(l.endDate).toLocaleDateString('en-IN',{day:'numeric',month:'short'})} · ${l.status}`,
        icon: 'leave',
        category: 'My Leaves',
        path: '/teacher-leave',
      }));
    }

    setAllItems(items);
    setLoaded(true);
    setLoading(false);
  }, [role, loaded]);

  /* ── Open / close ──────────────────────────────────────────── */
  const open = useCallback(() => {
    setIsOpen(true);
    setQuery('');
    setSelIdx(0);
    loadIndex();
    setTimeout(() => inputRef.current?.focus(), 40);
  }, [loadIndex]);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setSelIdx(0);
    inputRef.current?.blur();
  }, []);

  /* ── ⌘K / Ctrl+K ───────────────────────────────────────────── */
  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) close(); else open();
      }
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [isOpen, open, close]);

  /* ── Click outside ─────────────────────────────────────────── */
  useEffect(() => {
    if (!isOpen) return;
    const h = (e) => {
      if (
        wrapperRef.current?.contains(e.target) ||
        panelRef.current?.contains(e.target)
      ) return;
      close();
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [isOpen, close]);

  /* ── Filtered results ──────────────────────────────────────── */
  const recent = useMemo(() => getRecent(role), [role, isOpen]);

  const filteredItems = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      // Show recent + first few pages when empty
      const recentItems = recent.slice(0, 5).map(r => ({
        ...r, sublabel: fmtAgo(r.ts), icon: r.icon || 'clock', category: 'Recent',
      }));
      const pageItems = allItems.filter(i => i.category === 'Pages').slice(0, 6);
      return [...recentItems, ...pageItems];
    }
    return allItems.filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.sublabel?.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    ).slice(0, 20);
  }, [query, allItems, recent]);

  /* ── Grouped display ───────────────────────────────────────── */
  const grouped = useMemo(() => {
    const order = ['Recent', 'Pages', 'Teachers', 'Students', 'Classes', 'Subjects', 'Leave Requests', 'My Classes', 'My Leaves'];
    const map = {};
    filteredItems.forEach(item => {
      if (!map[item.category]) map[item.category] = [];
      map[item.category].push(item);
    });
    return order
      .filter(cat => map[cat]?.length > 0)
      .map(cat => ({ cat, items: map[cat] }));
  }, [filteredItems]);

  /* ── Keyboard navigation ───────────────────────────────────── */
  const handleKey = (e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelIdx(i => Math.min(i + 1, filteredItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = filteredItems[selIdx];
      if (item?.path) { navigate(item.path); close(); }
    }
  };

  useEffect(() => { setSelIdx(0); }, [query]);

  const handleSelect = (item) => {
    if (item?.path) {
      trackRecent(role, item.label, item.path, item.icon);
      navigate(item.path);
      close();
    }
  };

  /* ── Kbd chip ──────────────────────────────────────────────── */
  const Kbd = ({ children }) => (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      padding: '1px 5px', borderRadius: 4,
      background: 'rgba(15,23,42,0.06)', border: '1px solid rgba(15,23,42,0.10)',
      fontSize: 9.5, fontWeight: 600, color: T.text3,
      lineHeight: 1.4, minWidth: 16, fontFamily: 'inherit',
    }}>
      {children}
    </span>
  );

  /* ─── Render ──────────────────────────────────────────────── */
  let globalIdx = 0;

  return (
    <>
      <style>{`
        @keyframes srch-panel-in {
          from { opacity:0; transform:translateY(-8px) scaleY(0.94); }
          to   { opacity:1; transform:translateY(0) scaleY(1); }
        }
        @keyframes srch-backdrop-in {
          from { opacity:0; }
          to   { opacity:1; }
        }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>

      {/* ── Full-page backdrop (covers EVERYTHING, z-index 997) ── */}
      {isOpen && (
        <div
          onClick={close}
          style={{
            position: 'fixed', inset: 0,
            zIndex: 997,
            background: 'rgba(15,23,42,0.45)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            animation: 'srch-backdrop-in 180ms ease',
          }}
        />
      )}

      {/* ── Search input bar — always visible, lifts to z-index 999 when open ── */}
      <div
        ref={wrapperRef}
        style={{
          /* Truly centered in the topbar regardless of left/right widths */
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(520px, calc(100vw - 280px))',
          /* Sit above backdrop when open */
          zIndex: isOpen ? 999 : 'auto',
        }}
      >
        <div
          onClick={() => { if (!isOpen) open(); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 14px',
            background: isOpen
              ? '#ffffff'
              : barFocus ? '#ffffff' : 'rgba(255,255,255,0.72)',
            border: `1px solid ${ isOpen ? 'rgba(124,58,237,0.35)' : T.borderHi }`,
            borderRadius: isOpen ? '12px 12px 0 0' : 12,
            cursor: isOpen ? 'default' : 'text',
            boxShadow: isOpen
              ? '0 0 0 3px rgba(124,58,237,0.12), 0 -2px 8px rgba(15,23,42,0.06)'
              : '0 2px 8px rgba(15,23,42,0.06), 0 1px 0 rgba(255,255,255,0.7) inset',
            transition: 'all 180ms ease',
          }}
        >
          <span style={{
            color: isOpen ? '#7c3aed' : T.text3,
            display: 'flex', flexShrink: 0,
            transition: 'color 180ms ease',
          }}>
            <Ico name="search" size={15} />
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            onFocus={() => { setBarFocus(true); if (!isOpen) open(); }}
            onBlur={() => setBarFocus(false)}
            aria-label="Search"
            role="combobox"
            aria-expanded={isOpen}
            placeholder="Search anything…"
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontSize: 13, fontWeight: 500,
              color: isOpen ? T.text : T.text3,
              fontFamily: 'inherit', letterSpacing: '-0.01em', minWidth: 0,
              cursor: isOpen ? 'text' : 'pointer',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
            {isOpen
              ? <Kbd>ESC</Kbd>
              : <><Kbd>⌘</Kbd><Kbd>K</Kbd></>
            }
          </div>
        </div>

        {/* ── Panel — drops directly from the search bar ──────── */}
        {isOpen && (
          <div
            ref={panelRef}
            style={{
              position: 'absolute',
              top: '100%',   /* flush below the bar */
              left: 0, right: 0,
              zIndex: 999,
              background: T.surface,
              border: `1px solid rgba(124,58,237,0.20)`,
              borderTop: `1px solid rgba(124,58,237,0.12)`,
              borderRadius: '0 0 18px 18px',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(15,23,42,0.18), 0 4px 16px rgba(15,23,42,0.10)',
              animation: 'srch-panel-in 200ms cubic-bezier(0.16,1,0.3,1)',
              transformOrigin: 'top center',
              fontFamily: "'Plus Jakarta Sans','Inter',-apple-system,sans-serif",
              display: 'flex', flexDirection: 'column',
              maxHeight: 'calc(100vh - 120px)',
            }}
          >
            {/* Results list */}
            <div style={{ overflowY: 'auto', maxHeight: 420, padding: '6px 0' }}>
              {loading ? (
                <div style={{ padding: '32px 20px', textAlign: 'center', color: T.text3 }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: '50%',
                    border: '2px solid rgba(124,58,237,0.2)', borderTopColor: '#7c3aed',
                    display: 'inline-block',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                  <div style={{ marginTop: 8, fontSize: 12.5 }}>Loading…</div>
                </div>
              ) : filteredItems.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: T.text2, marginBottom: 4 }}>
                    No results for "{query}"
                  </div>
                  <div style={{ fontSize: 12, color: T.text3 }}>Try different keywords</div>
                </div>
              ) : (
                grouped.map(({ cat, items }) => {
                  const cc = catColor(cat);
                  return (
                    <div key={cat}>
                      <div style={{
                        padding: '8px 16px 4px',
                        fontSize: 9.5, fontWeight: 700, color: T.text4,
                        textTransform: 'uppercase', letterSpacing: '0.09em',
                      }}>
                        {cat}
                      </div>
                      {items.map(item => {
                        const myIdx = globalIdx++;
                        const sel = myIdx === selIdx;
                        return (
                          <div key={`${cat}-${myIdx}`} style={{ padding: '0 6px' }}>
                            <button
                              onClick={() => handleSelect(item)}
                              onMouseEnter={() => setSelIdx(myIdx)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                width: '100%', padding: '9px 10px', borderRadius: 10,
                                border: 'none', cursor: 'pointer',
                                background: sel ? T.accentSoft : 'transparent',
                                textAlign: 'left', fontFamily: 'inherit',
                                transition: 'background 100ms ease',
                              }}
                            >
                              <div style={{
                                width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                                background: sel ? '#7c3aed' : cc.bg,
                                color: sel ? '#fff' : cc.color,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 120ms ease',
                                boxShadow: sel ? '0 4px 10px rgba(124,58,237,0.30)' : 'none',
                              }}>
                                <Ico name={item.icon} size={15} />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                  fontSize: 13, fontWeight: sel ? 700 : 600,
                                  color: sel ? '#7c3aed' : T.text,
                                  letterSpacing: '-0.015em',
                                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                }}>
                                  {item.label}
                                </div>
                                {item.sublabel && (
                                  <div style={{
                                    fontSize: 11, color: T.text3, fontWeight: 400, marginTop: 1,
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                  }}>
                                    {item.sublabel}
                                  </div>
                                )}
                              </div>
                              {sel && (
                                <span style={{ fontSize: 13, color: '#7c3aed', fontWeight: 700, flexShrink: 0 }}>
                                  ↵
                                </span>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '9px 16px',
              borderTop: `1px solid ${T.divider}`,
              background: T.surfaceMuted,
              display: 'flex', alignItems: 'center', gap: 12,
              fontSize: 10, color: T.text4, fontWeight: 500,
            }}>
              <span style={{ display:'flex', gap:3, alignItems:'center' }}>
                <Kbd>↑</Kbd><Kbd>↓</Kbd>
                <span style={{ marginLeft:3 }}>Navigate</span>
              </span>
              <span style={{ display:'flex', gap:3, alignItems:'center' }}>
                <Kbd>↵</Kbd>
                <span style={{ marginLeft:3 }}>Open</span>
              </span>
              <span style={{ marginLeft:'auto', display:'flex', gap:3, alignItems:'center' }}>
                <Kbd>ESC</Kbd>
                <span style={{ marginLeft:3 }}>Close</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default GlobalSearchBar;
