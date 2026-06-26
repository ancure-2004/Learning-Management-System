/**
 * AdminLeaveManagement.jsx — Chronos Admin
 * Admin reviews, approves, and rejects teacher leave applications.
 * Route: /admin-leaves
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import leaveService from '@/services/leaveService';
import AdminLayout from '@/layouts/AdminLayout';
import { T } from '@/layouts/AdminLayout';
import NotificationBell from '@/components/NotificationBell';

const STATUS_STYLE = {
  pending:   { color: T.amber, bg: T.amberSoft,   label: 'Pending'   },
  approved:  { color: T.green, bg: T.greenSoft,   label: 'Approved'  },
  rejected:  { color: T.red,   bg: T.redSoft,     label: 'Rejected'  },
  cancelled: { color: T.text3, bg: T.surfaceMuted, label: 'Cancelled' },
};

const LEAVE_TYPE_LABELS = {
  sick: 'Sick', casual: 'Casual', emergency: 'Emergency',
  personal: 'Personal', conference: 'Conference', other: 'Other',
};

const ss = (s) => STATUS_STYLE[s] || STATUS_STYLE.pending;
const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const daysBetween = (a, b) => Math.max(1, Math.ceil((new Date(b) - new Date(a)) / 86400000) + 1);

/* ─── Leave card (admin view) ───────────────────────────────── */
const AdminLeaveCard = ({ leave, onApprove, onReject }) => {
  const style   = ss(leave.status);
  const days    = daysBetween(leave.startDate, leave.endDate);
  const teacher = leave.teacher;
  const [rejectMode, setRejectMode] = useState(false);
  const [note,       setNote]       = useState('');
  const [busy,       setBusy]       = useState(false);

  const handleApprove = async () => {
    setBusy(true);
    await onApprove(leave._id);
    setBusy(false);
  };

  const handleReject = async () => {
    if (!note.trim()) return;
    setBusy(true);
    await onReject(leave._id, note);
    setBusy(false);
    setRejectMode(false);
    setNote('');
  };

  return (
    <div style={{
      background: T.surface, borderRadius: 18,
      border: `1px solid ${leave.isUrgent ? T.red + '40' : T.border}`,
      boxShadow: T.shadowCard,
      overflow: 'hidden',
    }}>
      {/* Header bar */}
      {leave.isUrgent && (
        <div style={{ padding: '6px 20px', background: T.redSoft, color: T.red, fontSize: 11.5, fontWeight: 700 }}>
          ⚠️ URGENT REQUEST
        </div>
      )}

      <div style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          {/* Avatar */}
          <div style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            background: `linear-gradient(135deg,${T.accent}30,${T.accent}15)`,
            color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700,
          }}>
            {teacher?.firstName?.[0]}{teacher?.lastName?.[0]}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Teacher name + badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>
                {teacher?.firstName} {teacher?.lastName}
              </span>
              <span style={{
                padding: '2px 8px', borderRadius: 99,
                background: `${T.accent}18`, color: T.accent,
                fontSize: 10.5, fontWeight: 700,
              }}>
                {LEAVE_TYPE_LABELS[leave.leaveType] || leave.leaveType}
              </span>
              <span style={{
                padding: '2px 8px', borderRadius: 99,
                background: style.bg, color: style.color,
                fontSize: 10.5, fontWeight: 700,
              }}>
                {style.label}
              </span>
            </div>

            {/* Dates */}
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text2, marginBottom: 4 }}>
              {fmt(leave.startDate)} → {fmt(leave.endDate)}
              <span style={{ color: T.text3, fontWeight: 400, marginLeft: 8 }}>{days} day{days !== 1 ? 's' : ''}</span>
            </div>

            {/* Reason */}
            <div style={{ fontSize: 12.5, color: T.text3, fontWeight: 400, marginBottom: 10 }}>
              {leave.reason}
            </div>

            {/* Applied on */}
            <div style={{ fontSize: 11, color: T.text4 }}>
              Applied {fmt(leave.createdAt)}
              {leave.approvedAt && ` · Actioned ${fmt(leave.approvedAt)}`}
            </div>

            {/* Admin note */}
            {leave.adminNote && (
              <div style={{
                marginTop: 8, padding: '8px 12px', borderRadius: 9,
                background: T.surfaceMuted, border: `1px solid ${T.border}`,
                fontSize: 12, color: T.text2,
              }}>
                <strong>Note:</strong> {leave.adminNote}
              </div>
            )}

            {/* Affected slots (after approval) */}
            {leave.status === 'approved' && leave.affectedSlots?.length > 0 && (
              <div style={{
                marginTop: 10, padding: '10px 14px', borderRadius: 10,
                background: T.amberSoft, border: `1px solid ${T.amber}28`,
                fontSize: 12, color: T.amber, fontWeight: 500,
              }}>
                🗓 {leave.affectedSlots.reduce((a, s) => a + s.affectedDates.length, 0)} class session(s) cancelled in:{' '}
                <strong>{[...new Set(leave.affectedSlots.map(s => s.className))].join(', ')}</strong>
              </div>
            )}
            {leave.status === 'approved' && (!leave.affectedSlots || leave.affectedSlots.length === 0) && (
              <div style={{ marginTop: 8, fontSize: 12, color: T.text4, fontStyle: 'italic' }}>
                No scheduled classes affected.
              </div>
            )}
          </div>

          {/* Actions (only for pending) */}
          {leave.status === 'pending' && !rejectMode && (
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button
                onClick={handleApprove}
                disabled={busy}
                style={{
                  padding: '8px 16px', borderRadius: 9,
                  background: T.greenSoft, border: `1px solid ${T.green}28`,
                  color: T.green, fontSize: 12.5, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                  opacity: busy ? 0.6 : 1,
                }}
              >
                {busy ? '…' : '✓ Approve'}
              </button>
              <button
                onClick={() => setRejectMode(true)}
                disabled={busy}
                style={{
                  padding: '8px 16px', borderRadius: 9,
                  background: T.redSoft, border: `1px solid ${T.red}28`,
                  color: T.red, fontSize: 12.5, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                ✕ Reject
              </button>
            </div>
          )}
        </div>

        {/* Reject form */}
        {rejectMode && (
          <div style={{
            marginTop: 14, padding: '14px', borderRadius: 12,
            background: T.redSoft, border: `1px solid ${T.red}28`,
          }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: T.red, marginBottom: 8 }}>
              Rejection reason (required)
            </div>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
              placeholder="Enter reason for rejection…"
              style={{
                width: '100%', padding: '8px 10px', borderRadius: 8,
                border: `1px solid ${T.red}40`, background: T.surface,
                color: T.text, fontSize: 12.5, fontFamily: 'inherit',
                outline: 'none', resize: 'vertical', boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button
                onClick={handleReject}
                disabled={busy || !note.trim()}
                style={{
                  padding: '7px 14px', borderRadius: 8,
                  background: T.red, border: 'none', color: '#fff',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  opacity: (!note.trim() || busy) ? 0.5 : 1,
                }}
              >
                {busy ? 'Rejecting…' : 'Confirm Reject'}
              </button>
              <button
                onClick={() => { setRejectMode(false); setNote(''); }}
                style={{
                  padding: '7px 14px', borderRadius: 8,
                  background: T.surfaceMuted, border: `1px solid ${T.border}`,
                  color: T.text2, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Main admin page ───────────────────────────────────────── */
const AdminLeaveManagement = () => {
  const { user } = useAuth();
  const [leaves,  setLeaves]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('pending');
  const [toast,   setToast]   = useState(null);

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      let data;
      if (filter === 'all') {
        data = await leaveService.getAll();
      } else if (filter === 'pending') {
        data = await leaveService.getPending();
      } else {
        data = await leaveService.getAll({ status: filter });
      }
      setLeaves(data.leaves || []);
    } catch { /* show empty */ }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  const handleApprove = async (id) => {
    try {
      const r = await leaveService.approve(id);
      const impact = r.impactSummary;
      const msg = impact?.sessionsAffected > 0
        ? `Leave approved. ${impact.sessionsAffected} session(s) across ${impact.classesAffected} class(es) marked as cancelled.`
        : 'Leave approved. No scheduled classes are affected.';
      setToast({ msg, type: 'success' });
      fetchLeaves();
    } catch (e) {
      setToast({ msg: e.response?.data?.error || 'Failed to approve leave.', type: 'error' });
    }
  };

  const handleReject = async (id, note) => {
    try {
      await leaveService.reject(id, { adminNote: note });
      setToast({ msg: 'Leave rejected and teacher notified.', type: 'success' });
      fetchLeaves();
    } catch (e) {
      setToast({ msg: e.response?.data?.error || 'Failed to reject leave.', type: 'error' });
    }
  };

  const FILTERS = [
    { key: 'pending',  label: 'Pending',  color: T.amber },
    { key: 'approved', label: 'Approved', color: T.green },
    { key: 'rejected', label: 'Rejected', color: T.red   },
    { key: 'all',      label: 'All',      color: T.text3 },
  ];

  const filteredCount = leaves.length;

  return (
    <AdminLayout
      title="Leave Management"
      subtitle="Review and action teacher leave applications"
    >
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 76, right: 24, zIndex: 9999,
          padding: '12px 20px', borderRadius: 12,
          background: toast.type === 'success' ? T.greenSoft : T.redSoft,
          border: `1px solid ${toast.type === 'success' ? T.green : T.red}30`,
          color: toast.type === 'success' ? T.green : T.red,
          fontSize: 13, fontWeight: 600,
          boxShadow: T.shadowLift,
          animation: 'admin-toast-in 0.2s ease-out',
        }}>
          {toast.msg}
          <button onClick={() => setToast(null)} style={{ marginLeft: 12, background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 700 }}>×</button>
        </div>
      )}

      <div style={{ padding: '0 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)} style={{
                padding: '8px 16px', borderRadius: 10, fontFamily: 'inherit',
                fontWeight: 700, fontSize: 12.5, cursor: 'pointer',
                background: filter === f.key ? f.color : T.surface,
                color:      filter === f.key ? '#fff'   : T.text2,
                border:     filter === f.key ? 'none'   : `1px solid ${T.border}`,
                transition: 'all 180ms ease',
              }}>{f.label}</button>
            ))}
          </div>
          <div style={{ fontSize: 12.5, color: T.text3, fontWeight: 500 }}>
            {filteredCount} application{filteredCount !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ background: T.surface, borderRadius: 18, padding: '40px', textAlign: 'center', color: T.text3 }}>
            Loading…
          </div>
        ) : leaves.length === 0 ? (
          <div style={{
            background: T.surface, borderRadius: 18, padding: '60px 24px',
            textAlign: 'center', color: T.text3, boxShadow: T.shadowCard,
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.text2, marginBottom: 4 }}>
              {filter === 'pending' ? 'No pending leave requests' : `No ${filter} leaves`}
            </div>
            <div style={{ fontSize: 12.5 }}>
              {filter === 'pending' ? 'All caught up!' : 'Try a different filter.'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {leaves.map(l => (
              <AdminLeaveCard
                key={l._id} leave={l}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminLeaveManagement;
