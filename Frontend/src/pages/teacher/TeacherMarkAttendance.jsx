/**
 * TeacherMarkAttendance.jsx — Chronos Teacher
 * Mark attendance for a class session.
 * Route: /mark-attendance
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import TeacherLayout, {
  TeacherCard, TeacherEmptyState, TeacherSpinner, TeacherIcon,
  TeacherToast, TeacherPrimaryBtn,
} from '@/layouts/TeacherLayout';
import { T } from '@/layouts/AdminLayout';
import teacherService from '@/services/teacherService';
import classSubjectService from '@/services/classSubjectService';
import attendanceService from '@/services/attendanceService';

/* ─── Small toggle pill ─────────────────────────────────────── */
const StatusToggle = ({ status, onChange }) => {
  const opts = [
    { v: 'present', label: 'P', color: T.green,  bg: T.greenSoft },
    { v: 'absent',  label: 'A', color: T.red,    bg: T.redSoft   },
    { v: 'late',    label: 'L', color: T.amber,  bg: T.amberSoft },
  ];
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {opts.map(o => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          style={{
            width: 32, height: 28, borderRadius: 7,
            background:  status === o.v ? o.color : T.surfaceMuted,
            color:       status === o.v ? '#fff'   : T.text3,
            border:      status === o.v ? 'none'   : `1px solid ${T.border}`,
            fontWeight:  700, fontSize: 11,
            cursor: 'pointer', fontFamily: 'inherit',
            transition: 'all 180ms ease',
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
};

/* ─── Stat badge ──────────────────────────────────────────────── */
const StatBadge = ({ value, label, color }) => (
  <div style={{
    textAlign: 'center', padding: '10px 16px',
    background: `${color}10`, border: `1px solid ${color}20`, borderRadius: 12,
  }}>
    <div style={{ fontSize: 22, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.04em' }}>
      {value}
    </div>
    <div style={{ fontSize: 11, fontWeight: 600, color: T.text3, marginTop: 2 }}>{label}</div>
  </div>
);

/* ─── Main component ─────────────────────────────────────────── */
const TeacherMarkAttendance = () => {
  const { user } = useAuth();

  // Step 1: pick class + subject + date + slot
  const [teacherRecord, setTeacherRecord] = useState(null);
  const [assignments,   setAssignments]   = useState([]);  // class-subjects
  const [selectedAssign, setSelectedAssign] = useState(''); // "classId|subjectId"
  const [date,    setDate]    = useState(() => new Date().toISOString().slice(0, 10));
  const [timeSlot, setTimeSlot] = useState('9:00');

  // Step 2: student list
  const [students,  setStudents]  = useState([]);
  const [statuses,  setStatuses]  = useState({});   // { studentId: 'present'|'absent'|'late' }
  const [classInfo, setClassInfo] = useState(null);

  // Step 3: history
  const [sessions, setSessions] = useState([]);

  const [step,    setStep]    = useState(1); // 1=pick, 2=mark, 3=done
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState(null);
  const [error,   setError]   = useState('');

  /* Load teacher record + assignments */
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        // Resolve Teacher record
        let tr = null;
        try { tr = await teacherService.getByUser(user._id); } catch {}
        setTeacherRecord(tr);

        if (tr?._id) {
          const assignments = await classSubjectService.getByTeacher(tr._id);
          setAssignments(assignments || []);
        }
      } catch (e) {
        setError('Could not load your class assignments.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  /* When assignment selected, fetch students */
  const loadStudents = async () => {
    if (!selectedAssign) return;
    const [classId, subjectId] = selectedAssign.split('|');
    setLoading(true); setError('');
    try {
      const r = await attendanceService.getClassStudents(classId);
      const studs = r.students || [];
      setClassInfo(r.class);
      setStudents(studs);
      // Default everyone to 'present'
      const init = {};
      studs.forEach(s => { init[s._id] = 'present'; });
      setStatuses(init);

      // Also fetch recent sessions for this class
      const sess = await attendanceService.getSessionsByClass(classId, { subjectId, limit: 5 });
      setSessions(sess.sessions || []);

      setStep(2);
    } catch (e) {
      setError('Could not load students for this class. Make sure students are enrolled (matching program/semester/section).');
    } finally {
      setLoading(false);
    }
  };

  /* Mark all present / all absent helpers */
  const markAll = (status) => {
    const next = {};
    students.forEach(s => { next[s._id] = status; });
    setStatuses(next);
  };

  /* Submit */
  const handleSubmit = async () => {
    const [classId, subjectId] = selectedAssign.split('|');
    setSaving(true);
    try {
      await attendanceService.mark({
        classId,
        subjectId,
        teacherId: user._id,
        date,
        timeSlot,
        students: students.map(s => ({ studentId: s._id, status: statuses[s._id] || 'absent' })),
      });

      setToast({ msg: `Attendance saved — ${presentCount} present, ${absentCount} absent`, type: 'success' });
      setStep(3);
    } catch (e) {
      setToast({ msg: e.response?.data?.error || 'Failed to save attendance', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const presentCount = students.filter(s => statuses[s._id] === 'present').length;
  const absentCount  = students.filter(s => statuses[s._id] === 'absent').length;
  const lateCount    = students.filter(s => statuses[s._id] === 'late').length;

  /* Group assignments by class for cleaner select */
  const assignOptions = assignments.map(a => ({
    value:  `${a.class?._id}|${a.subject?._id}`,
    label:  `${a.class?.name || '—'} — ${a.subject?.name || '—'}`,
  }));

  const TIME_SLOTS = ['9:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00'];

  return (
    <TeacherLayout
      title="Mark Attendance"
      subtitle="Record student attendance for your class sessions"
    >
      {toast && <TeacherToast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ padding: '0 28px', display: 'flex', gap: 20, alignItems: 'flex-start' }}>

        {/* ── Left: Form / List ──────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Step 1: Select session */}
          <TeacherCard style={{ padding: '20px 22px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 16, letterSpacing: '-0.02em' }}>
              {step === 1 ? '1. Select Class & Session' : `${classInfo?.name || ''} — ${date} · ${timeSlot}`}
            </div>

            {loading && step === 1 ? (
              <TeacherSpinner text="Loading your classes…" />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end' }}>
                {/* Class + Subject */}
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: T.text2, marginBottom: 6 }}>Class — Subject</div>
                  <select
                    value={selectedAssign}
                    onChange={e => { setSelectedAssign(e.target.value); setStep(1); }}
                    disabled={step > 1 && !loading}
                    style={{
                      width: '100%', padding: '9px 12px', borderRadius: 10,
                      border: `1px solid ${T.border}`, background: T.surfaceMuted,
                      color: T.text, fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
                      outline: 'none', cursor: 'pointer',
                    }}
                  >
                    <option value="">— Choose a class —</option>
                    {assignOptions.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: T.text2, marginBottom: 6 }}>Date</div>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    style={{
                      width: '100%', padding: '9px 12px', borderRadius: 10,
                      border: `1px solid ${T.border}`, background: T.surfaceMuted,
                      color: T.text, fontSize: 13, fontFamily: 'inherit', outline: 'none',
                    }}
                  />
                </div>

                {/* Time Slot */}
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: T.text2, marginBottom: 6 }}>Time Slot</div>
                  <select
                    value={timeSlot}
                    onChange={e => setTimeSlot(e.target.value)}
                    style={{
                      padding: '9px 12px', borderRadius: 10,
                      border: `1px solid ${T.border}`, background: T.surfaceMuted,
                      color: T.text, fontSize: 13, fontFamily: 'inherit', outline: 'none', cursor: 'pointer',
                    }}
                  >
                    {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            )}

            {!loading && step === 1 && (
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <TeacherPrimaryBtn
                  onClick={loadStudents}
                  disabled={!selectedAssign}
                  icon="class"
                >
                  Load Students
                </TeacherPrimaryBtn>
              </div>
            )}

            {step > 1 && (
              <button
                onClick={() => { setStep(1); setStudents([]); }}
                style={{
                  marginTop: 12, padding: '6px 12px', borderRadius: 8,
                  background: 'none', border: `1px solid ${T.border}`,
                  color: T.text3, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                ← Change selection
              </button>
            )}
          </TeacherCard>

          {error && (
            <div style={{ padding: '12px 16px', borderRadius: 12, background: T.amberSoft, border: `1px solid ${T.amber}33`, color: T.amber, fontSize: 13, fontWeight: 500, display: 'flex', gap: 8, alignItems: 'center' }}>
              <TeacherIcon name="alert" size={14} />
              {error}
            </div>
          )}

          {/* Step 2: Student list */}
          {step >= 2 && students.length > 0 && (
            <TeacherCard style={{ padding: '0', overflow: 'hidden' }}>
              {/* Toolbar */}
              <div style={{ padding: '14px 20px', borderBottom: `1px solid ${T.divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text, letterSpacing: '-0.02em' }}>
                  Students ({students.length})
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => markAll('present')} style={{ padding: '6px 12px', borderRadius: 8, background: T.greenSoft, border: `1px solid ${T.green}28`, color: T.green, fontSize: 11.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    All Present
                  </button>
                  <button onClick={() => markAll('absent')} style={{ padding: '6px 12px', borderRadius: 8, background: T.redSoft, border: `1px solid ${T.red}28`, color: T.red, fontSize: 11.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    All Absent
                  </button>
                </div>
              </div>

              {/* Student rows */}
              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {students.map((stu, i) => {
                  const status = statuses[stu._id] || 'absent';
                  const statusColor = status === 'present' ? T.green : status === 'late' ? T.amber : T.red;
                  return (
                    <div
                      key={stu._id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '11px 20px',
                        borderBottom: i < students.length - 1 ? `1px solid ${T.divider}` : 'none',
                        background: status === 'present' ? `${T.green}05` : status === 'late' ? `${T.amber}05` : `${T.red}05`,
                      }}
                    >
                      {/* Avatar */}
                      <div style={{
                        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                        background: `linear-gradient(135deg, ${statusColor}30, ${statusColor}15)`,
                        color: statusColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11.5, fontWeight: 700,
                        border: `1px solid ${statusColor}25`,
                      }}>
                        {stu.firstName?.[0]}{stu.lastName?.[0]}
                      </div>

                      {/* Name + roll */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: T.text, letterSpacing: '-0.02em' }}>
                          {stu.firstName} {stu.lastName}
                        </div>
                        {stu.enrollmentNumber && (
                          <div style={{ fontSize: 11, color: T.text3, fontWeight: 500, marginTop: 1 }}>
                            {stu.enrollmentNumber}
                          </div>
                        )}
                      </div>

                      {/* Toggle */}
                      <StatusToggle
                        status={status}
                        onChange={s => setStatuses(prev => ({ ...prev, [stu._id]: s }))}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Summary + submit */}
              <div style={{
                padding: '16px 20px', borderTop: `1px solid ${T.divider}`,
                display: 'flex', alignItems: 'center', gap: 14,
                background: T.surfaceMuted,
              }}>
                <div style={{ display: 'flex', gap: 10, flex: 1 }}>
                  <StatBadge value={presentCount} label="Present" color={T.green} />
                  <StatBadge value={absentCount}  label="Absent"  color={T.red}   />
                  {lateCount > 0 && <StatBadge value={lateCount} label="Late" color={T.amber} />}
                  <StatBadge
                    value={`${students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0}%`}
                    label="Attendance"
                    color={T.accent}
                  />
                </div>

                <TeacherPrimaryBtn onClick={handleSubmit} disabled={saving} icon="check">
                  {saving ? 'Saving…' : 'Save Attendance'}
                </TeacherPrimaryBtn>
              </div>
            </TeacherCard>
          )}

          {step >= 2 && students.length === 0 && !loading && (
            <TeacherCard>
              <TeacherEmptyState
                icon="class"
                message="No students found for this class"
                subtext="Students are matched by program code, semester, and section. Make sure students are registered with matching details."
              />
            </TeacherCard>
          )}

          {/* Step 3: Done state */}
          {step === 3 && (
            <TeacherCard style={{ padding: '28px 24px', textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: T.greenSoft, color: T.green, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <TeacherIcon name="check" size={24} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 6 }}>Attendance Saved!</div>
              <div style={{ fontSize: 13, color: T.text3, marginBottom: 20 }}>
                {presentCount} present · {absentCount} absent · {lateCount} late out of {students.length} students
              </div>
              <button
                onClick={() => { setStep(1); setStudents([]); setSelectedAssign(''); setStatuses({}); }}
                style={{
                  padding: '10px 20px', borderRadius: 10,
                  background: T.accentSoft, border: `1px solid ${T.accentBorder}`,
                  color: T.accent, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Mark Another Session
              </button>
            </TeacherCard>
          )}
        </div>

        {/* ── Right: Recent Sessions ─────────────────────── */}
        <div style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <TeacherCard style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 14 }}>Recent Sessions</div>
            {sessions.length === 0 ? (
              <TeacherEmptyState icon="calendar" message="No sessions yet" subtext="Your previous attendance sessions will appear here." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sessions.map((s, i) => (
                  <div key={i} style={{
                    padding: '10px 12px', borderRadius: 12,
                    background: T.surfaceMuted, border: `1px solid ${T.border}`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>
                        {new Date(s.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                        <span style={{ color: T.text3, fontWeight: 500, marginLeft: 5 }}>{s.timeSlot}</span>
                      </div>
                      <div style={{
                        fontSize: 11, fontWeight: 700,
                        color: s.attendancePct >= 75 ? T.green : T.amber,
                      }}>
                        {s.attendancePct}%
                      </div>
                    </div>
                    <div style={{ fontSize: 11.5, color: T.text3, fontWeight: 500 }}>
                      {s.subject?.name || '—'} · {s.present}/{s.total} present
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TeacherCard>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default TeacherMarkAttendance;
