import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/useMediaQuery';

const MOBILE_QUERY = '(max-width: 768px)';
const isMobileNow = () =>
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia(MOBILE_QUERY).matches
    : false;

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS  (kept in sync with Dashboard.jsx)
   ═══════════════════════════════════════════════════════════════ */
const T = {
  surface:  '#111113',
  card:     '#161618',
  cardHi:   '#1c1c1f',
  border:   'rgba(255,255,255,0.06)',
  borderHi: 'rgba(255,255,255,0.10)',
  text:     '#fafafa',
  text2:    '#a1a1aa',
  text3:    '#71717a',
  text4:    '#52525b',
  accent:   '#8b5cf6',
  accent2:  '#a78bfa',
  red:      '#ef4444',
};

/* Sidebar widths */
const COLLAPSED_W   = 64;
const MIN_W         = 200;
const MAX_W         = 420;
const DEFAULT_W     = 232;
const STORAGE_KEY   = 'chronos.sidebar.width';
const COLLAPSED_KEY = 'chronos.sidebar.collapsed';

const COLLAPSE_EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';
const COLLAPSE_MS   = 280;

/* ═══════════════════════════════════════════════════════════════
   ICON
   ═══════════════════════════════════════════════════════════════ */
const I = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const PATHS = {
  sparkle:    'M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z',
  logout:     'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
  profile:    'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z',
  settings:   'M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z',
  chev:       'M9 18l6-6-6-6',
  sidebar:    'M3 4h18a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1z M9 4v16',
  search:     'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  back:       'M15 18l-6-6 6-6',
  forward:    'M9 18l6-6-6-6',
};

/* ═══════════════════════════════════════════════════════════════
   SHARED ANIMATION KEYFRAMES (injected once)
   ═══════════════════════════════════════════════════════════════ */
const ensureChronosAnims = () => {
  if (document.getElementById('chronos-sidebar-anim')) return;
  const style = document.createElement('style');
  style.id = 'chronos-sidebar-anim';
  style.textContent = `
    @keyframes chronos-menu-in {
      from { opacity: 0; transform: translateY(4px) scale(0.98); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes chronos-tooltip-fade {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
  `;
  document.head.appendChild(style);
};

/* ═══════════════════════════════════════════════════════════════
   TOOLTIP  (overflow-aware)
   ═══════════════════════════════════════════════════════════════ */
