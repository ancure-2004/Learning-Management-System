import { theme } from '@/theme';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar, { ActionButton, useHistoryNav, useSidebarState } from '@/layouts/Sidebar';
import StarRating from '@/pages/student/components/StarRating';
import ratingService from '@/services/ratingService';
import { STUDENT_NAV } from '@/layouts/StudentLayout';
import I from '@/components/Icon';

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════════════════════════ */
const T = theme;

const TOPBAR_H = 64;

const GLOBAL = `
@keyframes rt-fade-up {
  from { opacity:0; transform:translateY(8px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes rt-toast-in {
  from { opacity:0; transform:translateY(-10px) scale(0.96); }
  to   { opacity:1; transform:translateY(0) scale(1); }
}
.rt-page *::-webkit-scrollbar { width:6px; height:6px; }
.rt-page *::-webkit-scrollbar-track { background:transparent; }
.rt-page *::-webkit-scrollbar-thumb { background:rgba(15,23,42,0.10); border-radius:3px; }
.rt-page *::-webkit-scrollbar-thumb:hover { background:rgba(15,23,42,0.18); }
.rt-page input:focus, .rt-page select:focus, .rt-page textarea:focus {
  outline: 2px solid rgba(124,58,237,0.35) !important;
  outline-offset: 0 !important;
  border-color: rgba(124,58,237,0.55) !important;
}
`;

/* ═══════════════════════════════════════════════════════════════
   ICONS — shared component via @/components/Icon
   ═══════════════════════════════════════════════════════════════ */

