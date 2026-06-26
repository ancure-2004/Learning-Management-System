import { theme } from '@/theme';
/**
 * NotificationBell.jsx — Chronos
 * A drop-in bell button + dropdown panel that works in any topbar.
 * Uses inline styles (no Tailwind) matching the app's light surface palette.
 * Connects to Socket.IO for real-time push and REST for history.
 *
 * Usage: <NotificationBell />
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/api/client';
import notificationService from '@/services/notificationService';

const API = API_BASE_URL;

/* ─── Design tokens (light surface, same as dashboards) ───────── */
const T = theme;

/* ─── Type → visual style ─────────────────────────────────────── */
const TYPE_STYLE = {
  info:    { color: T.blue,   bg: T.blueSoft,  dot: T.blue,   label: 'Info'    },
  warning: { color: T.amber,  bg: T.amberSoft, dot: T.amber,  label: 'Warning' },
  success: { color: T.green,  bg: T.greenSoft, dot: T.green,  label: 'Success' },
  error:   { color: T.red,    bg: T.redSoft,   dot: T.red,    label: 'Error'   },
};

const getTypeStyle = (type) => TYPE_STYLE[type] || TYPE_STYLE.info;

/* ─── Time-ago helper ─────────────────────────────────────────── */
const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7)  return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

/* ─── Bell SVG ────────────────────────────────────────────────── */
const BellIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

const CheckIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const TrashIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
  </svg>
);

