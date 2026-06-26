/**
 * TeacherGrading.jsx — Chronos Teacher
 * Grading queue for the logged-in teacher.
 * Route: /grading (teacher role)
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import TeacherLayout, {
  TeacherCard, TeacherEmptyState, TeacherSpinner, TeacherToast, TeacherIcon,
} from '@/layouts/TeacherLayout';
import { T } from '@/layouts/AdminLayout';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TYPE_COLORS = {
  Assignment: { bg: T.accentSoft,  fg: T.accent  },
  Quiz:       { bg: T.blueSoft,    fg: T.blue    },
  Lab:        { bg: T.greenSoft,   fg: T.green   },
  Essay:      { bg: T.amberSoft,   fg: T.amber   },
};

const typeColor = (type) => TYPE_COLORS[type] || { bg: T.surfaceMuted, fg: T.text3 };

const UrgencyBadge = ({ daysAgo }) => {
  const color = daysAgo >= 5 ? T.red : daysAgo >= 3 ? T.amber : T.text3;
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color }}>
      {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}
    </span>
  );
};

const GradingItem = ({ item, onGrade }) => {
  const tc = typeColor(item.type);
  return (
    <div className="ch-teacher-row" style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 16px', borderRadius: 14,
      borderBottom: `1px solid ${T.divider}`, cursor: 'pointer',
    }} onClick={() => onGrade(item)}>
      {/* Type badge */}
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: tc.bg, color: tc.fg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700, letterSpacing: '-0.01em',
      }}>
        {(item.type || 'AS').slice(0, 2).toUpperCase()}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: T.text, letterSpacing: '-0.02em', marginBottom: 2 }}>
          {item.title}
        </div>
        <div style={{ fontSize: 11.5, color: T.text3, fontWeight: 500 }}>
          {item.className}
          {item.type && (
            <span style={{
              marginLeft: 8, padding: '2px 7px', borderRadius: 99,
              background: tc.bg, color: tc.fg, fontSize: 10, fontWeight: 700,
            }}>
              {item.type}
            </span>
          )}
        </div>
      </div>

      {/* Count + age */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: T.text, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>
          {item.count}
          <span style={{ fontSize: 11, fontWeight: 500, color: T.text3, marginLeft: 3 }}>ungraded</span>
        </div>
        <UrgencyBadge daysAgo={item.daysAgo || 0} />
      </div>

      <TeacherIcon name="chev" size={14} />
    </div>
  );
};

const TeacherGrading = () => {
  const { user } = useAuth();
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [toast,   setToast]   = useState(null);

  useEffect(() => {
    if (!user) return;
    // No dedicated grading-queue endpoint exists in the backend yet.
    // This page will show an empty state until the backend ships /grading.
    setLoading(false);
  }, [user]);

  const totalPending = items.reduce((sum, it) => sum + (it.count || 0), 0);

  const handleGrade = () => {
    setToast({ msg: 'Grading interface coming soon.', type: 'success' });
  };

  /* Group by class */
  const grouped = items.reduce((acc, item) => {
    const key = item.className || 'Other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <TeacherLayout
      title="Grading Queue"
      subtitle="Pending submissions that need your attention"
      actions={
        totalPending > 0 ? (
          <div style={{
            padding: '8px 16px', borderRadius: 10,
            background: T.redSoft, border: `1px solid ${T.red}33`,
            fontSize: 13, fontWeight: 700, color: T.red,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <TeacherIcon name="alert" size={13} />
            {totalPending} items pending
          </div>
        ) : null
      }
    >
      {toast && <TeacherToast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ padding: '0 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {loading && (
          <TeacherCard>
            <TeacherSpinner text="Loading grading queue…" />
          </TeacherCard>
        )}

        {!loading && error && (
          <div style={{
            padding: '14px 18px', borderRadius: 14,
            background: T.amberSoft, border: `1px solid ${T.amber}33`,
            fontSize: 13, color: T.amber, fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <TeacherIcon name="alert" size={14} />
            {error}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <TeacherCard>
            <TeacherEmptyState
              icon="check"
              message="All caught up!"
              subtext="No pending grading items. Great work!"
            />
          </TeacherCard>
        )}

        {!loading && !error && Object.entries(grouped).map(([className, classItems]) => (
          <TeacherCard key={className} style={{ padding: 0, overflow: 'hidden' }}>
            {/* Class header */}
            <div style={{
              padding: '14px 20px',
              borderBottom: `1px solid ${T.divider}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9,
                  background: T.accentSoft, color: T.accent,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <TeacherIcon name="class" size={15} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text, letterSpacing: '-0.02em' }}>
                    {className}
                  </div>
                  <div style={{ fontSize: 11, color: T.text3, fontWeight: 500 }}>
                    {classItems.length} item{classItems.length !== 1 ? 's' : ''} to grade
                  </div>
                </div>
              </div>
              <div style={{
                padding: '4px 10px', borderRadius: 99,
                background: T.accentSoft, color: T.accent,
                fontSize: 12, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
              }}>
                {classItems.reduce((s, i) => s + (i.count || 0), 0)} total
              </div>
            </div>

            {/* Items */}
            {classItems.map((item, idx) => (
              <GradingItem
                key={idx}
                item={item}
                onGrade={handleGrade}
              />
            ))}
          </TeacherCard>
        ))}

        {/* Info note */}
        {!loading && (
          <div style={{
            padding: '12px 16px', borderRadius: 14,
            background: T.accentSoft, border: `1px solid ${T.accentBorder}`,
            fontSize: 12.5, color: T.accent, fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <TeacherIcon name="info" size={14} />
            Grading submissions will appear here once students submit assignments through the platform.
          </div>
        )}
      </div>
    </TeacherLayout>
  );
};

export default TeacherGrading;
