import { theme } from '@/theme';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar, { ActionButton, useHistoryNav, useSidebarState } from '@/layouts/Sidebar';
import { TEACHER_NAV } from '@/layouts/TeacherLayout';
import NotificationBell from '@/components/NotificationBell';
import GlobalSearchBar from '@/components/GlobalSearchBar';
import teacherService from '@/services/teacherService';
import timetableService from '@/services/timetableService';
import ratingService from '@/services/ratingService';
import classSubjectService from '@/services/classSubjectService';
import I from '@/components/Icon';
import {
  HeroStrip,
  TodayScheduleCard,
  MyClassesCard,
  GradingQueueCard,
  LoadHeatmap,
  FeedbackCard,
} from './components/cards';

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   DESIGN TOKENS â€” identical to admin & student dashboards.
   The visual identity stays consistent across all three roles;
   only content and layout differ. Same slate palette, same
   layered shadows, same Plus Jakarta Sans typography.
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const T = theme;

const TOPBAR_H = 64;

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   GLOBAL STYLES â€” same animation system + a few teacher-specific
   keyframes (ring-fill for syllabus rings, slide-in for the hero).
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const GLOBAL_STYLES = `

@keyframes ch-hero-slide-in {
  from { opacity: 0; transform: translateX(-12px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes ch-ring-fill {
  to { stroke-dashoffset: 0; }
}
@keyframes ch-pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.6; transform: scale(1.18); }
}
@keyframes ch-sparkle {
  0%, 100% { opacity: 0.4; }
  50%      { opacity: 1; }
}

.ch-tile-cell { animation: tileEnter 700ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.ch-tile-cell.d1 { animation-delay: 0ms; }
.ch-tile-cell.d2 { animation-delay: 90ms; }
.ch-tile-cell.d3 { animation-delay: 180ms; }
.ch-tile-cell.d4 { animation-delay: 270ms; }
.ch-tile-cell.d5 { animation-delay: 360ms; }
.ch-tile-cell.d6 { animation-delay: 450ms; }
.ch-tile-cell.d7 { animation-delay: 540ms; }
.ch-tile-cell.d8 { animation-delay: 630ms; }

.ch-hero { animation: ch-hero-slide-in 800ms cubic-bezier(0.16, 1, 0.3, 1) both; }

.ch-card { transition: transform 400ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 400ms cubic-bezier(0.4, 0, 0.2, 1); }

.ch-row-btn { transition: background 260ms cubic-bezier(0.4, 0, 0.2, 1), transform 260ms cubic-bezier(0.4, 0, 0.2, 1); }
.ch-row-btn:hover { background: ${T.surfaceMuted} !important; }
.ch-row-btn:active { transform: scale(0.99); }

.ch-cta-btn { transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1), filter 300ms cubic-bezier(0.4, 0, 0.2, 1); }
.ch-cta-btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.06);
  box-shadow: 0 12px 26px -3px rgba(124, 58, 237, 0.45), 0 1px 0 rgba(255, 255, 255, 0.2) inset !important;
}
.ch-cta-btn:active { transform: translateY(0) scale(0.98); }

.ch-pill-btn { transition: all 260ms cubic-bezier(0.4, 0, 0.2, 1); }
.ch-pill-btn:hover {
  background: ${T.accent} !important; color: #fff !important;
  transform: translateY(-1px);
}

.ch-icon-btn { transition: background 240ms cubic-bezier(0.4, 0, 0.2, 1), color 240ms cubic-bezier(0.4, 0, 0.2, 1); }
.ch-icon-btn:hover { background: ${T.surfaceMuted} !important; color: ${T.text} !important; }

.ch-class-tile { transition: transform 320ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 320ms cubic-bezier(0.4, 0, 0.2, 1), border-color 320ms ease; }
.ch-class-tile:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.10), 0 1px 0 rgba(255,255,255,0.8) inset !important;
}

.ch-pulse-dot { animation: ch-pulse-dot 1800ms cubic-bezier(0.4, 0, 0.2, 1) infinite; }

.ch-sparkle { animation: ch-sparkle 2400ms cubic-bezier(0.4, 0, 0.2, 1) infinite; }

.ch-row-btn:focus-visible, .ch-cta-btn:focus-visible, .ch-pill-btn:focus-visible {
  outline: 2px solid ${T.accent2}; outline-offset: 2px;
}
`;

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   TEACHER NAV â€” imported from TeacherLayout (single source of truth)
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const NAV = TEACHER_NAV;

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   TOPBAR â€” same translucent overlay as the other dashboards
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const TopBar = ({ collapsed, onToggleSidebar }) => {
  const { canBack, canForward, goBack, goForward } = useHistoryNav();
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50,
      height: TOPBAR_H,
      display: 'flex', alignItems: 'center',
      padding: '0 20px',
      background: 'rgba(238, 240, 245, 0.98)',
      borderBottom: '1px solid rgba(15, 23, 42, 0.06)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 3,
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        padding: '7px 9px',
        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 0 rgba(255,255,255,0.7) inset',
        flexShrink: 0,
      }}>
        <ActionButton icon="sidebar" label={collapsed ? 'Expand' : 'Collapse'} onClick={onToggleSidebar} />
        <ActionButton icon="back"    label="Back"    onClick={goBack}    disabled={!canBack} />
        <ActionButton icon="forward" label="Forward" onClick={goForward} disabled={!canForward} />
      </div>

      <GlobalSearchBar />

      <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
        <NotificationBell />
      </div>
    </div>
  );
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   INITIAL DATA â€” empty shell; all values come from the backend.
   Components handle empty arrays / zero values gracefully.
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const EMPTY_DATA = {
  teacher:      { firstName: '' },
  nextClass:    null,
  todayClasses: [],
  myClasses:    [],
  gradingQueue: [],
  watchlist:    [],
  load:         [[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]],
  feedback:     [],
  avgRating:    0,
};

