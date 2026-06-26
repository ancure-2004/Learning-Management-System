/**
 * TeacherLeavePage.jsx — Chronos Teacher
 * Teacher applies for leave and views their leave history.
 * Route: /teacher-leave
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import TeacherLayout, {
  TeacherCard, TeacherEmptyState, TeacherSpinner, TeacherIcon,
  TeacherToast, TeacherPrimaryBtn,
} from '@/layouts/TeacherLayout';
import { T } from '@/layouts/AdminLayout';
import leaveService from '@/services/leaveService';

const LEAVE_TYPES = [
  { value: 'sick',       label: 'Sick Leave',        color: T.red    },
  { value: 'casual',     label: 'Casual Leave',       color: T.blue   },
  { value: 'emergency',  label: 'Emergency Leave',    color: T.amber  },
  { value: 'personal',   label: 'Personal Leave',     color: T.accent },
  { value: 'conference', label: 'Conference / Event', color: T.green  },
  { value: 'other',      label: 'Other',              color: T.text3  },
];

const STATUS_STYLE = {
  pending:   { color: T.amber,  bg: T.amberSoft,  label: 'Pending'   },
  approved:  { color: T.green,  bg: T.greenSoft,  label: 'Approved'  },
  rejected:  { color: T.red,    bg: T.redSoft,    label: 'Rejected'  },
  cancelled: { color: T.text3,  bg: T.surfaceMuted, label: 'Cancelled' },
};

const statusStyle = (s) => STATUS_STYLE[s] || STATUS_STYLE.pending;

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const daysBetween = (a, b) =>
  Math.max(1, Math.ceil((new Date(b) - new Date(a)) / 86400000) + 1);

/* ─── Leave card ────────────────────────────────────────────── */
const LeaveCard = ({ leave, onCancel }) => {
  const ss  = statusStyle(leave.status);
  const lt  = LEAVE_TYPES.find(t => t.value === leave.leaveType) || { label: leave.leaveType, color: T.text3 };
  const days = daysBetween(leave.startDate, leave.endDate);
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    setCancelling(true);
    await onCancel(leave._id);
    setCancelling(false);
  };

  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 18, padding: '16px 20px',
      boxShadow: T.shadowCard,
      display: 'flex', alignItems: 'flex-start', gap: 16,
      transition: 'box-shadow 240ms ease',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = T.shadowLift}
      onMouseLeave={e => e.currentTarget.style.boxShadow = T.shadowCard}
    >
      {/* Type color strip */}
      <div style={{
        width: 4, alignSelf: 'stretch', borderRadius: 99, flexShrink: 0,
        background: lt.color, opacity: 0.7,
      }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Row 1: type + status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{
            padding: '2px 9px', borderRadius: 99,
            background: `${lt.color}18`, color: lt.color,
            fontSize: 11, fontWeight: 700, letterSpacing: '-0.01em',
          }}>{lt.label}</span>
          <span style={{
            padding: '2px 9px', borderRadius: 99,
            background: ss.bg, color: ss.color,
            fontSize: 11, fontWeight: 700,
          }}>{ss.label}</span>
          {leave.isUrgent && (
            <span style={{
              padding: '2px 9px', borderRadius: 99,
              background: T.redSoft, color: T.red,
              fontSize: 10, fontWeight: 700,
            }}>URGENT</span>
          )}
        </div>

        {/* Dates */}
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text, letterSpacing: '-0.02em', marginBottom: 4 }}>
          {formatDate(leave.startDate)} → {formatDate(leave.endDate)}
          <span style={{ fontSize: 11.5, color: T.text3, fontWeight: 500, marginLeft: 8 }}>
            {days} day{days !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Reason */}
        <div style={{ fontSize: 12.5, color: T.text3, fontWeight: 500, marginBottom: 6 }}>
          {leave.reason}
        </div>

        {/* Admin note */}
        {leave.adminNote && (
          <div style={{
            padding: '8px 12px', borderRadius: 10,
            background: leave.status === 'approved' ? T.greenSoft : T.redSoft,
            color: leave.status === 'approved' ? T.green : T.red,
            fontSize: 12, fontWeight: 500, marginBottom: 6,
          }}>
            <strong>Admin note:</strong> {leave.adminNote}
          </div>
        )}

        {/* Affected slots summary */}
        {leave.status === 'approved' && leave.affectedSlots?.length > 0 && (
          <div style={{
            padding: '8px 12px', borderRadius: 10,
            background: T.amberSoft, color: T.amber,
            fontSize: 11.5, fontWeight: 500,
          }}>
            ⚠️ {leave.affectedSlots.reduce((a, s) => a + s.affectedDates.length, 0)} class session(s) cancelled:&nbsp;
            {[...new Set(leave.affectedSlots.map(s => s.className))].join(', ')}
          </div>
        )}

        {leave.status === 'approved' && (!leave.affectedSlots || leave.affectedSlots.length === 0) && (
          <div style={{ fontSize: 11.5, color: T.text4, fontStyle: 'italic' }}>
            No scheduled classes affected during this period.
          </div>
        )}
      </div>

      {/* Cancel button (only for pending) */}
      {leave.status === 'pending' && (
        <button
          onClick={handleCancel}
          disabled={cancelling}
          style={{
            padding: '7px 14px', borderRadius: 9,
            background: T.redSoft, border: `1px solid ${T.red}28`,
            color: T.red, fontSize: 12, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
            flexShrink: 0, opacity: cancelling ? 0.6 : 1,
          }}
        >
          {cancelling ? 'Cancelling…' : 'Withdraw'}
        </button>
      )}
    </div>
  );
};

