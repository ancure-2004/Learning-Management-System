# LMS Project Progress & Roadmap

> **Tracking Standard:** Strict 4-tier lifecycle (`Current State -> In Progress -> Next Up -> Archive`).
> Keeps active focus clear while avoiding scrolling through unstructured history walls.

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
- [ ] **Data Export Formats:** Excel/PDF export capabilities for class attendance logs and finalized timetable grids.

---

## 3. Next Up (Prioritized Roadmap)

### Phase 1: Academic Deepening
- **Examination & Grading System:**
  - Exam scheduling timetable module.
  - Marks entry portal for teachers, automated GPA/CGPA computation, and student report cards.
- **Assignments & Submissions Portal:**
  - Assignment creation with deadlines and attachment upload.
  - Student file submissions and teacher grading rubric.
- **Fee Management System:**
  - Student fee ledger, semester dues tracking, and payment gateway integration (Razorpay / Stripe).

### Phase 2: Smart AI Enhancements
- **Smart Substitution Engine:**
  - When an admin approves a faculty leave, automatically query the solver to suggest available substitute teachers with matching subject competence.
- **AI Course Assistant:**
  - Auto-generate unit summaries, practice quizzes, and lecture slides from syllabus topics.

### Phase 3: Production & DevOps
- **Redis Caching Layer:** Cache published timetable grids and static academic structures for sub-10ms response times.
- **Automated CI/CD Pipeline:** GitHub Actions workflow executing ESLint, backend route tests, and build validation on pull requests.

---

## 4. Archive (Completed Milestones)

- **Milestone 1 — Core Prototype:** Initial single-class timetable generator with basic Express CRUD and MongoDB storage.
- **Milestone 2 — Cross-Class Constraint Solver:** Integrated Python FastAPI with Google OR-Tools CP-SAT discrete solver, adding support for lab consecutive slots, teacher daily limits, and cross-class room reservations.
- **Milestone 3 — Backend Layered Refactor:** Re-architected backend into strict `Route -> Controller -> Service -> Model` structure with `ApiError`, `asyncHandler`, and CRUD factories.
- **Milestone 4 — Frontend Modernization:** Migrated to React 18, Vite, TailwindCSS v4, TanStack React Query v5, and rebuilt 66+ pages across Admin, Teacher, and Student layouts.
- **Milestone 5 — Attendance & Leave Management:** Implemented full daily attendance registers for classes and a multi-status leave application/approval workflow.
- **Milestone 6 — OpenAPI 3.0 & Real-time Integration:** Built zero-drift static OpenAPI parser for `/api-docs` Swagger UI and integrated Socket.IO live notifications.
