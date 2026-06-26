import { theme } from '@/theme';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Sidebar, { ActionButton, useHistoryNav, useSidebarState } from '@/layouts/Sidebar';
import classSubjectService from '@/services/classSubjectService';
import progressService from '@/services/progressService';
import { TEACHER_NAV } from '@/layouts/TeacherLayout';
import I from '@/components/Icon';

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════════════════════════ */
const T = theme;

const TOPBAR_H = 64;

const GLOBAL = `
@keyframes ls-fade-up {
  from { opacity:0; transform:translateY(8px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes ls-toast-in {
  from { opacity:0; transform:translateY(-10px) scale(0.96); }
  to   { opacity:1; transform:translateY(0) scale(1); }
}
.ls-page *::-webkit-scrollbar { width:6px; height:6px; }
.ls-page *::-webkit-scrollbar-track { background:transparent; }
.ls-page *::-webkit-scrollbar-thumb { background:rgba(15,23,42,0.10); border-radius:3px; }
.ls-page *::-webkit-scrollbar-thumb:hover { background:rgba(15,23,42,0.18); }
.ls-page input:focus, .ls-page select:focus, .ls-page textarea:focus {
  outline: 2px solid rgba(124,58,237,0.35) !important;
  outline-offset: 0 !important;
  border-color: rgba(124,58,237,0.55) !important;
}
.ls-page input[type="range"] {
  -webkit-appearance: none;
  height: 6px;
  border-radius: 99px;
  background: rgba(124,58,237,0.15);
  outline: none;
  cursor: pointer;
  width: 100%;
}
.ls-page input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #7c3aed;
  box-shadow: 0 2px 8px rgba(124,58,237,0.40);
  cursor: pointer;
}
`;

/* ICONS — shared component via @/components/Icon */

/* Teacher NAV — imported from TeacherLayout (single source of truth) */
const NAV = TEACHER_NAV;

/* TOP BAR */
const TopBar = ({ collapsed, onToggleSidebar }) => {
  const { canBack, canForward, goBack, goForward } = useHistoryNav();
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50,
      height: TOPBAR_H,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 22px',
      background: 'rgba(238,240,245,0.72)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderBottom: '1px solid rgba(15,23,42,0.04)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 3,
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: 14, padding: '7px 9px',
        boxShadow: '0 4px 14px rgba(15,23,42,0.08), 0 1px 0 rgba(255,255,255,0.7) inset',
      }}>
        <ActionButton icon="sidebar"  label={collapsed ? 'Expand' : 'Collapse'} onClick={onToggleSidebar} />
        <ActionButton icon="back"     label="Back"    onClick={goBack}    disabled={!canBack} />
        <ActionButton icon="forward"  label="Forward" onClick={goForward} disabled={!canForward} />
      </div>
      <button style={{
        width: 44, height: 44, borderRadius: 14,
        background: T.surface, border: `1px solid ${T.border}`,
        boxShadow: '0 4px 14px rgba(15,23,42,0.08), 0 1px 0 rgba(255,255,255,0.7) inset',
        cursor: 'pointer', color: T.text2, position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'transform 200ms ease', fontFamily: 'inherit',
      }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <I name="bell" size={20} />
        <span style={{ position: 'absolute', top: 10, right: 11, width: 8, height: 8, borderRadius: '50%', background: T.red, border: `2px solid ${T.surface}` }} />
      </button>
    </div>
  );
};

/* TOAST */
const Toast = ({ message, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  const isErr = type === 'error';
  return (
    <div style={{
      position: 'fixed', top: 20, right: 24, zIndex: 200,
      display: 'flex', alignItems: 'center', gap: 10,
      background: T.surface, border: `1px solid ${isErr ? T.red + '33' : T.green + '33'}`,
      borderRadius: 14, padding: '12px 16px',
      boxShadow: '0 8px 30px rgba(15,23,42,0.14)',
      animation: 'ls-toast-in 360ms cubic-bezier(0.16,1,0.3,1)',
      maxWidth: 380, fontFamily: T.font,
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 9, flexShrink: 0,
        background: isErr ? T.redSoft : T.greenSoft,
        color: isErr ? T.red : T.green,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <I name={isErr ? 'alert' : 'check'} size={15} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: T.text, flex: 1, letterSpacing: '-0.01em' }}>
        {message}
      </span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.text3, display: 'flex', fontFamily: 'inherit', padding: 2 }}>
        <I name="close" size={13} />
      </button>
    </div>
  );
};