/* ─── Main page ─────────────────────────────────────────────── */
const TeacherLeavePage = () => {
  const { user } = useAuth();
  const [leaves,  setLeaves]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast,   setToast]   = useState(null);
  const [tab,     setTab]     = useState('history'); // 'apply' | 'history'

  // Form state
  const [form, setForm] = useState({
    leaveType: 'casual',
    startDate: '',
    endDate: '',
    reason: '',
    isUrgent: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState('');

  const fetchLeaves = useCallback(async () => {
    try {
      const data = await leaveService.getMine();
      setLeaves(data.leaves || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  const handleSubmit = async () => {
    setFormError('');
    if (!form.startDate || !form.endDate || !form.reason.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      await leaveService.apply(form);
      setToast({ msg: 'Leave application submitted successfully!', type: 'success' });
      setForm({ leaveType: 'casual', startDate: '', endDate: '', reason: '', isUrgent: false });
      setTab('history');
      fetchLeaves();
    } catch (e) {
      setFormError(e.response?.data?.error || 'Failed to submit leave application.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await leaveService.remove(id);
      setToast({ msg: 'Leave application withdrawn.', type: 'success' });
      fetchLeaves();
    } catch (e) {
      setToast({ msg: e.response?.data?.error || 'Failed to withdraw.', type: 'error' });
    }
  };

  const today    = new Date().toISOString().slice(0, 10);
  const pending  = leaves.filter(l => l.status === 'pending');
  const approved = leaves.filter(l => l.status === 'approved');

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 10,
    border: `1px solid ${T.border}`, background: T.surfaceMuted,
    color: T.text, fontSize: 13, fontFamily: 'inherit', outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <TeacherLayout
      title="Leave Application"
      subtitle="Apply for leave and view your leave history"
    >
      {toast && <TeacherToast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ padding: '0 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Tab row + stats */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { key: 'apply',   label: '+ Apply for Leave' },
              { key: 'history', label: `History (${leaves.length})` },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                padding: '8px 16px', borderRadius: 10, fontFamily: 'inherit',
                fontWeight: 700, fontSize: 12.5, cursor: 'pointer',
                background: tab === t.key ? T.accent : T.surface,
                color:      tab === t.key ? '#fff'    : T.text2,
                border:     tab === t.key ? 'none'    : `1px solid ${T.border}`,
                transition: 'all 180ms ease',
              }}>{t.label}</button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { label: 'Pending',  value: pending.length,  color: T.amber },
              { label: 'Approved', value: approved.length, color: T.green },
            ].map(s => (
              <div key={s.label} style={{
                padding: '5px 12px', borderRadius: 10,
                background: `${s.color}10`, border: `1px solid ${s.color}20`,
                fontSize: 12, fontWeight: 600, color: s.color,
              }}>
                {s.value} {s.label}
              </div>
            ))}
          </div>
        </div>

        {/* ── Apply Form ──────────────────────────────────── */}
        {tab === 'apply' && (
          <TeacherCard style={{ padding: '22px 24px', maxWidth: 600 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 20 }}>
              New Leave Application
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Leave type */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.text2, marginBottom: 6 }}>Leave Type *</div>
                <select value={form.leaveType}
                  onChange={e => setForm(f => ({ ...f, leaveType: e.target.value }))}
                  style={inputStyle}>
                  {LEAVE_TYPES.map(lt => (
                    <option key={lt.value} value={lt.value}>{lt.label}</option>
                  ))}
                </select>
              </div>

              {/* Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.text2, marginBottom: 6 }}>Start Date *</div>
                  <input type="date" min={today} value={form.startDate}
                    onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                    style={inputStyle} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.text2, marginBottom: 6 }}>End Date *</div>
                  <input type="date" min={form.startDate || today} value={form.endDate}
                    onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                    style={inputStyle} />
                </div>
              </div>

              {/* Duration preview */}
              {form.startDate && form.endDate && (
                <div style={{
                  padding: '8px 12px', borderRadius: 9,
                  background: T.accentSoft, color: T.accent,
                  fontSize: 12.5, fontWeight: 600,
                }}>
                  Duration: {daysBetween(form.startDate, form.endDate)} day(s)
                </div>
              )}

              {/* Reason */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.text2, marginBottom: 6 }}>Reason *</div>
                <textarea
                  value={form.reason}
                  onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                  rows={4}
                  placeholder="Describe the reason for your leave…"
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
                />
              </div>

              {/* Urgent checkbox */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isUrgent}
                  onChange={e => setForm(f => ({ ...f, isUrgent: e.target.checked }))}
                  style={{ width: 15, height: 15, accentColor: T.red }} />
                <span style={{ fontSize: 12.5, fontWeight: 500, color: T.text2 }}>
                  Mark as urgent (admin will see this flagged)
                </span>
              </label>

              {formError && (
                <div style={{ padding: '10px 14px', borderRadius: 10, background: T.redSoft, color: T.red, fontSize: 12.5, fontWeight: 500 }}>
                  {formError}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <TeacherPrimaryBtn onClick={handleSubmit} disabled={submitting} icon="calendar">
                  {submitting ? 'Submitting…' : 'Submit Application'}
                </TeacherPrimaryBtn>
              </div>
            </div>
          </TeacherCard>
        )}

        {/* ── History Tab ─────────────────────────────────── */}
        {tab === 'history' && (
          <>
            {loading ? (
              <TeacherCard><TeacherSpinner text="Loading leave history…" /></TeacherCard>
            ) : leaves.length === 0 ? (
              <TeacherCard>
                <TeacherEmptyState
                  icon="calendar"
                  message="No leave applications yet"
                  subtext="Click '+ Apply for Leave' to submit your first leave request."
                />
              </TeacherCard>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {leaves.map(l => (
                  <LeaveCard key={l._id} leave={l} onCancel={handleCancel} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </TeacherLayout>
  );
};

export default TeacherLeavePage;
