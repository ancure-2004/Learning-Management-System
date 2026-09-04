# AI Timetable Generator & Learning Management System (LMS)

An intelligent, multi-role academic management platform and automated timetable scheduling system powered by Google OR-Tools CP-SAT, Node.js/Express, MongoDB, and React with TanStack Query.

---

## 🌟 Key Highlights & Capabilities

- ⚡ **Constraint-Based AI Scheduling**: Generates conflict-free academic timetables in seconds using Google OR-Tools CP-SAT (Python FastAPI microservice) with 7 hard constraints including cross-class conflict prevention and teacher cooldown limits.
- 🎯 **Adaptive Dynamic Slot Allocation**: Analyzes real-time syllabus completion and calculates urgency scores to dynamically grant extra lectures to behind-schedule courses.
- 🖐️ **Interactive Drag-and-Drop Editor**: Real-time slot conflict detection (<100ms), visual clash warnings, and full timetable versioning with instant rollback.
- 📋 **Class Attendance System**: Subject-wise and session-based student attendance tracking with absent/late toggles, aggregate metrics, and student threshold warnings.
- 🏖️ **Teacher Leave Management**: Automated leave workflow with timetable conflict detection, substitute coverage, and administrative approvals.
- ⭐ **5-Category Faculty Evaluations**: Anonymous student feedback across clarity, punctuality, engagement, knowledge, and accessibility with trend analytics.
- 📅 **Academic Calendar & Solver Holiday Blocking**: Unified calendar for holidays, exams, and vacations with automatic slot blocking in the solver and Socket.IO real-time notification alerts.
- 📊 **Analytics & Reporting**: Interactive Recharts dashboards for classroom utilization, teacher workload distribution, syllabus completion, and CSV/Excel exports.
- 📖 **Interactive OpenAPI 3.0 / Swagger UI**: Auto-generated API documentation served at `/api-docs`.

---

## 🏛️ System Architecture

The platform follows a clean, decoupled microservices and layered architecture:

```
                          ┌────────────────────────────────────────┐
                          │   Frontend (React 18.2 + Vite + Query) │
                          │   - Admin Layout & Unified Hubs        │
                          │   - Teacher Workspace & Session Logger │
                          │   - Student Portal & Timetables        │
                          └───────────────────┬────────────────────┘
                                              │ HTTP / WebSockets
                                              ▼
                          ┌────────────────────────────────────────┐
                          │   Backend (Node.js 18+ Express API)    │
                          │   - Routes (17 thin router modules)    │
                          │   - Controllers (17 asyncHandler ctls) │
                          │   - Services (20 domain services)      │
                          │   - Zod Validators (16 schemas)        │
                          │   - MongoDB Mongoose (18 data models)  │
                          │   - Socket.IO Real-time Engine         │
                          │   - OpenAPI 3.0 / Swagger UI           │
                          └───────────────────┬────────────────────┘
                                              │ HTTP POST /generate
                                              ▼
                          ┌────────────────────────────────────────┐
                          │   Solver Microservice (Python FastAPI) │
                          │   - Google OR-Tools CP-SAT Solver      │
                          │   - 7 Constraint Rules                 │
                          │   - Cross-Class Resource Locks         │
                          │   - Adaptive Urgency Calculations      │
                          └────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18.2, Vite, Tailwind CSS, TanStack React Query v5, React Router v6, Axios, Recharts, Lucide Icons |
| **Backend** | Node.js 18+, Express.js, MongoDB, Mongoose ODM, JWT, bcrypt, Socket.IO, Helmet, Compression, Express-Rate-Limit, Zod |
| **Solver Microservice** | Python 3.10+, FastAPI, Google OR-Tools 9.7+ (CP-SAT), Pydantic v2, Uvicorn |
| **API Documentation** | OpenAPI 3.0, Swagger UI Express |

---

## 📁 Repository Structure

```
Learning-Management-System/
├── Backend/                      # Node.js Express REST API & Socket.IO server
│   ├── config/                   # Environment & runtime configuration
│   ├── controllers/              # 17 HTTP Controllers (asyncHandler wrapped)
│   ├── docs/                     # OpenAPI 3.0 specification generator
│   ├── middleware/               # Auth, role authorization, validation, error handler
│   ├── models/                   # 18 Mongoose data models
│   ├── routes/                   # 17 Express route definitions
│   ├── services/                 # 20 Domain business logic & data access services
│   ├── utils/                    # ApiError, asyncHandler, crudService, crudController
│   ├── validators/               # 16 Zod validation schemas
│   ├── ARCHITECTURE.md           # Backend layered architecture conventions
│   └── index.js                  # Server entry point
├── Frontend/                     # React 18 SPA + Vite
│   ├── src/
│   │   ├── api/                  # Axios client, React Query client, mock data
│   │   ├── components/           # Reusable components (Search, Bell, ErrorBoundary)
│   │   ├── context/              # AuthContext & Session management
│   │   ├── hooks/                # Custom React Query hooks & media queries
│   │   ├── layouts/              # AdminLayout, TeacherLayout, StudentLayout, Sidebar
│   │   ├── pages/
│   │   │   ├── admin/            # Admin pages & unified hubs (Resources, Schedule, Insights)
│   │   │   ├── teacher/          # Teacher pages (Schedule, Attendance, Leave, Logging)
│   │   │   ├── student/          # Student portal (Timetable, Attendance, Ratings)
│   │   │   ├── auth/             # Login & Registration
│   │   │   └── public/           # Landing page
│   │   ├── theme.js              # Central design tokens
│   │   └── App.jsx               # Route configuration & role guards
│   └── vite.config.js            # Vite configuration
├── Solver-service/               # Python FastAPI OR-Tools scheduling microservice
│   ├── main.py                   # 7 CP-SAT solver constraints & endpoints
│   └── requirements.txt          # Python dependencies
├── Complete_Plan.md              # Complete project roadmap & phase status
├── Completed_Work.md             # Comprehensive technical log of built features
└── Next_Steps.md                 # Production deployment & testing roadmap
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher
- **MongoDB**: Local MongoDB instance or MongoDB Atlas URI