/* Composite data-loader: resolves the teacher record, fetches timetable /
   ratings / class-subjects, derives today's schedule, class list and
   feedback, and returns the object that previously fed setData(). */
async function loadDashboard(user) {
  const teacher = { firstName: user.firstName || '' };

  try {
    // Step 1: resolve Teacher record from User ID
    let teacherRecord = null;
    try {
      teacherRecord = await teacherService.getByUser(user._id);
    } catch {}

    // Step 2: fetch timetable (today's schedule + classes list)
    // Backend route: GET /timetables/teacher/:userId
    const [ttRes, ratingsRes, classSubjectsRes] = await Promise.allSettled([
      timetableService.getForTeacher(user._id),
      teacherRecord ? ratingService.getForTeacher(teacherRecord._id) : Promise.reject('no teacher record'),
      teacherRecord ? classSubjectService.getByTeacher(teacherRecord._id) : Promise.reject('no teacher record'),
    ]);

    // Derive today's classes from timetable schedule
    let todayClasses = [];
    let nextClass = null;
    if (ttRes.status === 'fulfilled') {
      const ttData = ttRes.value;
      const timetables = ttData.timetables || [];
      const now = new Date();
      const dayIdx = now.getDay() - 1; // 0=Mon..4=Fri
      const SLOTS = ['9:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00'];
      const END_SLOTS = ['9:50','10:50','11:50','12:50','13:50','14:50','15:50','16:50'];
      const curHour = now.getHours() + now.getMinutes() / 60;

      if (dayIdx >= 0 && dayIdx <= 4) {
        timetables.forEach(tt => {
          const className = tt.class?.name || '';
          (tt.schedule?.[dayIdx] || []).forEach((slot, si) => {
            if (!slot?.length) return;
            slot.forEach(entry => {
              if (!entry.subject || entry.event) return;
              const teacherName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
              if (entry.teacher && !entry.teacher.toLowerCase().includes(teacherName.split(' ')[0]?.toLowerCase())) return;
              const startH = 9 + si;
              const status = curHour > startH + 1 ? 'completed' : curHour >= startH ? 'current' : 'upcoming';
              todayClasses.push({ time: SLOTS[si], endTime: END_SLOTS[si], subject: entry.subject, className, room: entry.classroom || 'â€”', status });
            });
          });
        });
        todayClasses.sort((a, b) => a.time.localeCompare(b.time));
        nextClass = todayClasses.find(c => c.status === 'current' || c.status === 'upcoming') || null;
        if (nextClass) {
          const startH = parseInt(nextClass.time);
          const diff = startH - curHour;
          nextClass = { ...nextClass, startsIn: diff <= 0 ? 'Now' : `${Math.round(diff * 60)} min`, studentCount: 0 };
        }
      }
    }

    // Derive myClasses from class-subjects
    let myClasses = [];
    if (classSubjectsRes.status === 'fulfilled') {
      const seen = new Set();
      (classSubjectsRes.value || []).forEach(a => {
        const key = `${a.class?._id}-${a.subject?._id}`;
        if (!seen.has(key)) {
          seen.add(key);
          myClasses.push({
            subject: a.subject?.name || 'â€”',
            subjectInitials: (a.subject?.code || a.subject?.name || 'S').slice(0, 3).toUpperCase(),
            className: a.class?.name || 'â€”',
            studentCount: 0,
            syllabusPercent: 0,
          });
        }
      });
    }

    // Ratings / feedback
    let feedback = [];
    let avgRating = 0;
    if (ratingsRes.status === 'fulfilled') {
      feedback = (ratingsRes.value.ratings || []).map(r => ({
        rating: r.overallRating,
        comment: r.feedback || '',
        className: r.class?.name || '',
        daysAgo: Math.floor((Date.now() - new Date(r.createdAt)) / 86400000),
      }));
      const ratings = ratingsRes.value.ratings || [];
      avgRating = ratings.length
        ? parseFloat((ratings.reduce((s, r) => s + r.overallRating, 0) / ratings.length).toFixed(1))
        : 0;
    }

    return {
      ...EMPTY_DATA,
      teacher,
      todayClasses: todayClasses.length  ? todayClasses  : EMPTY_DATA.todayClasses,
      nextClass:    nextClass            || EMPTY_DATA.nextClass,
      myClasses:    myClasses.length     ? myClasses     : EMPTY_DATA.myClasses,
      feedback:     feedback.length      ? feedback      : EMPTY_DATA.feedback,
      avgRating:    avgRating            || EMPTY_DATA.avgRating,
      // gradingQueue, watchlist, load â€” no backend endpoints yet, keep empty
    };
  } catch (err) {
    console.warn('Teacher dashboard load failed:', err);
    return { ...EMPTY_DATA, teacher };
  }
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   TEACHER BENTO â€” asymmetric grid, NOT a rail-and-main pattern.
   Hero strip on top (full width). Below it, an asymmetric
   2-row grid where cards span different column tracks. This
   structurally differs from admin (2-col) and student (3-col).
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const TeacherBento = ({ data }) => {
  const kpis = {
    classes:  data.myClasses.length,
    toGrade:  data.gradingQueue.reduce((sum, it) => sum + it.count, 0),
    rating:   data.avgRating.toFixed(1),
  };

  return (
    <>
      <HeroStrip teacher={data.teacher} nextClass={data.nextClass} kpis={kpis} />

      {/* Row 1 â€” Today's Schedule (wide) + Grading Queue (narrow) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.7fr) minmax(320px, 1fr)',
        gap: 14, marginBottom: 14,
      }}>
        <div className="ch-tile-cell d3" style={{
          height: 240,
          display: 'flex', flexDirection: 'column', minHeight: 0,
        }}>
          <TodayScheduleCard classes={data.todayClasses} />
        </div>
        <div className="ch-tile-cell d4" style={{
          height: 240,
          display: 'flex', flexDirection: 'column', minHeight: 0,
        }}>
          <GradingQueueCard items={data.gradingQueue} />
        </div>
      </div>

      {/* Row 2 â€” My Classes (full width) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 14, marginBottom: 14,
      }}>
        <div className="ch-tile-cell d5" style={{
          height: 380,
          display: 'flex', flexDirection: 'column', minHeight: 0,
        }}>
          <MyClassesCard classes={data.myClasses} />
        </div>
      </div>

      {/* Row 3 â€” Teaching Load heatmap (left) + Feedback (right) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.3fr) minmax(320px, 1fr)',
        gap: 14,
      }}>
        <div className="ch-tile-cell d7" style={{
          height: 360,
          display: 'flex', flexDirection: 'column', minHeight: 0,
        }}>
          <LoadHeatmap load={data.load} />
        </div>
        <div className="ch-tile-cell d8" style={{
          height: 360,
          display: 'flex', flexDirection: 'column', minHeight: 0,
        }}>
          <FeedbackCard feedback={data.feedback} avgRating={data.avgRating} />
        </div>
      </div>
    </>
  );
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MAIN COMPONENT
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { collapsed, toggleCollapsed } = useSidebarState();

  const { data = EMPTY_DATA } = useQuery({
    queryKey: ['dashboard', 'teacher', user?._id],
    queryFn: () => loadDashboard(user),
    enabled: !!user,
  });

  const handleAction = (path) => navigate(path);
  const handleLogout = () => { logout(); navigate('/login'); };

  const renderIcon = (name, size) => <I name={name} size={size} />;

  return (
    <div className="chronos" style={{
      position: 'relative',
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      background: T.bg,
      fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      color: T.text,
      letterSpacing: '-0.005em',
      fontFeatureSettings: '"tnum" 1, "ss01" 1, "ss02" 1, "calt" 1',
      textRendering: 'optimizeLegibility',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
    }}>
      <style>{GLOBAL_STYLES}</style>

      <div style={{
        marginTop: TOPBAR_H, height: `calc(100vh - ${TOPBAR_H}px)`,
        flexShrink: 0,
      }}>
        <Sidebar
          user={user}
          onLogout={handleLogout}
          onNavigate={handleAction}
          currentPath="/teacher-dashboard"
          navConfig={NAV}
          iconRenderer={renderIcon}
          collapsed={collapsed}
          onToggleCollapse={toggleCollapsed}
        />
      </div>

      <main style={{
        flex: 1, minWidth: 0,
        overflowY: 'auto', overflowX: 'hidden',
        position: 'relative',
        background: `linear-gradient(180deg, ${T.bg} 0%, ${T.bgAlt} 100%)`,
      }}>
        <div style={{ height: TOPBAR_H }} />

        <div style={{
          maxWidth: 1480,
          margin: '0 auto',
          padding: '20px 22px 40px',
        }}>
          <TeacherBento data={data} />
        </div>
      </main>

      <TopBar
        collapsed={collapsed}
        onToggleSidebar={toggleCollapsed}
      />
    </div>
  );
};

export default TeacherDashboard;
