# LMS Frontend Application

Modern, role-based single page application built with React 18, Vite, TailwindCSS v4, and TanStack React Query v5.

---

## 1. Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ React 18 Single Page Application (Port 5173)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  Routing & Layouts: React Router v6                                         │
│    ├── AdminLayout (Collapsible Sidebar, Command Palette / Search Modal)    │
│    ├── TeacherLayout (Schedule, Attendance, Leave, Syllabus)                │
│    ├── StudentLayout (Timetable, Attendance, Ratings, Notices)              │
│    └── PublicLayout (Modern Glassmorphism Landing Page & Auth)              │
├─────────────────────────────────────────────────────────────────────────────┤
│  State & Network:                                                           │
│    ├── TanStack React Query v5 (Server State Caching, Mutations, Invalidation)
│    ├── Axios API Client (Base URL, JWT Bearer Interceptors, Error Handling) │
│    └── Socket.IO Client (Real-time Toasts & Unread Notification Badges)     │
├─────────────────────────────────────────────────────────────────────────────┤
│  Styling & Data Visualization:                                              │
│    ├── TailwindCSS v4 with Dynamic Theme System (Glassmorphism, Dark/Light) │
│    └── Recharts (Workload Distribution, Room Utilization, Progress Trends) │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure & Page Catalog

```
src/
├── api/                  # Axios HTTP client, mock fallback data, QueryClient configuration
│   ├── client.js         # Configured Axios instance with auto auth-token injection
│   ├── queryClient.js    # TanStack Query client with standard stale/cache times
│   └── mockData.js       # Offline testing and demonstration mock datasets
├── components/           # Shared reusable UI primitives (Modals, Badges, Buttons, Tables)
├── context/              # Global React contexts (AuthContext, SocketContext, ThemeContext)
├── hooks/                # Custom React hooks (useAuth, useNotifications, useSocket)
├── layouts/              # Top-level shell layouts per user persona
│   ├── AdminLayout.jsx   # Master admin shell with global search modal & navigation
│   ├── TeacherLayout.jsx # Faculty shell with quick action bars
│   ├── StudentLayout.jsx # Student shell with academic quick links
│   └── Sidebar.jsx       # Dynamic role-filtered navigation sidebar
├── pages/                # 66+ View Components organized by persona
│   ├── admin/            # 21 Admin views & dashboard sub-tabs:
│   │   ├── Dashboard.jsx, AcademicCalendar.jsx, AcademicResources.jsx
│   │   ├── AdminLeaveManagement.jsx, AssignSubjects.jsx, Classes.jsx
│   │   ├── Classrooms.jsx, Departments.jsx, EditTimetable.jsx
│   │   ├── GenerateTimetableNew.jsx, Insights.jsx, ManageSyllabus.jsx
│   │   ├── Programs.jsx, ProgressDashboard.jsx, ReportDashboard.jsx
│   │   ├── Schedule.jsx, Subjects.jsx, TeacherPerformance.jsx
│   │   ├── Teachers.jsx, Users.jsx, ViewTimetables.jsx
│   │   └── components/ (PerformanceTab, ProgressTab, ReportsTab, SearchModal)
│   ├── teacher/          # 15 Faculty views:
│   │   ├── TeacherDashboard.jsx, TeacherSchedule.jsx, TeacherAttendance.jsx
│   │   ├── TeacherLeaveManagement.jsx, TeacherSyllabusTracker.jsx
│   │   ├── TeacherRatings.jsx, TeacherClasses.jsx, TeacherProgress.jsx
│   │   └── components/ (LeaveModal, SessionLogger, ClassSelector)
│   ├── student/          # 12 Student views:
│   │   ├── StudentDashboard.jsx, StudentTimetable.jsx, StudentAttendancePage.jsx
│   │   ├── StudentCalendarPage.jsx, StudentHolidaysPage.jsx, StudentNoticesPage.jsx
│   │   ├── StudentRateTeacher.jsx, StudentSubjectsPage.jsx
│   │   └── components/ (StarRating, SearchModal, AttendanceBadge)
│   ├── auth/             # Authentication pages: Login.jsx, Register.jsx, AuthShared.jsx
│   └── public/           # Public portal: LandingPage.jsx (Glassmorphism design)
├── services/             # 18 Axios API service modules:
│   ├── attendanceService.js, authService.js, calendarService.js
│   ├── classService.js, classSubjectService.js, classroomService.js
│   ├── departmentService.js, leaveService.js, notificationService.js
│   ├── programService.js, progressService.js, ratingService.js
│   ├── reportService.js, subjectService.js, syllabusService.js
│   ├── teacherService.js, timetableService.js
│   └── index.js          # Barrel export for all services
└── theme.js              # Theme definitions, CSS variables, and palette tokens
```

---

## 3. Key Frontend Features

1. **AI Timetable Interactive Grid:**
   - Visual drag-and-drop / slot-swap editor for class timetables with instant conflict detection warnings.
   - Cross-class occupancy highlighting for shared rooms and teachers.
2. **Attendance Management:**
   - Quick one-click session registers for teachers (Present / Absent / Late).
   - Real-time student attendance percentage calculation with threshold warning indicators (<75%).
3. **Faculty Leave Workflow:**
   - Teacher leave application modal with date ranges, reason, and status badges (`Pending`, `Approved`, `Rejected`).
   - Admin approval inbox with instant status updates and Socket.IO notification push.
4. **Real-time Push Notifications:**
   - Persistent notification inbox bell with unread count badges.
   - Animated toast popups for urgent timetable updates or leave status approvals.

---

## 4. Local Setup & Scripts

### Prerequisites
- Node.js 18+
- Running Backend server on `http://localhost:5000`

### Installation & Run
```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Run development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Run ESLint validation
npm run lint
```

### Environment Variables (`.env`)
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```