---

### 1. Start the Solver Microservice (Port 8000)

```bash
cd Solver-service
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
*Health Check:* `http://localhost:8000/` -> `{"status": "healthy", "service": "Timetable Solver Service"}`

---

### 2. Start the Backend API (Port 5000)

```bash
cd Backend
npm install
```

Create a `.env` file in `Backend/`:
```env
PORT=5000
NODE_ENV=development
ATLAS_URI=mongodb://localhost:27017/timetable_lms
JWT_SECRET=your_super_secret_jwt_key_change_in_prod
SOLVER_SERVICE_URL=http://localhost:8000
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
OPEN_DOCS=true
```

Run database seeds (optional for demo data):
```bash
node seed.js
```

Start the server:
```bash
npm start
# or with auto-restart:
npm run dev
```
*API Documentation (Swagger UI):* `http://localhost:5000/api-docs`  
*API Health Endpoint:* `http://localhost:5000/health`

---

### 3. Start the Frontend Application (Port 5173)

```bash
cd Frontend
npm install
npm run dev
```
*App URL:* `http://localhost:5173`

---

## 🔐 Default Demo Accounts

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@example.com` | `admin123` |
| **Teacher** | `teacher@example.com` | `teacher123` |
| **Student** | `student@example.com` | `student123` |

---

## 🧩 Solver Constraint Specification

The solver in `Solver-service/main.py` enforces 7 mathematical constraints using Boolean decision variables $x_{(s, t, c, d, sl)} \in \{0, 1\}$:

1. **H1: Lecture Frequency**: $\sum x = \text{adaptive\_slots}$ (dynamically calculated from urgency scores).
2. **H2: Teacher Conflict Prevention**: $\sum_{c, s} x \le 1$ per teacher per slot.
3. **H3: Classroom Conflict Prevention**: $\sum_{c, s} x \le 1$ per room per slot.
4. **H4: Lunch Break Protection**: $x = 0$ at slot 4 (13:00 - 14:00) across all 5 weekdays.
5. **H5: Teacher Cooldown Limit**: Maximum 2 consecutive lectures per faculty member before a mandatory rest slot.
6. **H6: Holiday & Blocked Day Exclusion**: All decision variables forced to 0 on academic calendar holidays.
7. **H7: Cross-Class Conflict-Free Reservations**: Guarantees zero double-booking against already scheduled classes during sequential generation.

---

## 📄 API & Developer Reference

For detailed backend guidelines, conventions, and domain scaffolding instructions, see:
- [`Backend/ARCHITECTURE.md`](file:///C:/Developing/firstmate/projects/Learning-Management-System/Backend/ARCHITECTURE.md)
- [`Completed_Work.md`](file:///C:/Developing/firstmate/projects/Learning-Management-System/Completed_Work.md)
- [`Complete_Plan.md`](file:///C:/Developing/firstmate/projects/Learning-Management-System/Complete_Plan.md)
- [`Next_Steps.md`](file:///C:/Developing/firstmate/projects/Learning-Management-System/Next_Steps.md)
