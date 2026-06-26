/**
 * TeacherSyllabus.jsx — Chronos Teacher
 * Teacher's read-only view of their assigned subject syllabi.
 * Route: /manage-syllabus (teacher role)
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import TeacherLayout, {
  TeacherCard, TeacherEmptyState, TeacherSpinner, TeacherIcon,
} from '@/layouts/TeacherLayout';
import { T } from '@/layouts/AdminLayout';
import syllabusService from '@/services/syllabusService';

const ProgressBar = ({ value, color = T.accent }) => {
  const pct = Math.min(100, Math.max(0, value || 0));
  return (
    <div style={{ height: 7, borderRadius: 99, background: T.surfaceMuted, overflow: 'hidden', flex: 1 }}>
      <div style={{
        height: '100%', borderRadius: 99,
        width: `${pct}%`,
        background: `linear-gradient(90deg, ${color}99, ${color})`,
        transition: 'width 600ms cubic-bezier(0.16,1,0.3,1)',
      }} />
    </div>
  );
};

const WeightChip = ({ label, value, color }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', gap: 4, flex: 1,
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, color: T.text3 }}>
      <span>{label}</span>
      <span style={{ color, fontVariantNumeric: 'tabular-nums' }}>{value}%</span>
    </div>
    <ProgressBar value={value} color={color} />
  </div>
);

const SyllabusCard = ({ syllabus }) => {
  const [open, setOpen] = useState(false);
  const mid  = syllabus.midtermWeight  || 0;
  const end  = syllabus.endsemWeight   || 0;
  const asgn = syllabus.assignmentWeight || 0;
  const total = syllabus.totalRequiredHours || 0;
  const theory = syllabus.theoryHours || 0;
  const lab    = syllabus.labHours    || 0;

  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 20, overflow: 'hidden',
      boxShadow: T.shadowCard,
      transition: 'box-shadow 300ms ease',
    }}>
      {/* Header row */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 14,
          padding: '16px 20px', background: 'none', border: 'none',
          cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
          borderBottom: open ? `1px solid ${T.divider}` : 'none',
          transition: 'background 200ms ease',
        }}
        onMouseEnter={e => e.currentTarget.style.background = T.surfaceMuted}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: T.accentSoft, color: T.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700,
        }}>
          {(syllabus.subject?.code || syllabus.subject?.name || 'SB').slice(0, 3).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text, letterSpacing: '-0.025em' }}>
            {syllabus.subject?.name || 'Subject'}
          </div>
          <div style={{ fontSize: 11.5, color: T.text3, fontWeight: 500, marginTop: 2 }}>
            {syllabus.subject?.code && `${syllabus.subject.code} · `}
            Sem {syllabus.semester || '—'} · {syllabus.academicYear || '—'}
          </div>
        </div>

        {/* Hours pill */}
        <div style={{
          padding: '5px 12px', borderRadius: 99,
          background: T.surfaceMuted, border: `1px solid ${T.border}`,
          fontSize: 12, fontWeight: 600, color: T.text2, flexShrink: 0,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {total}h total
        </div>

        <TeacherIcon name={open ? 'chevDown' : 'chev'} size={14} />
      </button>

      {/* Expanded detail */}
      {open && (
        <div style={{ padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Hours breakdown */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.text2, marginBottom: 12, letterSpacing: '-0.01em' }}>
              Hours Breakdown
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { label: 'Theory', hours: theory, color: T.blue },
                { label: 'Lab',    hours: lab,    color: T.accent },
                { label: 'Other',  hours: Math.max(0, total - theory - lab), color: T.text4 },
              ].map(({ label, hours, color }) => (
                <div key={label} style={{
                  flex: 1, background: T.surfaceMuted, border: `1px solid ${T.border}`,
                  borderRadius: 14, padding: '12px 16px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>
                    {hours}
                  </div>
                  <div style={{ fontSize: 11, color: T.text3, fontWeight: 600, marginTop: 3 }}>{label} hrs</div>
                </div>
              ))}
            </div>
          </div>

          {/* Assessment weights */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.text2, marginBottom: 12, letterSpacing: '-0.01em' }}>
              Assessment Weights
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <WeightChip label="Midterm"       value={mid}  color={T.blue}   />
              <WeightChip label="End Semester"  value={end}  color={T.accent} />
              <WeightChip label="Assignments"   value={asgn} color={T.green}  />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TeacherSyllabus = () => {
  const { user } = useAuth();
  const [syllabi,  setSyllabi]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    if (!user) return;

    // Backend route: GET /syllabus/year/:academicYear
    // Try current year then previous year as fallback
    const curYear = new Date().getFullYear();
    const years = [`${curYear}-${String(curYear + 1).slice(2)}`, `${curYear - 1}-${String(curYear).slice(2)}`, String(curYear)];

    const tryYear = async (idx = 0) => {
      if (idx >= years.length) {
        setLoading(false);
        return;
      }
      try {
        const res = await syllabusService.getByYear(years[idx]);
        const data = res?.syllabi || res || [];
        if (data.length > 0) {
          setSyllabi(data);
          setLoading(false);
        } else {
          tryYear(idx + 1);
        }
      } catch {
        tryYear(idx + 1);
      }
    };

    tryYear();
  }, [user]);

  /* Group syllabi by subject name */
  const grouped = syllabi.reduce((acc, s) => {
    const key = s.academicYear || 'All Years';
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  return (
    <TeacherLayout
      title="My Syllabus"
      subtitle="Syllabus structures for your assigned subjects"
    >
      <div style={{ padding: '0 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Info note */}
        <div style={{
          padding: '12px 16px', borderRadius: 14,
          background: T.accentSoft, border: `1px solid ${T.accentBorder}`,
          fontSize: 12.5, color: T.accent, fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <TeacherIcon name="info" size={14} />
          <span>
            <strong>Read-only view.</strong> Syllabus structures are created by your admin.
            Contact admin to update hours or assessment weights.
          </span>
        </div>

        {loading && (
          <TeacherCard>
            <TeacherSpinner text="Loading syllabus…" />
          </TeacherCard>
        )}

        {!loading && error && (
          <div style={{ padding: '14px 18px', borderRadius: 14, background: T.amberSoft, border: `1px solid ${T.amber}33`, fontSize: 13, color: T.amber, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TeacherIcon name="alert" size={14} />
            {error}
          </div>
        )}

        {!loading && !error && syllabi.length === 0 && (
          <TeacherCard>
            <TeacherEmptyState
              icon="syllabus"
              message="No syllabus assigned yet"
              subtext="Your admin hasn't created syllabus structures for your subjects yet. Ask them to add syllabi through the Admin panel."
            />
          </TeacherCard>
        )}

        {!loading && !error && Object.entries(grouped).map(([year, items]) => (
          <div key={year}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: T.text4,
              textTransform: 'uppercase', letterSpacing: '0.08em',
              marginBottom: 10, paddingLeft: 4,
            }}>
              {year}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {items.map((s, i) => (
                <SyllabusCard key={s._id || i} syllabus={s} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </TeacherLayout>
  );
};

export default TeacherSyllabus;
