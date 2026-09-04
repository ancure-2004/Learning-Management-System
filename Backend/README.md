# LMS Backend API & Real-time Server

High-performance Express.js REST API with Socket.IO real-time events, MongoDB/Mongoose data layer, and integration with the FastAPI OR-Tools Timetable Constraint Solver microservice.

---

## 1. System Architecture

```
                                  ┌─────────────────────────────┐
                                  │      Client Applications    │
                                  │  (React 18 / React Query)   │
                                  └──────────────┬──────────────┘
                                                 │ HTTP / WebSocket
                                                 ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Express.js Backend (Port 5000)                                                                    │
│                                                                                                   │
│   ┌───────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │ Security & Infra: Helmet, Compression, CORS, Rate Limiters, Swagger UI (/api-docs)        │   │
│   └────────────────────────────────────────────┬──────────────────────────────────────────────┘   │
│                                                ▼                                                  │
│   ┌───────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │ Routes (17 Domain Modules) ──> Middleware (verifyToken, authorize, validate)             │   │
│   └────────────────────────────────────────────┬──────────────────────────────────────────────┘   │
│                                                ▼                                                  │
│   ┌───────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │ Controllers (asyncHandler) ──> Services (Business Logic & Mongoose Access) ──> Models     │   │
│   └────────────────────────────────────────────┬──────────────────────────────────────────────┘   │
│                                                │                                                  │
│                        ┌───────────────────────┴───────────────────────┐                          │
│                        ▼                                               ▼                          │
│         ┌─────────────────────────────┐                 ┌─────────────────────────────┐           │
│         │   Socket.IO Push Engine     │                 │   Solver Service Client     │           │
│         │ (Live Notification Toasts)  │                 │  (FastAPI Microservice)     │           │
│         └─────────────────────────────┘                 └──────────────┬──────────────┘           │
└────────────────────────┬───────────────────────────────────────────────┼──────────────────────────┘
                         │                                               │ HTTP (Port 8000)
                         ▼                                               ▼
          ┌─────────────────────────────┐                 ┌─────────────────────────────┐
          │      MongoDB Database       │                 │ Python OR-Tools CP-SAT      │
          │   (Mongoose 7 ODM Models)   │                 │ Constraint Timetable Solver │
          └─────────────────────────────┘                 └─────────────────────────────┘
```

---

## 2. API Inventory (112 Endpoints Across 17 Domains)

Auto-generated OpenAPI 3.0 documentation is served live at `http://localhost:5000/api-docs`.

| Domain | Base Path | Endpoints | Key Capabilities |
| :--- | :--- | :---: | :--- |
| **Auth** | `/auth` | 9 | User register, login, profile, password change, current user, role verification (`admin`, `teacher`, `student`). |
| **Subjects** | `/subjects` | 4 | CRUD for academic subjects, weekly lecture count, code, credits, type (theory/practical). |
| **Teachers** | `/teachers` | 6 | Faculty directory, max workload limits, assigned department, qualifications, availability. |
| **Classrooms** | `/classrooms` | 4 | Room inventory, seating capacities, lab/theory tagging, building locations. |
| **Departments** | `/departments` | 5 | Academic departments, head of department (HOD) assignments, associated programs. |
| **Programs** | `/programs` | 6 | Degree/curriculum programs (B.Tech, BCA, MCA), duration, semesters, department link. |
| **Classes** | `/classes` | 6 | Class sections (e.g. CS-3A), semester, student count, classroom assignment. |
| **Class-Subjects** | `/class-subjects` | 7 | Teacher-subject-class allocations, lecture targets, lab consecutive slot flags. |
| **Timetables** | `/timetables` | 13 | Solver triggering, adaptive timetable generation, slot editing, publish/unpublish, conflict validation, cross-class reservations. |
| **Progress** | `/progress` | 6 | Unit/topic teaching progress logs, completion percentages, teacher session logs. |
| **Syllabus** | `/syllabus` | 8 | Course syllabus management, unit breakdowns, reference materials, syllabus status. |
| **Ratings** | `/ratings` | 6 | Student feedback submissions, star ratings, teacher performance aggregation. |
| **Reports** | `/reports` | 6 | Department workload summaries, room utilization analytics, attendance reports. |
| **Calendar** | `/calendar` | 6 | Academic terms, semester schedules, institutional holidays, exam periods. |
| **Notifications** | `/notifications` | 5 | Notification inbox, mark-as-read, Socket.IO live push triggers. |
| **Attendance** | `/attendance` | 6 | Session attendance marking (Present/Absent/Late), student percentage analytics, class registers. |
| **Leave** | `/leave` | 9 | Faculty leave applications, medical/casual leave categorization, admin approval/rejection workflow. |

---

## 3. Layered Design & Code Conventions

Every domain strictly follows the **Route -> Controller -> Service -> Model** convention:

1. **Route (`routes/<name>.js`):** Defines HTTP paths and attaches middleware (`verifyToken`, `authorize('admin')`, `validate(schema)`). Contains zero business logic.
2. **Controller (`controllers/<name>.controller.js`):** Extracts parameters (`req.params`, `req.body`, `req.query`, `req.user`), delegates to the service, and returns standard JSON responses. Wrapped in `asyncHandler`.
3. **Service (`services/<name>.service.js`):** Contains business logic and database queries. Throws typed `ApiError` instances for failures. Never accesses `req` or `res`.
4. **Model (`models/<name>.model.js`):** Mongoose schemas with indexed fields and validation rules.

### Shared Infrastructure (`utils/`, `middleware/`, `config/`)
- `config/index.js`: Strict environment variable validation (fails fast if `ATLAS_URI` or `JWT_SECRET` is missing).
- `utils/ApiError.js`: Standard error class (`ApiError.badRequest()`, `.notFound()`, `.unauthorized()`, `.forbidden()`).
- `middleware/errorHandler.js`: Centralized error handler returning consistent `{ status: 'error', message: '...' }` payloads.
- `utils/crudService.js` / `utils/crudController.js`: Factory utilities for rapid domain scaffolding.
- `services/solver.service.js`: HTTP client communicating with the Python FastAPI constraint solver.
- `services/notificationService.js`: Socket.IO broadcast and targeted user room notifications (`user-<id>`).

---

## 4. Scaffolding a New Domain

To add a new domain module in seconds:

```bash
npm run scaffold <domain-name>
```

This automatically generates:
- `models/<domain-name>.model.js`
- `services/<domain-name>.service.js`
- `controllers/<domain-name>.controller.js`
- `routes/<domain-name>s.js`

---

## 5. Local Setup & Scripts

### Prerequisites
- Node.js 18+
- MongoDB instance (Local or MongoDB Atlas)
- Running Solver microservice (Port 8000) for timetable generation

### Installation & Run
```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Seed initial database (Admin, Teachers, Classes, Subjects)
npm run seed

# Run in development mode with nodemon
npm run dev

# Generate static OpenAPI JSON spec
npm run docs
```

### Environment Variables (`.env`)
```env
PORT=5000
NODE_ENV=development
ATLAS_URI=mongodb://localhost:27017/lms
JWT_SECRET=your_jwt_secret_key
SOLVER_SERVICE_URL=http://localhost:8000
CORS_ORIGINS=http://localhost:5173
OPEN_DOCS=true
```