/* STUDENT NAV — imported from StudentLayout to keep sidebar consistent */
const NAV = STUDENT_NAV;

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
  useEffect(() => { const t = setTimeout(onClose, 3800); return () => clearTimeout(t); }, [onClose]);
  const isErr = type === 'error';
  return (
    <div style={{
      position: 'fixed', top: 20, right: 24, zIndex: 200,
      display: 'flex', alignItems: 'center', gap: 10,
      background: T.surface, border: `1px solid ${isErr ? T.red + '33' : T.green + '33'}`,
      borderRadius: 14, padding: '12px 16px',
      boxShadow: '0 8px 30px rgba(15,23,42,0.14)',
      animation: 'rt-toast-in 360ms cubic-bezier(0.16,1,0.3,1)',
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
      <button onClick={onClose} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: T.text3, display: 'flex', fontFamily: 'inherit', padding: 2,
      }}>
        <I name="close" size={13} />
      </button>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   CATEGORY ROW
   ═══════════════════════════════════════════════════════════════ */
const CategoryRow = ({ label, value, onChange }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: `1px solid ${T.divider}`,
  }}>
    <span style={{ fontSize: 13, fontWeight: 500, color: T.text2, letterSpacing: '-0.01em' }}>
      {label}
    </span>
    <StarRating value={value} onChange={onChange} />
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════════════════════ */
function StudentRateTeacher() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { collapsed, toggleCollapsed } = useSidebarState();

  const [teachers, setTeachers]           = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [loading, setLoading]             = useState(true);
  const [submitting, setSubmitting]       = useState(false);
  const [toast, setToast]                 = useState(null);

  const [overallRating, setOverallRating] = useState(0);
  const [categories, setCategories]       = useState({
    clarity: 0, punctuality: 0, engagement: 0, knowledge: 0, accessibility: 0,
  });
  const [feedback, setFeedback]           = useState('');
  const [isAnonymous, setIsAnonymous]     = useState(true);

  const currentYear     = new Date().getFullYear().toString();
  const currentSemester = user?.semester || 1;

  const handleLogout = () => { logout(); navigate('/login'); };
  const renderIcon   = (name, size) => <I name={name} size={size} />;

  useEffect(() => {
    (async () => {
      try {
        const data = await ratingService.getMyTeachers(user._id, {
          academicYear: currentYear,
          semester: currentSemester,
        });
        setTeachers(data.teachers || []);
      } catch (e) {
        setToast({ type: 'error', text: e.response?.data?.message || 'Failed to load teachers' });
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleSelect = (td) => {
    setSelectedTeacher(td);
    if (td.hasRated && td.currentRating) {
      setOverallRating(td.currentRating);
    } else {
      setOverallRating(0);
      setCategories({ clarity: 0, punctuality: 0, engagement: 0, knowledge: 0, accessibility: 0 });
      setFeedback('');
      setIsAnonymous(true);
    }
  };

  const handleSubmit = async () => {
    if (overallRating === 0) {
      setToast({ type: 'error', text: 'Please provide an overall rating' });
      return;
    }
    const hasCat = Object.values(categories).some(v => v > 0);
    if (!hasCat && !feedback.trim()) {
      setToast({ type: 'error', text: 'Please provide a category rating or written feedback' });
      return;
    }

    try {
      setSubmitting(true);
      const data = await ratingService.submit({
        studentId: user._id,
        teacherId: selectedTeacher.teacher._id,
        subjectId: selectedTeacher.subject._id,
        classId:   selectedTeacher.class._id,
        overallRating,
        categories: Object.fromEntries(Object.entries(categories).filter(([, v]) => v > 0)),
        feedback: feedback.trim(),
        isAnonymous,
        academicYear: currentYear,
        semester: currentSemester,
      });
      setToast({ type: 'success', text: data.message || 'Rating submitted successfully!' });
      // Refresh & clear
      const refreshed = await ratingService.getMyTeachers(user._id, {
        academicYear: currentYear,
        semester: currentSemester,
      });
      setTeachers(refreshed.teachers || []);
      setTimeout(() => {
        setSelectedTeacher(null);
        setOverallRating(0);
        setCategories({ clarity: 0, punctuality: 0, engagement: 0, knowledge: 0, accessibility: 0 });
        setFeedback('');
      }, 1800);
    } catch (e) {
      setToast({ type: 'error', text: e.response?.data?.message || 'Failed to submit rating' });
    } finally {
      setSubmitting(false);
    }
  };

  const CATEGORY_LABELS = {
    clarity:       'Clarity of Explanation',
    punctuality:   'Punctuality',
    engagement:    'Student Engagement',
    knowledge:     'Subject Knowledge',
    accessibility: 'Accessibility Outside Class',
  };

  const RATING_LABEL = {
    5: 'Excellent',
    4: 'Very Good',
    3: 'Good',
    2: 'Needs Improvement',
    1: 'Poor',
  };

  return (
    <div className="rt-page chronos" style={{
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
          currentPath="/rate-teachers"
          navConfig={NAV}
          iconRenderer={renderIcon}
          collapsed={collapsed}
          onToggleCollapse={toggleCollapsed}
        />
      </div>

      {/* MAIN */}
      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', overflowX: 'hidden', background: T.bg, position: 'relative' }}>
        <div style={{ height: TOPBAR_H }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 24px 40px' }}>

          {/* PAGE HEADER */}
          <div style={{
            marginBottom: 24, animation: 'rt-fade-up 500ms cubic-bezier(0.16,1,0.3,1) both',
          }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: T.text, margin: 0, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
              Rate Teachers
            </h1>
            <div style={{ fontSize: 13, color: T.text3, marginTop: 5, fontWeight: 500 }}>
              Share your feedback to help improve teaching quality
            </div>
          </div>

          {/* LOADING */}
          {loading && (
            <div style={{
              background: T.surface, borderRadius: 20, padding: '50px 24px',
              textAlign: 'center', boxShadow: T.shadowCard,
            }}>
              <div style={{ fontSize: 13, color: T.text3, fontWeight: 500 }}>Loading teachers…</div>
            </div>
          )}

          {!loading && (
            <div style={{ display: 'grid', gridTemplateColumns: teachers.length === 0 ? '1fr' : '1fr 1.3fr', gap: 20, alignItems: 'start' }}>

              {/* LEFT — teacher list */}
              {teachers.length === 0 ? (
                <div style={{
                  background: T.surface, border: `1px solid ${T.border}`,
                  borderRadius: 20, padding: '50px 24px',
                  textAlign: 'center', boxShadow: T.shadowCard,
                }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14, margin: '0 auto 14px',
                    background: T.accentSoft, color: T.accent,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <I name="teacher" size={24} />
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 6, letterSpacing: '-0.03em' }}>
                    No Teachers Found
                  </div>
                  <div style={{ fontSize: 13, color: T.text3, fontWeight: 500 }}>
                    No teachers assigned to your class yet. Contact your administrator.
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                    Select a Teacher
                  </div>
                  {teachers.map((td) => {
                    const key = `${td.teacher._id}-${td.subject._id}`;
                    const isActive = selectedTeacher?.teacher._id === td.teacher._id &&
                                     selectedTeacher?.subject._id === td.subject._id;
                    return (
                      <button
                        key={key}
                        onClick={() => handleSelect(td)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 14,
                          padding: '14px 16px',
                          background: isActive ? T.accentSoft : T.surface,
                          border: `1.5px solid ${isActive ? T.accentBorder : T.border}`,
                          borderRadius: 16,
                          boxShadow: isActive ? `0 0 0 3px ${T.accentSoft}` : T.shadowCard,
                          cursor: 'pointer', textAlign: 'left',
                          fontFamily: T.font,
                          transition: 'all 200ms ease',
                        }}
                        onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = T.accentBorder; e.currentTarget.style.background = T.surfaceMuted; }}}
                        onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.surface; }}}
                      >
                        {/* Avatar */}
                        <div style={{
                          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                          background: isActive
                            ? `linear-gradient(135deg, ${T.accent2}, ${T.accent})`
                            : `linear-gradient(135deg, ${T.surfaceMuted}, ${T.border}20)`,
                          color: isActive ? '#fff' : T.text3,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 15, fontWeight: 700,
                          boxShadow: isActive ? '0 4px 12px rgba(124,58,237,0.30)' : 'none',
                        }}>
                          {td.teacher.name?.[0]?.toUpperCase() || 'T'}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: 13.5, fontWeight: 700, color: isActive ? T.accent : T.text,
                            letterSpacing: '-0.025em',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>
                            {td.teacher.name}
                          </div>
                          <div style={{ fontSize: 11.5, color: T.text3, marginTop: 2, fontWeight: 500 }}>
                            {td.subject.name} · {td.subject.code}
                          </div>
                        </div>

                        {/* Already rated badge */}
                        {td.hasRated && (
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '4px 9px', borderRadius: 99,
                            background: T.greenSoft, color: T.green,
                            fontSize: 10.5, fontWeight: 700, flexShrink: 0,
                            border: `1px solid ${T.green}28`,
                          }}>
                            <I name="check" size={11} /> Rated
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* RIGHT — rating form */}
              {selectedTeacher && (
                <div style={{
                  background: T.surface, border: `1px solid ${T.border}`,
                  borderRadius: 20, boxShadow: T.shadowCard,
                  animation: 'rt-fade-up 350ms cubic-bezier(0.16,1,0.3,1) both',
                  overflow: 'hidden',
                }}>
                  {/* Form header */}
                  <div style={{
                    padding: '18px 22px',
                    background: `linear-gradient(135deg, ${T.accentSoft}, ${T.blueSoft})`,
                    borderBottom: `1px solid ${T.border}`,
                    display: 'flex', alignItems: 'center', gap: 14,
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: `linear-gradient(135deg, ${T.accent2}, ${T.accent})`,
                      color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, fontWeight: 700,
                      boxShadow: '0 4px 12px rgba(124,58,237,0.30)',
                    }}>
                      {selectedTeacher.teacher.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: T.text, letterSpacing: '-0.03em' }}>
                        Rating {selectedTeacher.teacher.name}
                      </div>
                      <div style={{ fontSize: 12, color: T.text3, marginTop: 3, fontWeight: 500 }}>
                        {selectedTeacher.subject.name} ({selectedTeacher.subject.code})
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 22 }}>

                    {/* Overall rating */}
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: T.text2, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                        Overall Rating <span style={{ color: T.red }}>*</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <StarRating value={overallRating} onChange={setOverallRating} size="large" />
                        {overallRating > 0 && (
                          <span style={{
                            padding: '5px 12px', borderRadius: 99,
                            background: T.accentSoft, color: T.accent,
                            fontSize: 12, fontWeight: 700,
                            border: `1px solid ${T.accentBorder}`,
                          }}>
                            {RATING_LABEL[overallRating]}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Category ratings */}
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: T.text2, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                        Detailed Ratings <span style={{ color: T.text4, fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}> (optional)</span>
                      </div>
                      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <CategoryRow
                          key={key}
                          label={label}
                          value={categories[key]}
                          onChange={v => setCategories(prev => ({ ...prev, [key]: v }))}
                        />
                      ))}
                    </div>

                    {/* Feedback */}
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: T.text2, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                        Written Feedback <span style={{ color: T.text4, fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}> (optional)</span>
                      </div>
                      <textarea
                        value={feedback}
                        onChange={e => setFeedback(e.target.value)}
                        maxLength={500}
                        rows={4}
                        placeholder="Describe the teacher's strengths, areas for improvement, teaching style…"
                        style={{
                          width: '100%', boxSizing: 'border-box',
                          padding: '10px 12px', borderRadius: 10,
                          border: `1px solid ${T.border}`,
                          background: T.surfaceMuted, color: T.text,
                          fontSize: 13, fontWeight: 500, fontFamily: T.font,
                          letterSpacing: '-0.005em', resize: 'vertical',
                          outline: 'none',
                          transition: `border-color 200ms ${T.ease}`,
                        }}
                      />
                      <div style={{ textAlign: 'right', fontSize: 11, color: T.text4, marginTop: 4, fontWeight: 500 }}>
                        {feedback.length} / 500
                      </div>
                    </div>

                    {/* Anonymous toggle */}
                    <div style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      padding: '12px 14px', borderRadius: 12,
                      background: T.surfaceMuted, border: `1px solid ${T.border}`,
                      cursor: 'pointer',
                    }}
                      onClick={() => setIsAnonymous(p => !p)}
                    >
                      <div style={{
                        width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
                        border: `1.5px solid ${isAnonymous ? T.accent : T.borderHi}`,
                        background: isAnonymous ? T.accent : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 180ms ease',
                      }}>
                        {isAnonymous && <I name="check" size={11} />}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.text, letterSpacing: '-0.01em' }}>
                          Submit anonymously
                          <span style={{
                            marginLeft: 8, fontSize: 10.5, fontWeight: 700,
                            padding: '2px 7px', borderRadius: 99,
                            background: T.accentSoft, color: T.accent,
                            border: `1px solid ${T.accentBorder}`,
                          }}>Recommended</span>
                        </div>
                        <div style={{ fontSize: 11.5, color: T.text3, marginTop: 3, fontWeight: 500 }}>
                          Your name won't be visible to the teacher or other students
                        </div>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        onClick={handleSubmit}
                        disabled={submitting || overallRating === 0}
                        style={{
                          flex: 1, padding: '11px 20px', borderRadius: 10,
                          background: (submitting || overallRating === 0)
                            ? T.surfaceMuted
                            : `linear-gradient(135deg,${T.accent2} 0%,${T.accent} 60%,#6d28d9 100%)`,
                          border: 'none',
                          color: (submitting || overallRating === 0) ? T.text3 : '#fff',
                          fontSize: 13.5, fontWeight: 700, cursor: (submitting || overallRating === 0) ? 'not-allowed' : 'pointer',
                          fontFamily: T.font, letterSpacing: '-0.015em',
                          boxShadow: (submitting || overallRating === 0) ? 'none' : '0 4px 12px -2px rgba(124,58,237,0.35)',
                          transition: 'all 200ms ease',
                        }}
                      >
                        {submitting ? 'Submitting…' : selectedTeacher.hasRated ? 'Update Rating' : 'Submit Rating'}
                      </button>
                      <button
                        onClick={() => { setSelectedTeacher(null); }}
                        style={{
                          padding: '11px 18px', borderRadius: 10,
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
                    </div>

                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <TopBar collapsed={collapsed} onToggleSidebar={toggleCollapsed} />
    </div>
  );
}

export default StudentRateTeacher;