const Tooltip = ({ label, show, children, side = 'bottom', block = false }) => {
  const [hover, setHover] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const triggerRef = useRef(null);
  const tipRef = useRef(null);

  useEffect(() => { ensureChronosAnims(); }, []);

  useEffect(() => {
    if (!hover || !show) return;
    const trigger = triggerRef.current;
    const tip = tipRef.current;
    if (!trigger || !tip) return;

    const tr = trigger.getBoundingClientRect();
    const tw = tip.offsetWidth;
    const th = tip.offsetHeight;
    const margin = 8;
    const edge = 8;

    let x, y;
    if (side === 'right') {
      x = tr.right + margin;
      y = tr.top + tr.height / 2 - th / 2;
    } else {
      x = tr.left + tr.width / 2 - tw / 2;
      y = tr.bottom + margin;
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (x < edge) x = edge;
    if (x + tw > vw - edge) x = vw - tw - edge;
    if (y < edge) y = edge;
    if (y + th > vh - edge) y = vh - th - edge;

    setPos({ x, y });
  }, [hover, show, side, label]);

  const wrapStyle = block
    ? { display: 'block', width: '100%' }
    : { display: 'inline-flex' };

  return (
    <>
      <span
        ref={triggerRef}
        style={wrapStyle}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}>
        {children}
      </span>
      {show && hover && (
        <div
          ref={tipRef}
          style={{
            position: 'fixed',
            left: pos.x,
            top: pos.y,
            background: T.surface,
            color: T.text,
            fontSize: 11.5, fontWeight: 500,
            padding: '5px 9px',
            borderRadius: 6,
            border: `1px solid ${T.borderHi}`,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 9999,
            boxShadow: '0 4px 16px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.3)',
            animation: 'chronos-tooltip-fade 0.12s ease-out',
          }}>
          {label}
        </div>
      )}
    </>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ACTION BUTTON  (exported)
   Slightly larger now (34×34 hit, 17px icon) for better clarity in
   the topbar toolbar.
   ═══════════════════════════════════════════════════════════════ */
export const ActionButton = ({ icon, label, onClick, disabled, size = 34, tipSide = 'bottom' }) => {
  const [hover, setHover] = useState(false);
  return (
    <Tooltip label={label} show={!disabled} side={tipSide}>
      <button
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        aria-label={label}
        style={{
          width: size, height: size, borderRadius: 8,
          background: hover && !disabled ? T.cardHi : 'transparent',
          border: 'none', cursor: disabled ? 'default' : 'pointer',
          color: disabled ? T.text4 : (hover ? T.text : T.text2),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          opacity: disabled ? 0.4 : 1,
          transition: 'background-color 0.12s ease, color 0.12s ease, opacity 0.12s ease',
        }}>
        <I d={PATHS[icon]} size={17} />
      </button>
    </Tooltip>
  );
};

/* ═══════════════════════════════════════════════════════════════
   useHistoryNav  (exported)
   ═══════════════════════════════════════════════════════════════ */
export const useHistoryNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [forwardCount, setForwardCount] = useState(0);
  const [backCount, setBackCount] = useState(0);
  const lastIdxRef = useRef(window.history.state?.idx ?? 0);
  const isPoppingRef = useRef(false);

  useEffect(() => {
    const currentIdx = window.history.state?.idx ?? 0;
    const lastIdx = lastIdxRef.current;
    if (isPoppingRef.current) {
      isPoppingRef.current = false;
    } else if (currentIdx > lastIdx) {
      setBackCount(c => c + 1);
      setForwardCount(0);
    }
    lastIdxRef.current = currentIdx;
  }, [location]);

  useEffect(() => {
    const onPop = () => {
      isPoppingRef.current = true;
      const newIdx = window.history.state?.idx ?? 0;
      const lastIdx = lastIdxRef.current;
      if (newIdx < lastIdx) {
        setBackCount(c => Math.max(0, c - 1));
        setForwardCount(c => c + 1);
      } else if (newIdx > lastIdx) {
        setForwardCount(c => Math.max(0, c - 1));
        setBackCount(c => c + 1);
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return {
    canBack:    backCount > 0,
    canForward: forwardCount > 0,
    goBack:    () => { if (backCount > 0)    navigate(-1); },
    goForward: () => { if (forwardCount > 0) navigate(1); },
  };
};

/* ═══════════════════════════════════════════════════════════════
   USER MENU POPOVER
   Uses position:fixed so it floats above the sidebar and is never
   clipped by overflow — works identically in expanded and collapsed modes.
   ═══════════════════════════════════════════════════════════════ */
const UserMenu = ({ user, onProfile, onSettings, onLogout, onClose, anchorRef, collapsed }) => {
  const menuRef = useRef(null);
  const [pos, setPos] = useState(null);
  const MENU_W = 248;

  /* Calculate fixed position from the anchor button's screen rect */
  useEffect(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const vh   = window.innerHeight;

    if (collapsed) {
      /* Collapsed: float to the right of the sidebar */
      setPos({
        left:   rect.right + 10,
        bottom: vh - rect.bottom - 4,
        width:  MENU_W,
      });
    } else {
      /* Expanded: rise above the button, slightly wider so it protrudes */
      setPos({
        left:   rect.left - 6,
        bottom: vh - rect.top + 8,
        width:  Math.max(rect.width + 12, MENU_W),
      });
    }
  }, [anchorRef, collapsed]);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current?.contains(e.target)) return;
      if (anchorRef.current?.contains(e.target)) return;
      onClose();
    };
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose, anchorRef]);

  if (!pos) return null;

  const itemBase = {
    display: 'flex', alignItems: 'center', gap: 10,
    width: '100%', padding: '9px 12px', borderRadius: 8,
    background: 'transparent', border: 'none', cursor: 'pointer',
    color: T.text2, fontSize: 13, fontWeight: 500, textAlign: 'left',
    fontFamily: 'inherit', transition: 'all 0.12s ease',
  };

  const onItemHover   = (e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = T.text; };
  const onItemLeave   = (e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.text2; };
  const onLogoutHover = (e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = T.red; };
  const onLogoutLeave = (e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.text2; };

  return (
    <div
      ref={menuRef}
      role="menu"
      style={{
        position: 'fixed',
        left:   pos.left,
        bottom: pos.bottom,
        width:  pos.width,
        /* Slightly lighter than the sidebar (#111113) so it reads as distinct */
        background: '#22222a',
        border: `1px solid rgba(255,255,255,0.12)`,
        borderRadius: 14,
        padding: 6,
        boxShadow: '0 16px 48px rgba(0,0,0,0.60), 0 4px 16px rgba(0,0,0,0.40), 0 0 0 1px rgba(0,0,0,0.5)',
        zIndex: 9999,
        animation: 'chronos-menu-in 0.14s ease-out',
      }}>
      {/* Email header */}
      <div style={{
        padding: '10px 12px 8px',
        fontSize: 12, fontWeight: 500, color: T.text,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        borderBottom: `1px solid rgba(255,255,255,0.06)`,
        marginBottom: 4,
      }}>
        {user?.email || 'Not signed in'}
      </div>

      <button role="menuitem" style={itemBase}
        onMouseEnter={onItemHover} onMouseLeave={onItemLeave}
        onClick={() => { onClose(); onProfile?.(); }}>
        <span style={{ display: 'flex', flexShrink: 0 }}><I d={PATHS.profile} size={15} /></span>
        <span style={{ flex: 1 }}>Profile</span>
      </button>

      <button role="menuitem" style={itemBase}
        onMouseEnter={onItemHover} onMouseLeave={onItemLeave}
        onClick={() => { onClose(); onSettings?.(); }}>
        <span style={{ display: 'flex', flexShrink: 0 }}><I d={PATHS.settings} size={15} /></span>
        <span style={{ flex: 1 }}>Settings</span>
      </button>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />

      <button role="menuitem" style={itemBase}
        onMouseEnter={onLogoutHover} onMouseLeave={onLogoutLeave}
        onClick={() => { onClose(); onLogout?.(); }}>
        <span style={{ display: 'flex', flexShrink: 0 }}><I d={PATHS.logout} size={15} /></span>
        <span style={{ flex: 1 }}>Log out</span>
      </button>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   useSidebarState  (exported)
   ═══════════════════════════════════════════════════════════════ */
export const useSidebarState = () => {
  const [collapsed, setCollapsed] = useState(() => {
    // On mobile the sidebar is an overlay drawer — start closed so it
    // doesn't cover the page on load.
    if (isMobileNow()) return true;
    return localStorage.getItem(COLLAPSED_KEY) === 'true';
  });
  const toggleCollapsed = useCallback(() => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem(COLLAPSED_KEY, String(next));
      return next;
    });
  }, []);
  return { collapsed, toggleCollapsed };
};

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR  (resizable, collapsible, floating)
   ═══════════════════════════════════════════════════════════════ */
