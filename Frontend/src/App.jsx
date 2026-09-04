import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';

// Shared infra — eagerly imported (tiny, needed on every route)
import ProtectedRoute from '@/components/ProtectedRoute';
import RouteTracker from '@/components/RouteTracker';
import ErrorBoundary from '@/components/ErrorBoundary';

// Public
const LandingPage = lazy(() => import('@/pages/public/LandingPage'));

// Auth
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));

// Admin pages — code-split so each loads only when its route is hit
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'));
const Users = lazy(() => import('@/pages/admin/Users'));
const Subjects = lazy(() => import('@/pages/admin/Subjects'));
const Teachers = lazy(() => import('@/pages/admin/Teachers'));
const Classrooms = lazy(() => import('@/pages/admin/Classrooms'));
const AcademicResources = lazy(() => import('@/pages/admin/AcademicResources'));
const Insights = lazy(() => import('@/pages/admin/Insights'));
const Schedule = lazy(() => import('@/pages/admin/Schedule'));
const Departments = lazy(() => import('@/pages/admin/Departments'));
const Programs = lazy(() => import('@/pages/admin/Programs'));
const Classes = lazy(() => import('@/pages/admin/Classes'));
const AssignSubjects = lazy(() => import('@/pages/admin/AssignSubjects'));
const GenerateTimetableNew = lazy(() => import('@/pages/admin/GenerateTimetableNew'));
const ViewTimetables = lazy(() => import('@/pages/admin/ViewTimetables'));
const EditTimetable = lazy(() => import('@/pages/admin/EditTimetable'));
const ProgressDashboard = lazy(() => import('@/pages/admin/ProgressDashboard'));
const ManageSyllabus = lazy(() => import('@/pages/admin/ManageSyllabus'));
const TeacherPerformance = lazy(() => import('@/pages/admin/TeacherPerformance'));
const ReportDashboard = lazy(() => import('@/pages/admin/ReportDashboard'));
const AcademicCalendar = lazy(() => import('@/pages/admin/AcademicCalendar'));
const AdminLeaveManagement = lazy(() => import('@/pages/admin/AdminLeaveManagement'));

// Teacher pages
const TeacherDashboard = lazy(() => import('@/pages/teacher/TeacherDashboard'));
const TeacherTimetable = lazy(() => import('@/pages/teacher/TeacherTimetable'));
const LogSession = lazy(() => import('@/pages/teacher/LogSession'));
const TeacherGrading = lazy(() => import('@/pages/teacher/TeacherGrading'));
const TeacherStudentProgress = lazy(() => import('@/pages/teacher/TeacherStudentProgress'));
const TeacherMyRatings = lazy(() => import('@/pages/teacher/TeacherMyRatings'));
const TeacherSyllabus = lazy(() => import('@/pages/teacher/TeacherSyllabus'));
const TeacherCalendarPage = lazy(() => import('@/pages/teacher/TeacherCalendarPage'));
const TeacherClassPerformance = lazy(() => import('@/pages/teacher/TeacherClassPerformance'));
const TeacherMarkAttendance = lazy(() => import('@/pages/teacher/TeacherMarkAttendance'));
const TeacherClassesPage = lazy(() => import('@/pages/teacher/TeacherClassesPage'));
const TeacherLeavePage = lazy(() => import('@/pages/teacher/TeacherLeavePage'));

// Student pages
const StudentDashboard = lazy(() => import('@/pages/student/StudentDashboard'));
const StudentTimetable = lazy(() => import('@/pages/student/StudentTimetable'));
const StudentRateTeacher = lazy(() => import('@/pages/student/StudentRateTeacher'));
const StudentSubjectsPage = lazy(() => import('@/pages/student/StudentSubjectsPage'));
const StudentCalendarPage = lazy(() => import('@/pages/student/StudentCalendarPage'));
const StudentAttendancePage = lazy(() => import('@/pages/student/StudentAttendancePage'));
const StudentHolidaysPage = lazy(() => import('@/pages/student/StudentHolidaysPage'));
const StudentNoticesPage = lazy(() => import('@/pages/student/StudentNoticesPage'));

// Lightweight fallback shown while a route chunk is loading
function RouteFallback() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ color: '#6b7280', fontSize: '0.95rem' }}>Loading…</div>
    </div>
  );
}

/* Role-aware dashboard router
   Routes the user to the right home surface based on their role.
   Students get StudentDashboard, teachers get TeacherDashboard,
   admins (and any other role) get the original admin Dashboard.
   All paths funnel through /dashboard so login redirects don't
   need to know about roles. */
function RoleAwareDashboard() {
  const { user } = useAuth();
  if (user?.role === 'student') return <StudentDashboard />;
  if (user?.role === 'teacher') return <TeacherDashboard />;
  return <Dashboard />;
}

/* Teachers see their own syllabus view; admins see the creation form */
function RoleAwareSyllabus() {
  const { user } = useAuth();
  if (user?.role === 'teacher') return <TeacherSyllabus />;
  return <ManageSyllabus />;
}