/* ─── SHARED FORM PRIMITIVES ─── */
const Field = ({ label, required, hint, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: T.text2, letterSpacing: '-0.005em' }}>
      {label}{required && <span style={{ color: T.red, marginLeft: 3 }}>*</span>}
    </label>
    {children}
    {hint && <span style={{ fontSize: 11, color: T.text3, fontWeight: 500 }}>{hint}</span>}
  </div>
);

const Input = ({ style, ...props }) => (
  <input {...props} style={{
    width: '100%', boxSizing: 'border-box',
    padding: '9px 12px', borderRadius: 10,
    border: `1px solid ${T.border}`,
    background: T.surfaceMuted, color: T.text,
    fontSize: 13, fontWeight: 500, fontFamily: T.font,
    letterSpacing: '-0.005em', outline: 'none',
    transition: `border-color 200ms ${T.ease}`,
    ...style,
  }} />
);

const NativeSelect = ({ children, style, ...props }) => (
  <select {...props} style={{
    width: '100%', boxSizing: 'border-box',
    padding: '9px 36px 9px 12px', borderRadius: 10,
    border: `1px solid ${T.border}`,
    background: T.surfaceMuted, color: T.text,
    fontSize: 13, fontWeight: 500, fontFamily: T.font,
    letterSpacing: '-0.005em', outline: 'none',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
    cursor: 'pointer',
    transition: `border-color 200ms ${T.ease}`,
    ...style,
  }}>
    {children}
  </select>
);

