/**
 * TeacherClassesPage.jsx — Chronos Teacher
 * Shows all classes a teacher is assigned to, with subjects & quick actions.
 * Route: /teacher-classes
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import TeacherLayout, {
  TeacherCard, TeacherEmptyState, TeacherSpinner, TeacherIcon,
} from '@/layouts/TeacherLayout';
import { T } from '@/layouts/AdminLayout';
import teacherService from '@/services/teacherService';
import classSubjectService from '@/services/classSubjectService';

const SUBJECT_COLORS = [T.accent, T.blue, T.green, T.amber, '#ec4899', '#06b6d4', '#8b5cf6', '#f97316'];

const ClassCard = ({ cls, subjects, onMarkAttendance, onViewProgress }) => {
  const subjectCount = subjects.length;
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 22, overflow: 'hidden', boxShadow: T.shadowCard,
      transition: 'box-shadow 280ms ease',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = T.shadowLift; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = T.shadowCard; }}
    >
      {/* Header */}
      <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        {/* Class avatar */}
        <div style={{
          width: 48, height: 48, borderRadius: 14, flexShrink: 0,
          background: `linear-gradient(135deg, ${T.accent}30, ${T.accent}15)`,
          color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em',
          border: `1px solid ${T.accent}25`,
        }}>
          {cls.code?.slice(0, 4) || cls.name?.slice(0, 3) || 'CL'}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text, letterSpacing: '-0.025em' }}>
            {cls.name}
          </div>
          <div style={{ fontSize: 12, color: T.text3, fontWeight: 500, marginTop: 3 }}>
            {cls.code} · Semester {cls.semester} · Section {cls.section}
            {cls.program && <span style={{ color: T.text4 }}> · {cls.program}</span>}
          </div>

          {/* Subject count pill + student count */}
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            <span style={{
              padding: '3px 9px', borderRadius: 99, fontSize: 11, fontWeight: 700,
              background: T.accentSoft, color: T.accent, border: `1px solid ${T.accentBorder}`,
            }}>
              {subjectCount} subject{subjectCount !== 1 ? 's' : ''}
            </span>
            {cls.studentCount > 0 && (
              <span style={{
                padding: '3px 9px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                background: T.blueSoft, color: T.blue, border: `1px solid ${T.blue}28`,
              }}>
                {cls.studentCount} students
              </span>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            onClick={() => onMarkAttendance(cls)}
            title="Mark Attendance"
            style={{
              padding: '8px 12px', borderRadius: 9,
              background: T.greenSoft, border: `1px solid ${T.green}28`,
              color: T.green, fontSize: 11.5, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 5,
              transition: 'all 200ms ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = `${T.green}22`}
            onMouseLeave={e => e.currentTarget.style.background = T.greenSoft}
          >
            <TeacherIcon name="check" size={12} />
            Attendance
          </button>
          <button
            onClick={() => setExpanded(v => !v)}
            style={{
              width: 34, height: 34, borderRadius: 9,
              background: T.surfaceMuted, border: `1px solid ${T.border}`,
              color: T.text3, cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 200ms ease',
            }}
            onMouseEnter={e => e.currentTarget.style.color = T.text}
            onMouseLeave={e => e.currentTarget.style.color = T.text3}
          >
            <span style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 200ms ease', display: 'flex' }}>
              <TeacherIcon name="chevDown" size={14} />
            </span>
          </button>
        </div>
      </div>

      {/* Subject list (expanded) */}
      {expanded && subjects.length > 0 && (
        <div style={{ borderTop: `1px solid ${T.divider}`, padding: '14px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.text4, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
            Subjects You Teach
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {subjects.map((sub, i) => {
              const color = SUBJECT_COLORS[i % SUBJECT_COLORS.length];
              return (
                <div key={sub._id || i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', borderRadius: 11,
                  background: `${color}08`, border: `1px solid ${color}18`,
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: `${color}18`, color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, fontWeight: 700,
                  }}>
                    {(sub.code || sub.name || '').slice(0, 3).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{sub.name}</div>
                    {sub.code && <div style={{ fontSize: 11, color: T.text3, marginTop: 1 }}>{sub.code}</div>}
                  </div>
                  {sub.lectures_per_week > 0 && (
                    <div style={{ fontSize: 11, fontWeight: 600, color: T.text3, flexShrink: 0 }}>
                      {sub.lectures_per_week} lec/wk
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {expanded && subjects.length === 0 && (
        <div style={{ borderTop: `1px solid ${T.divider}`, padding: '14px 20px', fontSize: 13, color: T.text3, fontWeight: 500 }}>
          No subjects assigned for this class.
        </div>
      )}
    </div>
  );
};

const TeacherClassesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [teacherRecord, setTeacherRecord] = useState(null);
  const [classMap,  setClassMap]  = useState({}); // classId → { class, subjects[] }
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        // Resolve teacher record
        let tr = null;
        try {
          tr = await teacherService.getByUser(user._id);
          setTeacherRecord(tr);
        } catch {}

        if (!tr?._id) {
          setError('Could not find your teacher profile. Contact admin.');
          return;
        }

        // Get class-subject assignments
        const assignments = await classSubjectService.getByTeacher(tr._id) || [];

        // Group by class
        const map = {};
        assignments.forEach(a => {
          if (!a.class?._id) return;
          const cid = a.class._id;
          if (!map[cid]) {
            map[cid] = {
              class: {
                _id:          a.class._id,
                name:         a.class.name,
                code:         a.class.code,
                semester:     a.class.semester,
                section:      a.class.section,
                studentCount: a.class.studentCount || 0,
                program:      a.class.program?.name || '',
              },
              subjects: [],
            };
          }
          if (a.subject) {
            map[cid].subjects.push(a.subject);
          }
        });

        setClassMap(map);
      } catch (e) {
        setError('Could not load your classes. Make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const handleMarkAttendance = (cls) => {
    // Navigate to mark-attendance with class pre-selected (via state)
    navigate('/mark-attendance', { state: { classId: cls._id } });
  };

  const entries = Object.values(classMap);

  return (
    <TeacherLayout
      title="My Classes"
      subtitle="Classes and subjects you are assigned to this semester"
      actions={
        entries.length > 0 ? (
          <div style={{
            padding: '6px 14px', borderRadius: 10,
            background: T.accentSoft, border: `1px solid ${T.accentBorder}`,
            fontSize: 12.5, fontWeight: 700, color: T.accent,
          }}>
            {entries.length} class{entries.length !== 1 ? 'es' : ''}
          </div>
        ) : null
      }
    >
      <div style={{ padding: '0 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {loading && <TeacherCard><TeacherSpinner text="Loading your classes…" /></TeacherCard>}

        {!loading && error && (
          <div style={{ padding: '14px 18px', borderRadius: 14, background: T.amberSoft, border: `1px solid ${T.amber}33`, fontSize: 13, color: T.amber, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TeacherIcon name="alert" size={14} />
            {error}
          </div>
        )}

        {!loading && !error && entries.length === 0 && (
          <TeacherCard>
            <TeacherEmptyState
              icon="class"
              message="No classes assigned yet"
              subtext="Ask your admin to assign you to classes via Academic Resources → Assign Subjects."
            />
          </TeacherCard>
        )}

        {!loading && !error && entries.map(({ class: cls, subjects }) => (
          <ClassCard
            key={cls._id}
            cls={cls}
            subjects={subjects}
            onMarkAttendance={handleMarkAttendance}
            onViewProgress={() => navigate('/student-progress')}
          />
        ))}

        {!loading && entries.length > 0 && (
          <div style={{
            padding: '12px 16px', borderRadius: 12,
            background: T.accentSoft, border: `1px solid ${T.accentBorder}`,
            fontSize: 12.5, color: T.accent, fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <TeacherIcon name="info" size={14} />
            Click <strong>Attendance</strong> on any class to mark today's session, or expand a class to see subjects.
          </div>
        )}
      </div>
    </TeacherLayout>
  );
};

export default TeacherClassesPage;