/* Teachers see their own ratings; admins see full faculty performance */
function RoleAwareTeacherPerformance() {
  const { user } = useAuth();
  if (user?.role === 'admin') return <Insights defaultTab="performance" />;
  return <TeacherMyRatings />;
}

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
      <Router>
        {/* Records every page visit so the admin Dashboard's
            "Jump back in" tile shows real recent activity. */}
        <RouteTracker />
        <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes — role-aware: students get StudentDashboard,
              everyone else gets the admin Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <RoleAwareDashboard />
              </ProtectedRoute>
            }
          />

          {/* Direct route to student dashboard (bookmarkable) */}
          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Direct route to teacher dashboard (bookmarkable) */}
          <Route
            path="/teacher-dashboard"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Only Routes */}
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Users />
              </ProtectedRoute>
            }
          />

          {/* /subjects, /classes, /classrooms all resolve to the unified AcademicResources page.
              Each route just opens the matching tab by default. */}
          <Route
            path="/academic-resources"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AcademicResources defaultTab="subjects" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/subjects"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Subjects />
              </ProtectedRoute>
            }
          />

          <Route
            path="/teachers"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Teachers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/classrooms"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Classrooms />
              </ProtectedRoute>
            }
          />

          {/* Phase 2 Routes */}
          <Route
            path="/departments"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Departments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/programs"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Programs />
              </ProtectedRoute>
            }
          />

          <Route
            path="/classes"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AcademicResources defaultTab="classes" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/assign-subjects"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Schedule defaultTab="assignments" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/schedule"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Schedule defaultTab="timetables" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/generate-timetable"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <GenerateTimetableNew />
              </ProtectedRoute>
            }
          />
          <Route
            path="/generate-timetable/:classId"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <GenerateTimetableNew />
              </ProtectedRoute>
            }
          />
          <Route
            path="/generate-timetable-new/:classId"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Schedule defaultTab="timetables" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/view-timetables"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Schedule defaultTab="timetables" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-timetable"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <EditTimetable />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-timetable/:id"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Schedule defaultTab="timetables" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-leave-management"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLeaveManagement />
              </ProtectedRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/student-timetable"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentTimetable />
              </ProtectedRoute>
            }
          />

          {/* Teacher Routes */}
          <Route
            path="/teacher-timetable"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherTimetable />
              </ProtectedRoute>
            }
          />

          <Route
            path="/log-session"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <LogSession />
              </ProtectedRoute>
            }
          />

          {/* /reports, /progress-dashboard, /teacher-performance all resolve to the unified Insights page */}
          <Route
            path="/insights"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Insights defaultTab="reports" />
              </ProtectedRoute>
            }
          />

          {/* Progress & Syllabus Routes (Admin) */}
          <Route
            path="/progress-dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Insights defaultTab="progress" />
              </ProtectedRoute>
            }
          />

          {/* Admin creates syllabus; teacher reads their own */}
          <Route
            path="/manage-syllabus"
            element={
              <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                <RoleAwareSyllabus />
              </ProtectedRoute>
            }
          />

          {/* Rating Routes */}
          <Route
            path="/rate-teachers"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentRateTeacher />
              </ProtectedRoute>
            }
          />

          {/* /teacher-performance — teacher sees own ratings, admin sees faculty performance */}
          <Route
            path="/teacher-performance"
            element={
              <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                <RoleAwareTeacherPerformance />
              </ProtectedRoute>
            }
          />
          {/* Admin: view all teachers' performance via Insights */}
          <Route
            path="/insights/performance"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Insights defaultTab="performance" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher-performance/:teacherId"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Insights defaultTab="performance" />
              </ProtectedRoute>
            }
          />

          {/* Reports & Analytics */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Insights defaultTab="reports" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report-dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Insights defaultTab="reports" />
              </ProtectedRoute>
            }
          />

          {/* Academic Calendar */}
          <Route
            path="/academic-calendar"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Schedule defaultTab="calendar" />
              </ProtectedRoute>
            }
          />

          {/* Teacher routes */}
          <Route
            path="/teacher-classes"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherClassesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher-calendar"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherCalendarPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mark-attendance"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherMarkAttendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher-attendance"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherMarkAttendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/grading"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherGrading />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher-grading"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherGrading />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-progress"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherStudentProgress />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher-student-progress"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherStudentProgress />
              </ProtectedRoute>
            }
          />
          <Route
            path="/class-performance"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherClassPerformance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher-class-performance"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherClassPerformance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher-ratings"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherMyRatings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher-syllabus"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherSyllabus />
              </ProtectedRoute>
            }
          />

          {/* Student pages — properly routed, no broken redirects */}
          <Route
            path="/student-subjects"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentSubjectsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student-rate-teacher"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentRateTeacher />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rate-teacher"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentRateTeacher />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student-calendar"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentCalendarPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student-attendance"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentAttendancePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student-holidays"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentHolidaysPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student-notices"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentNoticesPage />
              </ProtectedRoute>
            }
          />

          {/* Leave management */}
          <Route
            path="/teacher-leave"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherLeavePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-leaves"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLeaveManagement />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </Router>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;