/* SLIDER ROW */
const SliderField = ({ label, name, value, onChange, min = 1, max = 5, lowLabel, highLabel }) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: T.text2, letterSpacing: '-0.005em' }}>{label}</label>
        <span style={{
          padding: '3px 10px', borderRadius: 99,
          background: T.accentSoft, color: T.accent,
          fontSize: 12, fontWeight: 700, border: `1px solid ${T.accentBorder}`,
        }}>{value} / {max}</span>
      </div>
      <input
        type="range" name={name} value={value} min={min} max={max}
        onChange={onChange}
        style={{ accentColor: T.accent }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: T.text4, fontWeight: 500, marginTop: 4 }}>
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const LogSession = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { collapsed, toggleCollapsed } = useSidebarState();

  const [classes, setClasses]   = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [toast, setToast]       = useState(null);

  const [form, setForm] = useState({
    classId: '', subjectId: '',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '', hoursSpent: 1,
    sessionType: 'theory',
    topicsCovered: '',
    totalStudents: '', presentStudents: '',
    teacherNotes: '',
    difficulty: 3, studentEngagement: 3,
  });

  const handleLogout  = () => { logout(); navigate('/login'); };
  const renderIcon    = (name, size) => <I name={name} size={size} />;

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const onChange = e => {
    const { name, value, type } = e.target;
    setForm(p => ({ ...p, [name]: type === 'number' ? parseFloat(value) : value }));
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await classSubjectService.getTeacherByName(user.firstName, user.lastName);
        const map = new Map();
        data.forEach(a => { if (a.class) map.set(a.class._id, a.class); });
        setClasses(Array.from(map.values()));
      } catch (e) {
        setToast({ type: 'error', text: 'Failed to load classes' });
      }
    })();
  }, []);

  const handleClassChange = async (classId) => {
    set('classId', classId); set('subjectId', ''); setSubjects([]);
    if (!classId) return;
    try {
      const data = await classSubjectService.getByClass(classId);
      const teacherName = `${user.firstName} ${user.lastName}`;
      setSubjects(data.filter(a => a.teacher?.name === teacherName));
    } catch { setToast({ type: 'error', text: 'Failed to load subjects' }); }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.classId || !form.subjectId || !form.date || !form.timeSlot) {
      setToast({ type: 'error', text: 'Please fill all required fields' }); return;
    }
    if (!form.totalStudents || !form.presentStudents) {
      setToast({ type: 'error', text: 'Please enter attendance data' }); return;
    }
    setLoading(true);
    try {
      const topics = form.topicsCovered.split(',').map(t => t.trim()).filter(Boolean);
      const data = await progressService.logSession({
        classId: form.classId, subjectId: form.subjectId, teacherId: user._id,
        date: form.date, timeSlot: form.timeSlot,
        hoursSpent: parseFloat(form.hoursSpent),
        sessionType: form.sessionType,
        topicsCovered: topics,
        totalStudents: parseInt(form.totalStudents),
        presentStudents: parseInt(form.presentStudents),
        teacherNotes: form.teacherNotes,
        difficulty: parseInt(form.difficulty),
        studentEngagement: parseInt(form.studentEngagement),
      });
      setToast({ type: 'success', text: data.message || 'Session logged successfully!' });
      setForm(p => ({
        ...p,
        date: new Date().toISOString().split('T')[0],
        timeSlot: '', hoursSpent: 1, topicsCovered: '', teacherNotes: '',
        difficulty: 3, studentEngagement: 3,
      }));
    } catch (err) {
      setToast({ type: 'error', text: err.response?.data?.message || 'Failed to log session' });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '9px 12px', borderRadius: 10,
    border: `1px solid ${T.border}`,
    background: T.surfaceMuted, color: T.text,
    fontSize: 13, fontWeight: 500, fontFamily: T.font,
    letterSpacing: '-0.005em', outline: 'none',
  };

  return (
    <div className="ls-page chronos" style={{
      position: 'relative', display: 'flex',
      height: '100vh', overflow: 'hidden',
      background: T.bg, color: T.text,
      fontFamily: T.font,
      fontFeatureSettings: '"tnum" 1,"ss01" 1,"ss02" 1,"calt" 1',
      textRendering: 'optimizeLegibility',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      letterSpacing: '-0.005em',
    }}>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL }} />

      {/* TOAST */}
      {toast && <Toast message={toast.text} type={toast.type} onClose={() => setToast(null)} />}

      {/* SIDEBAR */}
      <div style={{ marginTop: TOPBAR_H, height: `calc(100vh - ${TOPBAR_H}px)`, flexShrink: 0 }}>
        <Sidebar
          user={user}
          onLogout={handleLogout}
          onNavigate={navigate}
          currentPath="/log-session"
          navConfig={NAV}
          iconRenderer={renderIcon}
          collapsed={collapsed}
          onToggleCollapse={toggleCollapsed}
        />
      </div>

      {/* MAIN */}
      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', overflowX: 'hidden', background: T.bg, position: 'relative' }}>
        <div style={{ height: TOPBAR_H }} />
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 24px 40px' }}>

          {/* PAGE HEADER */}
          <div style={{
            marginBottom: 24,
            animation: 'ls-fade-up 500ms cubic-bezier(0.16,1,0.3,1) both',
          }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: T.text, margin: 0, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
              Log Class Session
            </h1>
            <div style={{ fontSize: 13, color: T.text3, marginTop: 5, fontWeight: 500 }}>
              Record your conducted class sessions and attendance
            </div>
          </div>

          {/* NO CLASSES WARNING */}
          {classes.length === 0 && (
            <div style={{
              background: T.amberSoft, border: `1px solid ${T.amber}30`,
              borderRadius: 16, padding: '16px 20px',
              display: 'flex', gap: 14, alignItems: 'flex-start',
              marginBottom: 20,
              animation: 'ls-fade-up 400ms ease both',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: `${T.amber}20`, color: T.amber,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <I name="alert" size={18} />
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: T.text, marginBottom: 6, letterSpacing: '-0.02em' }}>
                  No Classes Assigned
                </div>
                <div style={{ fontSize: 12.5, color: T.text3, fontWeight: 500, lineHeight: 1.6 }}>
                  Ask your admin to assign subjects to you via the "Assign Subjects" page. Once assigned, refresh this page.
                </div>
              </div>
            </div>
          )}

          {/* FORM CARD */}
          <form onSubmit={handleSubmit}>
            <div style={{
              background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 20, boxShadow: T.shadowCard,
              overflow: 'hidden',
              animation: 'ls-fade-up 400ms cubic-bezier(0.16,1,0.3,1) 60ms both',
            }}>
              {/* Card header */}
              <div style={{
                padding: '18px 24px',
                background: `linear-gradient(135deg, ${T.accentSoft}, ${T.blueSoft})`,
                borderBottom: `1px solid ${T.border}`,
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: T.accent, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(124,58,237,0.30)', flexShrink: 0,
                }}>
                  <I name="log" size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.text, letterSpacing: '-0.03em' }}>
                    Session Details
                  </div>
                  <div style={{ fontSize: 12, color: T.text3, marginTop: 3, fontWeight: 500 }}>
                    Fill in the details of the class session you conducted
                  </div>
                </div>
              </div>

              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 22 }}>

                {/* ─ Section: Class & Subject ─ */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.text4, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>
                    Class & Subject
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <Field label="Class" required>
                      <NativeSelect
                        name="classId"
                        value={form.classId}
                        onChange={e => handleClassChange(e.target.value)}
                        required
                      >
                        <option value="">Select Class</option>
                        {classes.map(c => (
                          <option key={c._id} value={c._id}>
                            {c.name} – {c.code} (Sem {c.semester}, Sec {c.section})
                          </option>
                        ))}
                      </NativeSelect>
                    </Field>

                    <Field label="Subject" required>
                      <NativeSelect
                        name="subjectId"
                        value={form.subjectId}
                        onChange={onChange}
                        disabled={!form.classId}
                        required
                      >
                        <option value="">Select Subject</option>
                        {subjects.map(a => (
                          <option key={a.subject._id} value={a.subject._id}>
                            {a.subject.name} ({a.subject.code})
                          </option>
                        ))}
                      </NativeSelect>
                    </Field>
                  </div>
                </div>

                {/* ─ Divider ─ */}
                <div style={{ height: 1, background: T.divider }} />

                {/* ─ Section: When & Duration ─ */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.text4, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>
                    When & Duration
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                    <Field label="Date" required>
                      <Input type="date" name="date" value={form.date} onChange={onChange} required />
                    </Field>

                    <Field label="Time Slot" required>
                      <NativeSelect name="timeSlot" value={form.timeSlot} onChange={onChange} required>
                        <option value="">Select Time</option>
                        {['09:00-10:00','10:00-11:00','11:00-12:00','12:00-13:00','13:00-14:00','14:00-15:00','15:00-16:00','16:00-17:00'].map(t => (
                          <option key={t} value={t}>{t.replace('-', ' – ')}</option>
                        ))}
                      </NativeSelect>
                    </Field>

                    <Field label="Hours Spent" required>
                      <Input type="number" name="hoursSpent" value={form.hoursSpent} onChange={onChange} min="0.5" max="4" step="0.5" required />
                    </Field>
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <Field label="Session Type" required>
                      <NativeSelect name="sessionType" value={form.sessionType} onChange={onChange} required>
                        <option value="theory">Theory</option>
                        <option value="lab">Lab</option>
                        <option value="revision">Revision</option>
                        <option value="assessment">Assessment</option>
                      </NativeSelect>
                    </Field>
                  </div>
                </div>

                {/* ─ Divider ─ */}
                <div style={{ height: 1, background: T.divider }} />

                {/* ─ Section: Content ─ */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.text4, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>
                    Content Covered
                  </div>
                  <Field label="Topics Covered" required hint="Enter topics separated by commas">
                    <Input
                      type="text" name="topicsCovered" value={form.topicsCovered}
                      onChange={onChange}
                      placeholder="e.g., Arrays, Linked Lists, Stack Implementation"
                      required
                    />
                  </Field>
                </div>

                {/* ─ Divider ─ */}
                <div style={{ height: 1, background: T.divider }} />

                {/* ─ Section: Attendance ─ */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.text4, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>
                    Attendance
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <Field label="Total Students" required>
                      <Input type="number" name="totalStudents" value={form.totalStudents} onChange={onChange} min="1" required />
                    </Field>
                    <Field label="Present Students" required>
                      <Input type="number" name="presentStudents" value={form.presentStudents} onChange={onChange} min="0" max={form.totalStudents || 100} required />
                    </Field>
                  </div>
                  {/* Attendance rate indicator */}
                  {form.totalStudents && form.presentStudents && (
                    <div style={{
                      marginTop: 10, padding: '10px 14px', borderRadius: 10,
                      background: T.surfaceMuted, border: `1px solid ${T.border}`,
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                      <div style={{
                        fontSize: 18, fontWeight: 700, color: T.accent,
                        letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums',
                      }}>
                        {Math.round((parseInt(form.presentStudents) / parseInt(form.totalStudents)) * 100)}%
                      </div>
                      <div style={{ fontSize: 12, color: T.text3, fontWeight: 500 }}>attendance rate</div>
                    </div>
                  )}
                </div>

                {/* ─ Divider ─ */}
                <div style={{ height: 1, background: T.divider }} />

                {/* ─ Section: Session Quality ─ */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.text4, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>
                    Session Quality
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
                    <SliderField
                      label="Topic Difficulty"
                      name="difficulty"
                      value={form.difficulty}
                      onChange={onChange}
                      lowLabel="Easy" highLabel="Hard"
                    />
                    <SliderField
                      label="Student Engagement"
                      name="studentEngagement"
                      value={form.studentEngagement}
                      onChange={onChange}
                      lowLabel="Low" highLabel="High"
                    />
                  </div>
                </div>

                {/* ─ Divider ─ */}
                <div style={{ height: 1, background: T.divider }} />

                {/* ─ Section: Notes ─ */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.text4, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>
                    Notes
                  </div>
                  <Field label="Teacher Notes">
                    <textarea
                      name="teacherNotes"
                      value={form.teacherNotes}
                      onChange={onChange}
                      rows={4}
                      placeholder="Additional notes about the session, student participation, difficulties faced…"
                      style={{
                        ...inputStyle,
                        resize: 'vertical', minHeight: 90,
                      }}
                    />
                  </Field>
                </div>

                {/* ─ Actions ─ */}
                <div style={{
                  display: 'flex', gap: 10, justifyContent: 'flex-end',
                  paddingTop: 6, borderTop: `1px solid ${T.divider}`,
                }}>
                  <button
                    type="button"
                    onClick={() => navigate('/teacher-dashboard')}
                    style={{
                      padding: '10px 20px', borderRadius: 10,
                      background: 'transparent', border: `1px solid ${T.border}`,
                      color: T.text2, fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', fontFamily: T.font, letterSpacing: '-0.01em',
                      transition: `all 200ms ${T.ease}`,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = T.surfaceMuted; e.currentTarget.style.borderColor = T.borderHi; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = T.border; }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: '10px 22px', borderRadius: 10,
                      background: loading
                        ? T.surfaceMuted
                        : `linear-gradient(135deg,${T.accent2} 0%,${T.accent} 60%,#6d28d9 100%)`,
                      border: 'none',
                      color: loading ? T.text3 : '#fff',
                      fontSize: 13.5, fontWeight: 700,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontFamily: T.font, letterSpacing: '-0.015em',
                      boxShadow: loading ? 'none' : '0 4px 12px -2px rgba(124,58,237,0.35)',
                      transition: 'all 200ms ease',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}
                  >
                    <I name="check" size={14} />
                    {loading ? 'Logging…' : 'Log Session'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <TopBar collapsed={collapsed} onToggleSidebar={toggleCollapsed} />
    </div>
  );
};

export default LogSession;