const Sidebar = ({
  user, onLogout, onNavigate, currentPath, navConfig, iconRenderer,
  collapsed, onToggleCollapse,
}) => {
  const isMobile = useIsMobile();
  const [width, setWidth] = useState(() => {
    const saved = parseInt(localStorage.getItem(STORAGE_KEY), 10);
    return Number.isFinite(saved) && saved >= MIN_W && saved <= MAX_W ? saved : DEFAULT_W;
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isHandleHover, setIsHandleHover] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [btnHover, setBtnHover] = useState(false);

  const dragStateRef = useRef({ startX: 0, startWidth: 0 });
  const userBtnRef = useRef(null);

  const effectiveWidth = collapsed ? COLLAPSED_W : width;

  const onPointerDown = useCallback((e) => {
    if (collapsed) return;
    e.preventDefault();
    dragStateRef.current = { startX: e.clientX, startWidth: width };
    setIsDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }, [width, collapsed]);

  const onPointerMove = useCallback((e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStateRef.current.startX;
    const next = Math.max(MIN_W, Math.min(MAX_W, dragStateRef.current.startWidth + dx));
    setWidth(next);
  }, [isDragging]);

  const onPointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    localStorage.setItem(STORAGE_KEY, String(width));
  }, [isDragging, width]);

  useEffect(() => {
    if (isDragging) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  useEffect(() => { ensureChronosAnims(); }, []);

  useEffect(() => {
    if (collapsed) setMenuOpen(false);
  }, [collapsed]);

  const onHandleDoubleClick = () => {
    if (collapsed) return;
    setWidth(DEFAULT_W);
    localStorage.setItem(STORAGE_KEY, String(DEFAULT_W));
  };

  const handleProfile  = () => onNavigate('/profile');
  const handleSettings = () => onNavigate('/settings');

  const btnBg = (menuOpen || btnHover) ? T.cardHi : T.card;

  const visibleNav = collapsed
    ? navConfig
        .map(group => ({
          ...group,
          section: null,
          items: group.items.filter(item => item.pinned),
        }))
        .filter(group => group.items.length > 0)
    : navConfig;

  const labelAnim = {
    opacity: collapsed ? 0 : 1,
    transform: collapsed ? 'translateX(-6px)' : 'translateX(0)',
    transition: `opacity ${COLLAPSE_MS}ms ${COLLAPSE_EASE}, transform ${COLLAPSE_MS}ms ${COLLAPSE_EASE}`,
    pointerEvents: collapsed ? 'none' : 'auto',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  return (
    <>
    {/* Mobile: dim backdrop behind the open drawer; tap to close */}
    {isMobile && !collapsed && (
      <div
        onClick={onToggleCollapse}
        style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)',
        }}
      />
    )}
    <aside style={{
      ...(isMobile
        ? {
            // Off-canvas drawer: slides in over the page, full height.
            position: 'fixed', top: 0, left: 0, bottom: 0, height: '100vh',
            width: 270, margin: 0, borderRadius: 0, zIndex: 1000,
            flex: '0 0 auto',
            transform: collapsed ? 'translateX(-110%)' : 'translateX(0)',
            transition: `transform ${COLLAPSE_MS}ms ${COLLAPSE_EASE}`,
            boxShadow: collapsed ? 'none' : '0 0 50px rgba(0,0,0,0.55)',
          }
        : {
            // Desktop: in-flow, resizable / collapsible rail.
            width: effectiveWidth,
            flexShrink: 0,
            flex: collapsed ? '0 0 auto' : '1 1 auto',
            alignSelf: collapsed ? 'flex-start' : 'stretch',
            // Uniform 8px margin on all sides — small gap from the topbar/edges.
            margin: 8,
            borderRadius: 14,
            boxShadow: 'none',
            position: 'relative',
            transition: isDragging
              ? 'none'
              : `width ${COLLAPSE_MS}ms ${COLLAPSE_EASE}, flex-basis ${COLLAPSE_MS}ms ${COLLAPSE_EASE}`,
          }),
      minHeight: 0,
      background: T.surface,
      display: 'flex',
      flexDirection: 'column',
      border: `1px solid ${T.border}`,
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column',
        height: '100%',
        borderRadius: 14, overflow: 'hidden',
      }}>

        {/* ═══ BRAND ROW ═══ */}
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: collapsed ? '14px 0 6px' : '16px 14px 10px',
          gap: 10,
          flexDirection: collapsed ? 'column' : 'row',
          flexShrink: 0,
          transition: `padding ${COLLAPSE_MS}ms ${COLLAPSE_EASE}`,
        }}>
          <div style={{
            // Brand logo — also a touch bigger when collapsed for visual balance
            width: collapsed ? 40 : 30,
            height: collapsed ? 40 : 30,
            borderRadius: collapsed ? 10 : 8,
            background: `linear-gradient(135deg, ${T.accent} 0%, #6366f1 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 0 1px rgba(255,255,255,0.05), 0 4px 12px rgba(139,92,246,0.25)`,
            flexShrink: 0,
            transition: `width ${COLLAPSE_MS}ms ${COLLAPSE_EASE}, height ${COLLAPSE_MS}ms ${COLLAPSE_EASE}, border-radius ${COLLAPSE_MS}ms ${COLLAPSE_EASE}`,
          }}>
            <I d={PATHS.sparkle} size={collapsed ? 19 : 15} />
          </div>

          {!collapsed && (
            <div style={{ ...labelAnim, flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text, letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                Chronos
              </div>
              <div style={{ fontSize: 10, color: T.text3, marginTop: 1 }}>Timetable Studio</div>
            </div>
          )}
        </div>

        {/* ═══ NAV ═══ */}
        <nav className="chronos-scroll-hover" style={{
          flex: collapsed ? '0 0 auto' : '1 1 auto',
          minHeight: 0,
          overflowY: collapsed ? 'visible' : 'auto',
          overflowX: 'hidden',
          padding: collapsed ? '4px 8px 6px' : '4px 8px 12px',
          transition: `padding ${COLLAPSE_MS}ms ${COLLAPSE_EASE}`,
        }}>
          {visibleNav.map((group, gi) => (
            <div key={gi} style={{
              marginBottom: collapsed ? 4 : 14,
              transition: `margin-bottom ${COLLAPSE_MS}ms ${COLLAPSE_EASE}`,
            }}>
              {group.section && (
                <div style={{
                  fontSize: 10, fontWeight: 600, color: T.text4,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  height: collapsed ? 0 : 'auto',
                  padding: collapsed ? '0 10px' : '6px 10px 4px',
                  overflow: 'hidden',
                  ...labelAnim,
                  transition: `opacity ${COLLAPSE_MS}ms ${COLLAPSE_EASE}, transform ${COLLAPSE_MS}ms ${COLLAPSE_EASE}, height ${COLLAPSE_MS}ms ${COLLAPSE_EASE}, padding ${COLLAPSE_MS}ms ${COLLAPSE_EASE}`,
                }}>{group.section}</div>
              )}

              {group.items.map(item => {
                const active = currentPath === item.path;
                return (
                  <Tooltip key={item.path} label={item.label} show={collapsed} side="right" block>
                    <button
                      onClick={() => { onNavigate(item.path); if (isMobile) onToggleCollapse?.(); }}
                      style={{
                        display: 'flex', alignItems: 'center',
                        gap: collapsed ? 0 : 10,
                        width: '100%',
                        // Bigger button when collapsed so the bigger icon has room to breathe
                        padding: collapsed ? '11px 0' : '7px 10px',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        borderRadius: 8,
                        marginBottom: collapsed ? 3 : 1,
                        background: active ? T.card : 'transparent',
                        border: 'none', cursor: 'pointer', textAlign: 'left',
                        color: active ? T.text : T.text2,
                        fontSize: 12.5, fontWeight: active ? 500 : 400,
                        whiteSpace: 'nowrap', overflow: 'hidden',
                        transition: `padding ${COLLAPSE_MS}ms ${COLLAPSE_EASE}, gap ${COLLAPSE_MS}ms ${COLLAPSE_EASE}, background-color 0.12s ease, color 0.12s ease`,
                        fontFamily: 'inherit',
                      }}
                      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = T.card; e.currentTarget.style.color = T.text; } }}
                      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.text2; } }}>
                      <span style={{
                        display: 'flex', flexShrink: 0,
                        color: active ? T.accent2 : 'inherit',
                      }}>
                        {/* Larger icons when collapsed — 20px from 17px */}
                        {iconRenderer(item.icon, collapsed ? 20 : 15)}
                      </span>
                      {!collapsed && (
                        <span style={{ ...labelAnim, flex: 1 }}>{item.label}</span>
                      )}
                    </button>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </nav>

        {/* ═══ USER FOOTER ═══ */}
        <div style={{
          position: 'relative',
          padding: collapsed ? '4px 8px 8px' : 10,
          flexShrink: 0,
          transition: `padding ${COLLAPSE_MS}ms ${COLLAPSE_EASE}`,
        }}>
          <Tooltip label={`${user?.firstName} ${user?.lastName}`} show={collapsed && !menuOpen} side="right" block>
            <button
              ref={userBtnRef}
              onClick={() => setMenuOpen(o => !o)}
              onMouseEnter={() => setBtnHover(true)}
              onMouseLeave={() => setBtnHover(false)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              style={{
                display: 'flex', alignItems: 'center',
                gap: collapsed ? 0 : 10,
                width: '100%',
                padding: collapsed ? '5px' : '8px 10px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 9,
                background: btnBg,
                border: `1px solid ${(menuOpen || btnHover) ? T.borderHi : T.border}`,
                boxShadow: menuOpen
                  ? '0 0 0 1px rgba(139,92,246,0.15), 0 1px 2px rgba(0,0,0,0.3)'
                  : '0 1px 2px rgba(0,0,0,0.2)',
                cursor: 'pointer', textAlign: 'left',
                transition: `padding ${COLLAPSE_MS}ms ${COLLAPSE_EASE}, gap ${COLLAPSE_MS}ms ${COLLAPSE_EASE}, background-color 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease`,
                fontFamily: 'inherit',
              }}>
              <div style={{
                width: collapsed ? 36 : 26,
                height: collapsed ? 36 : 26,
                borderRadius: collapsed ? 9 : 6,
                background: `linear-gradient(135deg, ${T.accent}, #ec4899)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: collapsed ? 13 : 10.5,
                fontWeight: 600, color: '#fff', flexShrink: 0,
                boxShadow: '0 0 0 1px rgba(255,255,255,0.05)',
                transition: `width ${COLLAPSE_MS}ms ${COLLAPSE_EASE}, height ${COLLAPSE_MS}ms ${COLLAPSE_EASE}, border-radius ${COLLAPSE_MS}ms ${COLLAPSE_EASE}, font-size ${COLLAPSE_MS}ms ${COLLAPSE_EASE}`,
              }}>{user?.firstName?.[0]}{user?.lastName?.[0]}</div>

              {!collapsed && (
                <>
                  <div style={{ ...labelAnim, flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500, color: T.text, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div style={{ fontSize: 10, color: T.text3, textTransform: 'capitalize', marginTop: 1 }}>{user?.role}</div>
                  </div>
                  <span style={{
                    color: T.text3, flexShrink: 0, display: 'flex',
                    transform: menuOpen ? 'rotate(-90deg)' : 'rotate(90deg)',
                    transition: 'transform 0.18s ease',
                  }}>
                    <I d={PATHS.chev} size={12} />
                  </span>
                </>
              )}
            </button>
          </Tooltip>

          {menuOpen && (
            <UserMenu
              user={user}
              anchorRef={userBtnRef}
              onClose={() => setMenuOpen(false)}
              onProfile={handleProfile}
              onSettings={handleSettings}
              onLogout={onLogout}
              collapsed={collapsed}
            />
          )}
        </div>
      </div>

      {/* ═══ RESIZE HANDLE  (disabled when collapsed or on mobile) ═══ */}
      {!collapsed && !isMobile && (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onMouseEnter={() => setIsHandleHover(true)}
          onMouseLeave={() => setIsHandleHover(false)}
          onDoubleClick={onHandleDoubleClick}
          style={{
            position: 'absolute', top: 0, right: -6,
            width: 12, height: '100%', cursor: 'col-resize',
            zIndex: 20, touchAction: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
          <div style={{
            width: 3, height: 36, borderRadius: 99,
            background: isDragging ? T.accent : isHandleHover ? T.accent2 : 'transparent',
            opacity: isDragging ? 1 : isHandleHover ? 0.85 : 0,
            transition: 'opacity 0.18s ease, background-color 0.18s ease',
            boxShadow: (isDragging || isHandleHover)
              ? `0 0 0 1px rgba(0,0,0,0.3), 0 0 12px ${T.accent}66`
              : 'none',
          }} />
        </div>
      )}
    </aside>
    </>
  );
};

export default Sidebar;