/* ─── Single notification row ─────────────────────────────────── */
const NotifRow = ({ n, onRead, onDelete }) => {
  const ts = getTypeStyle(n.type);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => !n.isRead && onRead(n._id)}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '11px 14px',
        borderBottom: `1px solid ${T.border}`,
        background: hovered ? T.surfaceMuted : n.isRead ? 'transparent' : `${ts.color}05`,
        cursor: n.isRead ? 'default' : 'pointer',
        transition: 'background 150ms ease',
      }}>
      {/* Type dot */}
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: ts.dot, marginTop: 5, flexShrink: 0,
        boxShadow: `0 0 0 3px ${ts.dot}22`,
        opacity: n.isRead ? 0.4 : 1,
      }} />

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12.5, fontWeight: n.isRead ? 500 : 700,
          color: n.isRead ? T.text3 : T.text,
          letterSpacing: '-0.01em',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {n.title}
        </div>
        <div style={{
          fontSize: 11.5, color: T.text3, marginTop: 2,
          lineHeight: 1.4, fontWeight: 400,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {n.message}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <span style={{
            fontSize: 10.5, color: T.text4, fontWeight: 500,
          }}>{timeAgo(n.createdAt)}</span>
          <span style={{
            padding: '1px 6px', borderRadius: 99,
            background: ts.bg, color: ts.color,
            fontSize: 9.5, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>{ts.label}</span>
        </div>
      </div>

      {/* Actions */}
      {hovered && (
        <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginTop: 1 }}>
          {!n.isRead && (
            <button
              title="Mark as read"
              onClick={(e) => { e.stopPropagation(); onRead(n._id); }}
              style={{
                width: 24, height: 24, borderRadius: 6,
                background: T.greenSoft, border: 'none',
                color: T.green, cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
              <CheckIcon />
            </button>
          )}
          <button
            title="Delete"
            onClick={(e) => { e.stopPropagation(); onDelete(n._id); }}
            style={{
              width: 24, height: 24, borderRadius: 6,
              background: T.redSoft, border: 'none',
              color: T.red, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
            <TrashIcon />
          </button>
        </div>
      )}
    </div>
  );
};

/* ─── Main component ──────────────────────────────────────────── */
const NotificationBell = ({ buttonStyle }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [isOpen,        setIsOpen]        = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [btnHovered,    setBtnHovered]    = useState(false);

  const wrapperRef = useRef(null);
  const socketRef  = useRef(null);

  /* Auth header helper */
  const authCfg = useCallback(() => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  }), []);

  /* Fetch unread badge count */
  const fetchUnreadCount = useCallback(async () => {
    if (!user?._id) return;
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data.unreadCount || 0);
    } catch { /* silent — badge just won't show */ }
  }, [user?._id, authCfg]);

  /* Fetch notification list */
  const fetchNotifications = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const data = await notificationService.getAll({ limit: 15 });
      setNotifications(data.notifications || []);
    } catch { /* show empty */ }
    finally { setLoading(false); }
  }, [user?._id, authCfg]);

  /* Socket.IO — real-time push */
  useEffect(() => {
    if (!user?._id) return;
    const socket = io(API, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-user-room', user._id);
    });

    socket.on('new-notification', (notif) => {
      setNotifications(prev => [notif, ...prev].slice(0, 15));
      setUnreadCount(prev => prev + 1);
    });

    return () => { socket.disconnect(); };
  }, [user?._id]);

  /* Initial badge load */
  useEffect(() => { fetchUnreadCount(); }, [fetchUnreadCount]);

  /* Fetch list when panel opens */
  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen, fetchNotifications]);

  /* Close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Mark one as read */
  const markAsRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* ignore */ }
  };

  /* Mark all as read */
  const markAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  /* Delete one */
  const deleteNotif = async (id) => {
    const n = notifications.find(x => x._id === id);
    try {
      await notificationService.remove(id);
      setNotifications(prev => prev.filter(x => x._id !== id));
      if (n && !n.isRead) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* ignore */ }
  };

  const defaultBtnStyle = {
    position: 'relative',
    width: 44, height: 44, borderRadius: 14,
    background: isOpen || btnHovered ? 'rgba(124,58,237,0.06)' : '#ffffff',
    border: `1px solid ${isOpen ? 'rgba(124,58,237,0.3)' : T.border}`,
    boxShadow: '0 4px 14px rgba(15,23,42,0.08), 0 1px 0 rgba(255,255,255,0.7) inset',
    cursor: 'pointer',
    color: isOpen ? '#7c3aed' : T.text2,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 200ms ease',
    fontFamily: 'inherit',
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', flexShrink: 0, zIndex: 9998 }}>
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        onMouseEnter={() => setBtnHovered(true)}
        onMouseLeave={() => setBtnHovered(false)}
        title="Notifications"
        aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications'}
        style={buttonStyle || defaultBtnStyle}
      >
        <BellIcon size={20} />
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 8, right: 9,
            width: unreadCount > 9 ? 18 : 14,
            height: 14,
            borderRadius: 99, background: T.red,
            border: '2px solid #ffffff',
            color: '#fff', fontSize: 8.5, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontVariantNumeric: 'tabular-nums', lineHeight: 1,
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          width: 360,
          background: T.surface,
          border: `1px solid ${T.borderHi}`,
          borderRadius: 18,
          boxShadow: T.shadow,
          zIndex: 9999,
          overflow: 'hidden',
          animation: 'notif-panel-in 0.18s cubic-bezier(0.16,1,0.3,1)',
          fontFamily: "'Plus Jakarta Sans','Inter',-apple-system,sans-serif",
        }}>
          <style>{`
            @keyframes notif-panel-in {
              from { opacity:0; transform:translateY(-8px) scale(0.97); }
              to   { opacity:1; transform:translateY(0)   scale(1);    }
            }
          `}</style>

          {/* Header */}
          <div style={{
            padding: '14px 16px 12px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: `1px solid ${T.border}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'linear-gradient(135deg,#a78bfa,#7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff',
              }}>
                <BellIcon size={14} />
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: T.text, letterSpacing: '-0.02em' }}>
                Notifications
              </div>
              {unreadCount > 0 && (
                <span style={{
                  padding: '1px 7px', borderRadius: 99,
                  background: '#7c3aed', color: '#fff',
                  fontSize: 10.5, fontWeight: 700,
                }}>
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  padding: '4px 10px', borderRadius: 8,
                  background: T.accentSoft, border: 'none',
                  color: '#7c3aed', fontSize: 11, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'filter 160ms ease',
                }}
                onMouseEnter={e => e.currentTarget.style.filter='brightness(0.94)'}
                onMouseLeave={e => e.currentTarget.style.filter='brightness(1)'}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  border: `3px solid ${T.accentSoft}`, borderTopColor: '#7c3aed',
                  animation: 'spin 0.7s linear infinite',
                  margin: '0 auto 10px',
                }} />
                <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
                <div style={{ fontSize: 12.5, color: T.text3 }}>Loading…</div>
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '44px 20px', textAlign: 'center', color: T.text3 }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>🔕</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: T.text2, marginBottom: 4 }}>All caught up</div>
                <div style={{ fontSize: 12, color: T.text3 }}>No notifications yet.</div>
              </div>
            ) : (
              notifications.map(n => (
                <NotifRow key={n._id} n={n} onRead={markAsRead} onDelete={deleteNotif} />
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{
              padding: '10px 16px',
              borderTop: `1px solid ${T.border}`,
              background: T.surfaceMuted,
              fontSize: 11, color: T.text4, textAlign: 'center', fontWeight: 500,
            }}>
              Showing {notifications.length} recent notification{notifications.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
