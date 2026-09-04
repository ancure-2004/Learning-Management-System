# LMS Project Progress & Roadmap

> **Tracking Standard:** Strict 5-tier lifecycle (`Current State -> In Progress -> Next Up -> Future Ideas -> Archive`).
> Keeps active focus clear while separating immediate execution from long-range vision.

---

## 1. Current State (Active & Verified)

The Learning Management System is fully functional across all three primary tiers:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CURRENT CAPABILITIES                                 │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ • Full Layered Express.js Backend: 112 API endpoints across 17 domain modules         │
│ • React 18 + Vite + Tailwind v4 Frontend: 66+ views across Admin, Teacher, Student     │
│ • FastAPI OR-Tools Constraint Solver: Multi-variable CP-SAT Timetable Engine           │
│ • Subsystems: Attendance Registers, Leave Management, Syllabus Progress, Ratings       │
│ • Live Docs: Auto-generated OpenAPI 3.0 spec served at /api-docs                       │
│ • Real-Time: Socket.IO notification toasts and unread inbox badges                     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. In Progress (Active Work)

- [ ] **Docker Compose Orchestration:** Multi-container `docker-compose.yml` for unified one-command local startup (Frontend + Backend + Solver + MongoDB).
- [ ] **E2E Integration Verification:** Automated contract and smoke tests between Frontend React Query mutation hooks and Backend Express endpoints.
- [ ] **Data Export Formats:** Excel and PDF export capabilities for class attendance registers and finalized timetable grids.

---

## 3. Next Up (Near-Term, What's Actually Being Built Next)

Concrete, prioritized tasks scheduled for the immediate upcoming sprints:

- [ ] **Smart Faculty Substitution:** When an admin approves a teacher's leave in `/leave`, automatically query the solver/schedule to recommend available substitute teachers with matching subject competence.
- [ ] **Attendance Threshold Alerts:** Automated Socket.IO notifications sent to students and advisors when attendance falls below institutional criteria (< 75%).
- [ ] **Timetable Version History:** Store previous timetable versions before overrides or regenerations with one-click restore.
- [ ] **Batch User Import:** CSV / Excel bulk upload for onboarding new students and faculty members.

---

## 4. Future Ideas / Backlog (Long-Term Vision, Not Scheduled)

Long-range product vision and planned major subsystems:

### Phase 1: Academic Deepening
- **Examination & Grading System:** Exam scheduling timetable module, marks entry portal, automated GPA/CGPA computation, and student report card generation.
- **Assignments & Homework Portal:** Assignment creation with deadlines, student file submissions, and teacher grading rubrics.
- **Fee Management System:** Student fee ledger, semester dues tracking, and payment gateway integration (Razorpay / Stripe).

### Phase 2: AI & Smart Enhancements
- **AI Course Assistant:** Auto-generate unit summaries, practice quizzes, and lecture notes from uploaded syllabus documents.
- **Predictive Analytics:** Early warning system predicting student academic risk based on attendance trends and progress logs.

### Phase 3: Infrastructure & Scalability
- **Redis Caching Layer:** High-speed caching for published timetable grids and static academic structures.
- **Automated CI/CD Pipeline:** GitHub Actions workflow executing ESLint, backend route tests, and build validation on pull requests.
- **Multi-Tenant Institution Support:** Multi-college isolation under a single unified platform.

---

## 5. Archive (Completed Milestones)

- **Milestone 1 — Core Prototype:** Initial single-class timetable generator with basic Express CRUD and MongoDB storage.
- **Milestone 2 — Cross-Class Constraint Solver:** Integrated Python FastAPI with Google OR-Tools CP-SAT discrete solver, adding support for lab consecutive slots, teacher daily limits, and cross-class room reservations.
- **Milestone 3 — Backend Layered Refactor:** Re-architected backend into strict `Route -> Controller -> Service -> Model` structure with `ApiError`, `asyncHandler`, and CRUD factories.
- **Milestone 4 — Frontend Modernization:** Migrated to React 18, Vite, TailwindCSS v4, TanStack React Query v5, and rebuilt 66+ pages across Admin, Teacher, and Student layouts.
- **Milestone 5 — Attendance & Leave Management:** Implemented full daily attendance registers for classes and a multi-status leave application/approval workflow.
- **Milestone 6 — OpenAPI 3.0 & Real-time Integration:** Built zero-drift static OpenAPI parser for `/api-docs` Swagger UI and integrated Socket.IO live notifications.
