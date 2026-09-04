# LMS Codebase Reference & Architecture Brief

> **Target Audience:** AI/LLM agents and software engineers onboarding to the Learning Management System (LMS) codebase.
> **Scope:** Authoritative description of the **current reality** of the system as implemented.

---

## 1. Executive Summary & Core Purpose

The Learning Management System (LMS) is a multi-service web platform designed for higher education institutions. It unifies academic resource management, student learning progress, faculty workload tracking, attendance, leave management, and an **AI-driven Automated Timetable Scheduler** powered by discrete constraint optimization.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                       LMS PLATFORM                                     │
├────────────────────────────┬─────────────────────────────┬─────────────────────────────┤
│    Frontend (Port 5173)    │     Backend (Port 5000)     │  Solver Service (Port 8000) │
│  React 18 / Vite / Tailwind│   Express.js / Socket.IO    │     FastAPI / OR-Tools      │
│  TanStack Query v5         │   MongoDB / Mongoose 7      │     CP-SAT Optimization     │
└────────────────────────────┴─────────────────────────────┴─────────────────────────────┘
```

---

## 2. System Runtimes & Architecture

### A. Express.js Backend (`/Backend`)
- **Port:** `5000`
- **Stack:** Node.js, Express 4, Mongoose 7, Socket.IO 4, Helmet, Compression, Zod, Swagger UI Express.
- **Pattern:** Strict layered architecture (`Route -> Controller -> Service -> Model`).
- **Endpoint Inventory:** 112 REST endpoints across 17 domain modules.
- **Live OpenAPI Documentation:** Served at `http://localhost:5000/api-docs`.

### B. React Frontend (`/Frontend`)
- **Port:** `5173`
- **Stack:** React 18, Vite, TailwindCSS v4, React Router v6, `@tanstack/react-query` v5, Axios, Recharts, Socket.IO Client.
- **Role Portals:** Separate layouts for `Admin`, `Teacher`, `Student`, and `Public` guest landing pages.
- **Views:** 66+ UI page components with responsive, glassmorphic UI design.

### C. Timetable Solver Microservice (`/Solver-service`)
- **Port:** `8000`
- **Stack:** Python 3.10+, FastAPI, Uvicorn, Google OR-Tools (`cp_model.CpModel`).
- **Function:** Solves NP-hard class scheduling problems against teacher availability, room capacity, max lectures per day, lab consecutive blocks, and cross-class reservations.

---

## 3. Implemented Modules & Domain Inventory

| Domain | Backend Route | Key Responsibilities |
| :--- | :--- | :--- |
| **Authentication** | `/auth` | JWT issuance, password hashing (`bcryptjs`), role verification (`admin`, `teacher`, `student`), user profile updates. |
| **Academic Hierarchy** | `/departments`, `/programs`, `/classes` | Managing academic faculties, degree programs, semesters, and class sections (e.g. CS-3A). |
| **Academic Resources** | `/subjects`, `/classrooms`, `/teachers` | Catalog of theory/lab courses, room capacities and equipment tags, faculty directory with workload limits. |
| **Class-Subject Mapping** | `/class-subjects` | Linking classes with subjects, assigning teacher in-charge, setting weekly lecture quotas and lab requirements. |
| **Timetable Engine** | `/timetables` | Solver dispatch, adaptive urgency calculation, interactive slot editing, conflict detection, cross-class reservations. |
| **Attendance System** | `/attendance` | Daily class register marking (Present/Absent/Late), student percentage calculations, below-75% attendance alerts. |
| **Leave Management** | `/leave` | Teacher leave applications (casual/medical/duty), document attachments, admin review and approval pipeline. |
| **Progress & Syllabus** | `/progress`, `/syllabus` | Course syllabus unit breakdowns, completed lecture logs, teacher progress velocity vs academic calendar. |
| **Teacher Ratings** | `/ratings` | Anonymous/verified student feedback, star ratings, aggregate faculty performance metrics. |
| **Institutional Reports** | `/reports` | Workload analytics, classroom utilization matrices, student attendance compliance reports. |
| **Academic Calendar** | `/calendar` | Semester start/end dates, exam periods, institutional holidays. |
| **Real-Time Notifications**| `/notifications` | Socket.IO room push (`user-<id>`), notification inbox, unread badges and toasts. |

---

## 4. User Personas & Permissions Matrix

```
┌─────────────────────────────┬───────────┬─────────────┬─────────────┐
│ Feature / Capability        │   Admin   │   Teacher   │   Student   │
├─────────────────────────────┼───────────┼─────────────┼─────────────┤
│ User & Faculty Management   │   Full    │  Read-Only  │    None     │
│ Academic Structure Config   │   Full    │  Read-Only  │  Read-Only  │
│ Generate/Publish Timetable  │   Full    │  Read-Only  │  Read-Only  │
│ Mark Attendance Register    │   Full    │  Assigned   │    None     │
│ View Personal Attendance    │   Full    │  Own Classes│  Personal   │
│ Apply for Faculty Leave     │   None    │    Full     │    None     │
│ Review/Approve Leaves       │   Full    │    None     │    None     │
│ Log Syllabus Progress       │   Full    │  Assigned   │  Read-Only  │
│ Submit Teacher Rating       │   None    │    None     │    Full     │
│ View System Reports         │   Full    │  Workload   │    None     │
└─────────────────────────────┴───────────┴─────────────┴─────────────┘
```

---

## 5. Local Development & Seed Credentials

### Service Ports
- **Frontend:** `http://localhost:5173`
- **Backend:** `http://localhost:5000` (API Docs: `http://localhost:5000/api-docs`)
- **Solver Service:** `http://localhost:8000` (FastAPI Docs: `http://localhost:8000/docs`)

### Default Seed Users (`npm run seed` in `/Backend`)
- **Admin:** `admin@admin.com` / `admin123`
- **Teacher:** `teacher@test.com` / `teacher123`
- **Student:** `student@test.com` / `student123`

---

## 6. Key Architecture & Design Decisions

### A. Route-Controller-Service-Model Layering
- **Decision:** Explicitly separate HTTP request routing, controller payload unpacking, and service business logic.
- **Rationale:** Ensures service methods can be tested independently of Express, enables reusable CRUD factories (`crudService`, `crudController`), and keeps error handling centralized via `ApiError`.

### B. Dedicated Python Solver Microservice
- **Decision:** Host the timetable scheduling engine as an isolated FastAPI microservice utilizing Google OR-Tools rather than a Node.js solver or native C++ addon.
- **Rationale:** Constraint satisfaction problems (CP-SAT) require raw numerical optimization efficiency and mature constraint programming libraries. Decoupling it allows independent scaling and CPU isolation from the I/O-bound web server.

### C. TanStack React Query for Frontend State
- **Decision:** Use React Query v5 for server state management instead of Redux or heavy client stores.
- **Rationale:** Eliminates boilerplate reducer code, automatically handles background refetching, query caching, mutation rollback, and precise cache invalidation upon timetable or attendance mutations.

### D. Static OpenAPI Spec Generation
- **Decision:** Parse routes and mounts statically via `Backend/docs/openapi.js` rather than maintaining a separate YAML document or bulky runtime decorators.
- **Rationale:** Zero documentation drift. Any new route added to Express is immediately reflected in Swagger UI (`/api-docs`) without manual YAML maintenance.

### E. Cross-Class Conflict Prevention
- **Decision:** Backend queries existing published timetables to construct `reserved_teacher_slots` and `reserved_room_slots` payloads before invoking the Solver.
- **Rationale:** Allows incremental scheduling of individual class sections while guaranteeing zero double-booking of shared laboratories or multi-class professors.
