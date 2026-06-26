/**
 * StudentSubjectsPage.jsx — Chronos Student
 * Shows the subjects assigned to the student's class.
 * Backend: GET /timetables/student/:userId (extracts class), then GET /class-subjects/class/:classId
 * Route: /student-subjects
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import timetableService from '@/services/timetableService';
import classSubjectService from '@/services/classSubjectService';
import StudentLayout, {
  StudentCard, StudentEmptyState, StudentSpinner, StudentIcon, StudentT as T,
} from '@/layouts/StudentLayout';

const SubjectCard = ({ assignment, index }) => {
  const subjectColors = [T.accent, T.blue, T.green, T.amber, '#ec4899', '#06b6d4', '#8b5cf6', '#f97316'];
  const color = subjectColors[index % subjectColors.length];

  const code = assignment.subject?.code || '';
  const name = assignment.subject?.name || 'Unknown Subject';
  const lec  = assignment.subject?.lectures_per_week || 0;
  const type = assignment.subject?.subjectType || 'Theory';
  const teacher = assignment.teacher?.name || '—';

  return (
    <div className="bg-surface border border-border rounded-[20px] px-5 py-[18px] flex items-start gap-3.5" style={{
      boxShadow: T.shadowCard,
      transition: 'transform 280ms ease, box-shadow 280ms ease',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=T.shadowLift; }}
      onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=T.shadowCard; }}
    >
      {/* Color swatch */}
      <div className="w-11 h-11 rounded-[13px] flex-shrink-0 flex items-center justify-center text-[11px] font-bold" style={{
        background: `linear-gradient(135deg, ${color}30, ${color}15)`,
        color, border: `1px solid ${color}30`,
        letterSpacing: '-0.01em',
      }}>
        {code.slice(0, 4) || name.slice(0, 2).toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-[14.5px] font-bold text-text mb-1" style={{ letterSpacing: '-0.025em' }}>
          {name}
        </div>
        {code && (
          <div className="text-[11.5px] text-text3 font-medium mb-2">{code}</div>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Type badge */}
          <span className="px-2 py-0.5 rounded-[99px] text-[10.5px] font-bold" style={{
            background: `${color}18`, color, border: `1px solid ${color}28`,
          }}>
            {type}
          </span>
          {lec > 0 && (
            <span className="px-2 py-0.5 rounded-[99px] text-[10.5px] font-bold bg-surface-muted text-text3 border border-border">
              {lec} lec/wk
            </span>
          )}
        </div>
      </div>

      {/* Teacher */}
      <div className="text-right flex-shrink-0">
        <div className="text-[10.5px] text-text4 font-medium mb-[3px]">Teacher</div>
        <div className="text-[12.5px] font-semibold text-text2">{teacher}</div>
      </div>
    </div>
  );
};

const StudentSubjectsPage = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        // Step 1: get student timetable (contains class info)
        const ttData = await timetableService.getForStudent(user._id);
        const classId   = ttData?.class?._id || ttData?.timetable?.class?._id;
        const classData = ttData?.class       || ttData?.timetable?.class;

        if (!classId) {
          setError('Your class timetable has not been published yet. Subjects will appear once an admin publishes your timetable.');
          return;
        }

        setClassInfo(classData);

        // Step 2: get subjects for that class
        const subData = await classSubjectService.getByClass(classId);
        setSubjects(subData || []);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Your class timetable has not been published yet. Subjects will appear once an admin creates and publishes your timetable.');
        } else {
          setError('Could not load subjects. Make sure the backend is running.');
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const subtitle = classInfo
    ? `${classInfo.name || ''} · Semester ${classInfo.semester || ''} · Section ${classInfo.section || ''}`
    : 'Your enrolled subjects this semester';

  return (
    <StudentLayout title="My Subjects" subtitle={subtitle}>
      <div className="px-7 flex flex-col gap-4">

        {loading && <StudentCard><StudentSpinner text="Loading subjects…" /></StudentCard>}

        {!loading && error && (
          <div className="px-[18px] py-3.5 rounded-[14px] bg-amber-soft text-[13px] text-amber font-medium flex items-center gap-2" style={{ border: `1px solid ${T.amber}33` }}>
            <StudentIcon name="alert" size={14} />
            {error}
          </div>
        )}

        {!loading && !error && subjects.length === 0 && (
          <StudentCard>
            <StudentEmptyState
              icon="subject"
              message="No subjects assigned yet"
              subtext="Your admin hasn't assigned subjects to your class yet."
            />
          </StudentCard>
        )}

        {!loading && !error && subjects.length > 0 && (
          <>
            <div className="px-3.5 py-2.5 rounded-xl bg-accent-soft border border-accent-border text-[12.5px] text-accent font-semibold flex items-center gap-1.5">
              <StudentIcon name="book" size={13} />
              {subjects.length} subject{subjects.length !== 1 ? 's' : ''} enrolled this semester
            </div>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3">
              {subjects.map((assignment, i) => (
                <SubjectCard key={assignment._id || i} assignment={assignment} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentSubjectsPage;
