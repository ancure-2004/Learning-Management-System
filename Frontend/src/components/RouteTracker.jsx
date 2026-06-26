import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackRecent } from '@/pages/admin/Dashboard';

/* ═══════════════════════════════════════════════════════════════
   ROUTE TRACKER

   Records every page visit into localStorage so the
   "Jump back in" tile on the admin dashboard populates with
   the user's real recent activity instead of demo data.

   Mount once inside <Router> in App.jsx — does not render anything.
   ═══════════════════════════════════════════════════════════════ */

/* Map each tracked route to a human label + an icon name that the
   Jump Back In tile knows how to render.  Routes not in this map
   (login, register, dashboard itself, dynamic routes like
   /edit-timetable/:id) are deliberately ignored.                */
const ROUTE_META = {
  '/classes':             { label: 'Classes',             icon: 'class' },
  '/subjects':            { label: 'Subjects',            icon: 'subject' },
  '/teachers':            { label: 'Teachers',            icon: 'teacher' },
  '/classrooms':          { label: 'Classrooms',          icon: 'room' },
  '/departments':         { label: 'Departments',         icon: 'dept' },
  '/programs':            { label: 'Programs',            icon: 'program' },
  '/assign-subjects':     { label: 'Assign subjects',     icon: 'syllabus' },
  '/view-timetables':     { label: 'Timetables',          icon: 'timetable' },
  '/academic-calendar':   { label: 'Academic calendar',   icon: 'calendar' },
  '/progress-dashboard':  { label: 'Progress dashboard',  icon: 'progress' },
  '/teacher-performance': { label: 'Teacher performance', icon: 'rating' },
  '/reports':             { label: 'Reports',             icon: 'report' },
  '/manage-syllabus':     { label: 'Manage syllabus',     icon: 'syllabus' },
  '/users':               { label: 'Users',               icon: 'users' },
  '/log-session':         { label: 'Log session',         icon: 'progress' },
  '/rate-teachers':       { label: 'Rate teachers',       icon: 'rating' },
  '/student-timetable':   { label: 'My timetable',        icon: 'timetable' },
  '/teacher-timetable':   { label: 'My timetable',        icon: 'timetable' },
};

const RouteTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const meta = ROUTE_META[location.pathname];
    if (meta) trackRecent(meta.label, location.pathname, meta.icon);
  }, [location.pathname]);

  return null;
};

export default RouteTracker;
