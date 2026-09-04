# LMS & AI Timetable Generator - Frontend

A modern, role-based React single-page application built with React 18, Vite, Tailwind CSS, and TanStack React Query v5.

---

## 🏗️ Frontend Architecture

The frontend is structured around role-based workflows, shared layout shells, and a cached data-fetching layer:

```
Frontend/src/
├── api/
│   ├── client.js           # Central Axios instance with JWT interceptor & 401 handling
│   ├── queryClient.js      # Global TanStack Query client (30s stale, 5min cache)
│   └── mockData.js         # Offline demo fallback dataset for offline/preview mode
├── components/
│   ├── ErrorBoundary.jsx   # Runtime React error boundary
│   ├── GlobalSearchBar.jsx # ⌘K / Ctrl+K instant multi-domain search
│   ├── NotificationBell.jsx# Socket.IO + REST real-time notifications
│   ├── ProtectedRoute.jsx  # Role-based route guard ('admin', 'teacher', 'student')
│   └── RouteTracker.jsx    # User navigation history tracker
├── context/
│   └── AuthContext.jsx     # Authentication state, login/logout, user profile
├── hooks/
│   ├── queries.js          # React Query custom hooks (useClasses, useTimetables, etc.)
│   └── useMediaQuery.js    # Responsive breakpoint listeners
├── layouts/
│   ├── AdminLayout.jsx     # Admin workspace shell (sidebar, search bar, alerts)
│   ├── TeacherLayout.jsx   # Teacher workspace shell
│   ├── StudentLayout.jsx   # Student workspace shell
│   └── Sidebar.jsx         # Collapsible, resizable dark navigation sidebar
├── pages/
│   ├── admin/              # Administrator pages & unified multi-tab hubs
│   │   ├── AcademicResources.jsx  # Subjects, Classes, Classrooms Hub
│   │   ├── Schedule.jsx           # Assignments, Timetables, Calendar Hub
│   │   ├── Insights.jsx           # Reports, Progress, Faculty Ratings Hub
│   │   ├── AdminLeaveManagement.jsx # Teacher leave approval workflow
│   │   ├── ManageSyllabus.jsx     # Unit/topic hours breakdown
│   │   └── Users.jsx              # User directory & activation
│   ├── teacher/            # Faculty pages
│   │   ├── TeacherDashboard.jsx   # Daily schedule & quick stats
│   │   ├── TeacherTimetable.jsx   # Weekly schedule grid
│   │   ├── LogSession.jsx         # Teaching session & topic logger
│   │   ├── TeacherMarkAttendance.jsx # Class attendance entry
│   │   ├── TeacherLeavePage.jsx   # Leave application & status
│   │   └── TeacherMyRatings.jsx   # Evaluation scores & student feedback
│   ├── student/            # Student portal
│   │   ├── StudentDashboard.jsx   # Today's classes & notices
│   │   ├── StudentTimetable.jsx   # Weekly student schedule
│   │   ├── StudentAttendancePage.jsx # Subject-wise attendance percentages
│   │   └── StudentRateTeacher.jsx # 5-star faculty rating form
│   ├── auth/               # Login & Register views
│   └── public/             # Glassmorphic Landing Page
├── theme.js                # Centralized color tokens, shadows, and transitions
└── App.jsx                 # Route definitions and layout nesting
```

---

## ⚡ Core Features

- **Multi-Role Workspaces**: Clean separation of routes and interfaces for Administrators, Teachers, and Students.
- **Unified Admin Hubs**: Consolidates 10+ sub-pages into 3 cohesive hubs (*Academic Resources*, *Schedule & Timetables*, *Insights & Analytics*).
- **Server State with TanStack Query v5**: Automatic background refetching, request deduplication, optimistic updates, and instant navigation.
- **Offline / Demo Fallback Mode**: When the backend server is unreachable, `api/mockData.js` smoothly provides rich mock records so UI interactions remain interactive.
- **Global Search (`GlobalSearchBar.jsx`)**: Instant keyboard shortcut search across all academic resources, teachers, and timetable schedules.
- **Responsive Layouts**: Fully responsive with drawer navigation on mobile and collapsible sidebar on desktop.

---

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```
