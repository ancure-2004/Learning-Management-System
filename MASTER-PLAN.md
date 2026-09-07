# LMS Refactor & Build - Master Plan (v2)

> **Status:** Approved via grill-me session - 2026-09-06
> **Target Customer:** Galgotias (GCET + Galgotias University), ~25,000 students
> **Pitch Strategy:** Full-vision demo - complete platform with AI + Communication before pitch
> **Revised from:** v1 (added Phase 5.5 Communication + Phase 5.6 AI Integration)

---

## Decisions Register

| # | Decision | Choice |
|---|---|---|
| 1 | **Target customer** | Galgotias College of Engineering & Technology (GCET, AKTU-affiliated) + Galgotias University (autonomous). ~25,000 students combined. Replacing fragmented existing tools. |
| 2 | **Institution model** | Two fully independent tenants with separate data, separate admins, shared Super Admin panel. Fee payment is an external integration, not cross-tenant data. |
| 3 | **Feature gating** | None. Full platform for every institution. Admins self-select what to use. |
| 4 | **Teacher model** | Merge `Teacher` collection into `User`. A teacher is `User { role: 'teacher' }`. Add `primaryDepartment` as ObjectId ref. `ClassSubject` assignments handle cross-department teaching naturally. |
| 5 | **Electives** | Fixed class-level subject lists for now. Elective groups deferred. |
| 6 | **Enrollment model** | Dedicated `Enrollment` collection with status lifecycle. `Class.studentCount` becomes virtual. Remove loose `program/semester/section` strings from User. |
| 7 | **Onboarding** | Admin-initiated invite flow. CSV bulk import. Email-based invites with 72-hour TTL. No public self-registration. |
| 8 | **Super Admin role** | New `superadmin` role, `institutionId: null`. Impersonation capability with audit logging. |
| 9 | **Institution model fields** | `name`, `code`, `type`, `affiliatedTo`, `address`, `contactEmail`, `contactPhone`, `logo`, `academicYearFormat`, `isActive`, `createdBy`, timestamps. |
| 10 | **Data migration** | Clean-break. No real data exists. New seed script for new schema. |
| 11 | **Frontend strategy** | Backend-led refactor. Incremental frontend updates. New Super Admin portal. |
| 12 | **Security hotfix** | Ship immediately as standalone commit. |
| 13 | **Academic year model** | Per-institution `AcademicYear` with embedded semester array. Enrollment links to it. |
| 14 | **Database** | Stay with MongoDB. Proper indexing handles 25K+ students and 10+ institutions. |
| 15 | **Solver multi-tenancy** | Solver unchanged. Backend pre-queries filter by `institutionId`. |
| 16 | **Tenant isolation** | Mongoose middleware (query hooks) auto-inject `institutionId`. Global plugin on all tenant-scoped models. |
| 17 | **JWT design** | Payload: `{ userId, institutionId, role }`. 7-day expiry. Refresh tokens deferred. |
| 18 | **Invite delivery** | Email-based via Resend/SendGrid free tier. |
| 19 | **Hosting** | Develop locally ($0). VPS ($6-12/month) only when demo-ready. |
| 20 | **Demo scope** | Full-vision: all features + AI + communication before pitch. |
| 21 | **Chat architecture** | All 6 channel types (class, subject, department, DM, institution broadcast, teacher-to-class). WhatsApp coexistence via Business API for notifications. |
| 22 | **Video meetings** | Google Meet/Zoom API integration first. Native WebRTC deferred to post-pitch upgrade. |
| 23 | **AI scope** | Full suite: RAG assistant, document parser, study assistant, agentic AI (operates entire app), adaptive scheduling, predictive analytics, auto-grading, exam schedule generation. |

---

## Target Schema (Post-Refactor)

### New Models - Foundation (Phases 1-2)

```
Institution {
  name: String (required)
  code: String (required, unique, uppercase)      // e.g. 'GCET', 'GU'
  type: String (enum: 'affiliated', 'autonomous')
  affiliatedTo: String (optional)                 // e.g. 'AKTU'
  address: String
  contactEmail: String
  contactPhone: String
  logo: String (URL)
  academicYearFormat: String                      // e.g. '2025-26'
  isActive: Boolean (default: true)
  createdBy: ObjectId -> User (superadmin)
  timestamps
}

AcademicYear {
  institution: ObjectId -> Institution (required)
  name: String (required)                         // e.g. '2025-26'
  startDate: Date (required)
  endDate: Date (required)
  semesters: [{
    name: String                                  // e.g. 'Odd Semester'
    startDate: Date
    endDate: Date
  }]
  isCurrent: Boolean (default: false)
  timestamps
}

Enrollment {
  institution: ObjectId -> Institution (required)
  student: ObjectId -> User (required)
  class: ObjectId -> Class (required)
  academicYear: ObjectId -> AcademicYear (required)
  status: String (enum: 'active', 'completed', 'withdrawn', 'transferred')
  enrolledAt: Date (default: now)
  timestamps
  index: { student, class, academicYear } unique
}

Invite {
  institution: ObjectId -> Institution (required)
  email: String (required)
  role: String (enum: 'admin', 'teacher', 'student')
  class: ObjectId -> Class (optional, for students)
  department: ObjectId -> Department (optional, for teachers)
  token: String (required, unique, hashed)
  expiresAt: Date (required, default: now + 72h)
  status: String (enum: 'pending', 'accepted', 'expired')
  invitedBy: ObjectId -> User (required)
  timestamps
}
```

### New Models - Core LMS Features (Phase 5)

```
Course {
  institution: ObjectId -> Institution
  classSubject: ObjectId -> ClassSubject
  title: String
  description: String
  modules: [{
    title: String
    order: Number
  }]
  createdBy: ObjectId -> User (teacher)
  timestamps
}

Lesson {
  institution: ObjectId -> Institution
  course: ObjectId -> Course
  module: String (module title reference)
  title: String
  type: String (enum: 'video', 'pdf', 'link', 'text', 'file')
  content: String (text content or URL)
  attachments: [{ filename, url, mimeType, size }]
  order: Number
  timestamps
}

Assignment {
  institution: ObjectId -> Institution
  classSubject: ObjectId -> ClassSubject
  title: String
  description: String
  dueDate: Date
  maxMarks: Number
  attachments: [{ filename, url, mimeType }]
  acceptLate: Boolean (default: false)
  createdBy: ObjectId -> User
  timestamps
}

Submission {
  institution: ObjectId -> Institution
  assignment: ObjectId -> Assignment
  student: ObjectId -> User
  files: [{ filename, url, mimeType, size }]
  submittedAt: Date
  isLate: Boolean
  grade: Number
  feedback: String
  aiFeedback: String             // AI auto-grading feedback (Phase 5.6)
  gradedBy: ObjectId -> User
  gradedAt: Date
  timestamps
}

Quiz {
  institution: ObjectId -> Institution
  classSubject: ObjectId -> ClassSubject
  title: String
  description: String
  duration: Number (minutes)
  startTime: Date (optional, scheduled)
  endTime: Date (optional, deadline)
  maxAttempts: Number (default: 1)
  questions: [{
    text: String
    type: String (enum: 'mcq', 'true-false', 'short-answer', 'descriptive')
    options: [String] (for MCQ)
    correctAnswer: Mixed
    marks: Number
    explanation: String
  }]
  isAIGenerated: Boolean (default: false)   // Phase 5.6
  sourceContent: ObjectId -> Course          // if AI-generated from course material
  createdBy: ObjectId -> User
  timestamps
}

QuizAttempt {
  institution: ObjectId -> Institution
  quiz: ObjectId -> Quiz
  student: ObjectId -> User
  answers: [{
    questionIndex: Number
    answer: Mixed
    isCorrect: Boolean
    marksAwarded: Number
    aiGradingReason: String      // For subjective AI grading (Phase 5.6)
  }]
  totalScore: Number
  maxScore: Number
  startedAt: Date
  submittedAt: Date
  timestamps
}

Grade {
  institution: ObjectId -> Institution
  student: ObjectId -> User
  classSubject: ObjectId -> ClassSubject
  academicYear: ObjectId -> AcademicYear
  assessments: [{
    type: String (enum: 'assignment', 'quiz', 'midterm', 'final', 'practical', 'internal')
    name: String
    marks: Number
    maxMarks: Number
    weight: Number (percentage weight)
  }]
  totalMarks: Number
  percentage: Number
  gradePoint: Number
  gradeLetter: String
  timestamps
}

Fee {
  institution: ObjectId -> Institution
  student: ObjectId -> User
  academicYear: ObjectId -> AcademicYear
  category: String (enum: 'tuition', 'hostel', 'exam', 'library', 'other')
  description: String
  amount: Number
  dueDate: Date
  status: String (enum: 'pending', 'partial', 'paid', 'overdue', 'waived')
  timestamps
}

Payment {
  institution: ObjectId -> Institution
  fee: ObjectId -> Fee
  student: ObjectId -> User
  amount: Number
  paymentMethod: String (enum: 'razorpay', 'bank_transfer', 'cash', 'other')
  transactionId: String
  razorpayOrderId: String
  razorpayPaymentId: String
  paidAt: Date
  status: String (enum: 'pending', 'completed', 'failed', 'refunded')
  timestamps
}
```

### New Models - Communication (Phase 5.5)

```
ChatChannel {
  institution: ObjectId -> Institution
  name: String
  type: String (enum: 'class', 'subject', 'department', 'direct', 'broadcast', 'teacher-broadcast')
  // Polymorphic scope references:
  class: ObjectId -> Class (for type: 'class')
  classSubject: ObjectId -> ClassSubject (for type: 'subject')
  department: ObjectId -> Department (for type: 'department')
  participants: [ObjectId -> User] (for type: 'direct' / DMs)
  owner: ObjectId -> User (channel creator / broadcast sender)
  isReadOnly: Boolean (default: false, true for broadcast channels)
  timestamps
  index: { institution, type, class/classSubject/department } for lookup
}

Message {
  institution: ObjectId -> Institution
  channel: ObjectId -> ChatChannel
  sender: ObjectId -> User
  content: String
  type: String (enum: 'text', 'file', 'image', 'system')
  attachments: [{ filename, url, mimeType, size }]
  replyTo: ObjectId -> Message (optional, threaded replies)
  readBy: [{ user: ObjectId, readAt: Date }]
  isEdited: Boolean (default: false)
  isDeleted: Boolean (default: false, soft delete)
  timestamps
  index: { channel, createdAt } for pagination
}

Meeting {
  institution: ObjectId -> Institution
  title: String
  description: String
  host: ObjectId -> User
  class: ObjectId -> Class (optional)
  classSubject: ObjectId -> ClassSubject (optional)
  scheduledAt: Date
  duration: Number (minutes)
  provider: String (enum: 'google-meet', 'zoom')
  meetingLink: String
  meetingId: String (external provider ID)
  recordingUrl: String (optional, post-meeting)
  status: String (enum: 'scheduled', 'live', 'ended', 'cancelled')
  attendees: [{ user: ObjectId, joinedAt: Date, leftAt: Date }]
  timestamps
}
```

### New Models - AI Integration (Phase 5.6)

```
DocumentVector {
  institution: ObjectId -> Institution
  sourceType: String (enum: 'lesson', 'syllabus', 'notice', 'assignment')
  sourceId: ObjectId (polymorphic ref to source document)
  chunkIndex: Number
  chunkText: String
  embedding: [Number] (vector, 768 or 1536 dimensions)
  metadata: {
    courseTitle: String
    lessonTitle: String
    classSubject: ObjectId
  }
  timestamps
  index: { institution, sourceType, sourceId }
  // Vector search index on embedding field (MongoDB Atlas Search or separate vector DB)
}

AIConversation {
  institution: ObjectId -> Institution
  user: ObjectId -> User
  type: String (enum: 'course-assistant', 'study-helper', 'admin-agent', 'general')
  messages: [{
    role: String (enum: 'user', 'assistant', 'system', 'tool')
    content: String
    toolCalls: [{                // For agentic AI
      toolName: String
      arguments: Mixed
      result: Mixed
    }]
    sources: [{                  // RAG citation sources
      lessonTitle: String
      courseTitle: String
      chunkText: String
      similarity: Number
    }]
    timestamp: Date
  }]
  timestamps
}

ScheduleAnalysis {
  institution: ObjectId -> Institution
  classSubject: ObjectId -> ClassSubject
  academicYear: ObjectId -> AcademicYear
  totalPlannedSessions: Number
  completedSessions: Number
  progressPercentage: Number
  paceStatus: String (enum: 'ahead', 'on-track', 'behind', 'critical')
  recommendedAdditionalLectures: Number
  analysisDate: Date
  dataPoints: [{                 // Historical session data for trend analysis
    date: Date
    topicsCovered: Number
    cumulativeProgress: Number
  }]
  timestamps
}

ParsedDocument {
  institution: ObjectId -> Institution
  originalFile: { filename, url, mimeType, size }
  parsedBy: ObjectId -> User (who uploaded)
  extractedData: {
    type: String (enum: 'exam-schedule', 'holiday-list', 'fee-circular', 'general-notice')
    events: [{
      title: String
      date: Date
      endDate: Date (optional)
      description: String
      targetAudience: String
    }]
    rawText: String
  }
  status: String (enum: 'processing', 'parsed', 'reviewed', 'applied')
  appliedTo: [{                   // Which system records were created from this
    model: String                 // e.g. 'Calendar', 'Assignment', 'Fee'
    recordId: ObjectId
  }]
  timestamps
}
```

### Modified Models (from v1 - unchanged)

```
User: + institutionId, + superadmin role, + primaryDepartment, + status enum,
      - department string, - program, - semester, - section, - isActive

Class: + institution, - studentCount (virtual)
Department: + institution
Program: + institution
Subject: + institution
Classroom: + institution
ClassSubject: + institution, teacher now refs User (not Teacher)
Timetable: + institution
Attendance: + institution
Calendar, Notification, Leave, Progress, Syllabus, Rating, Report: + institution

Teacher model: DELETED (merged into User)
```

---

## Build Phases

### Phase 0 - Security Hotfix (Day 1, ~2 hours)

- [ ] Lock `POST /auth/register` behind `verifyToken` + `authorize('admin')`
- [ ] Remove `.passthrough()` from all Zod schemas, replace with `.strict()`
- [ ] Strip `role` from register request body
- [ ] Commit and push as standalone fix

### Phase 1a - Teacher Model Merge (~2-3 days)

- [ ] Delete `Teacher` model
- [ ] Add `primaryDepartment: ObjectId -> Department` to User model
- [ ] Write migration-seed script creating teachers as User documents
- [ ] Update `ClassSubject.teacher` to reference `User` instead of `Teacher`
- [ ] Update all services: `teacher.service.js`, `classSubject.service.js`, `timetable.service.js`, `solver.service.js`
- [ ] Update all controllers and routes
- [ ] Update frontend `teacherService.js` and teacher-related pages
- [ ] Verify timetable solver payload works with User-based teacher refs

### Phase 1b - Institution Model & Tenant Scoping (~1 week)

- [ ] Create `Institution` model
- [ ] Create Mongoose tenant-scoping plugin (auto-inject `institutionId` on queries)
- [ ] Apply tenant plugin to all existing models
- [ ] Add `superadmin` to User role enum
- [ ] Add `institutionId` (nullable for superadmin) to User model
- [ ] Update `generateToken` to include `{ userId, institutionId, role }`
- [ ] Update `verifyToken` middleware: attach `req.institutionId`, set up AsyncLocalStorage context
- [ ] Create superadmin routes: CRUD for institutions
- [ ] Create superadmin impersonation: `POST /superadmin/impersonate/:institutionId` with audit log
- [ ] Update seed script: superadmin + two institutions (GCET, GU) + first admins
- [ ] Add compound indexes: `{ institution, <query field> }` on every tenant-scoped model
- [ ] Build Super Admin frontend portal (layout, institution management)

### Phase 1c - Invite-Based Onboarding (~3-4 days)

- [ ] Create `Invite` model
- [ ] `POST /auth/invite` (single invite + email)
- [ ] `POST /auth/invite/bulk` (CSV upload: email, role, class/department)
- [ ] `GET /auth/invite/accept/:token` (validate, show set-password form)
- [ ] `POST /auth/invite/accept/:token` (set password, activate, create enrollment)
- [ ] Integrate transactional email (Resend free tier)
- [ ] Admin UI: invite list, resend, revoke
- [ ] Remove old public `/auth/register` entirely

### Phase 2 - Enrollment Model (~3-4 days)

- [ ] Create `AcademicYear` model
- [ ] Create `Enrollment` model
- [ ] Virtual `studentCount` on Class (from active Enrollment count)
- [ ] Remove `program`, `semester`, `section` from User
- [ ] Invite-accept auto-creates Enrollment for students
- [ ] Admin UI: enrollment management, roster views
- [ ] Semester rollover tool (bulk complete + bulk create)
- [ ] AcademicYear admin UI
- [ ] Updated seed script

### Phase 3 - Rewire Dependent Features (~3-4 days)

- [ ] Attendance: fetch roster from Enrollment
- [ ] Progress/Syllabus: verify institution scoping
- [ ] Ratings: use Enrollment-backed class membership
- [ ] Timetable views: derive from Enrollment -> Class -> Timetable
- [ ] Leave management: scope to institution
- [ ] Reports: Enrollment-based counts
- [ ] Notifications: scope Socket.IO rooms by institution
- [ ] Full regression test of all 17 domain modules

### Phase 4 - Timetable Engine Improvements (~1 week)

- [ ] Teacher preference weighting (preferred slots, max consecutive hours)
- [ ] Timetable version history with snapshot and one-click restore
- [ ] Improved conflict visualization on frontend
- [ ] Per-institution solver config (time slot defs, working days, break periods)
- [ ] Performance optimization for large institutions

### Phase 5 - Core LMS Features (~3-4 weeks)

#### 5a - Course Content / Study Material (~1 week)
- [ ] `Course` and `Lesson` models
- [ ] File upload infrastructure (S3/Cloudinary)
- [ ] Teacher UI: create courses, upload materials, organize modules/lessons
- [ ] Student UI: browse courses, view/download materials
- [ ] Auto-index uploaded content for RAG (prepare vector pipeline hooks)

#### 5b - Assignments & Submissions (~1 week)
- [ ] `Assignment` and `Submission` models
- [ ] Teacher UI: create assignments, view submissions, grade with feedback
- [ ] Student UI: view assignments, upload submissions, see grades
- [ ] Late submission handling with penalty flag
- [ ] File upload for submissions

#### 5c - Quizzes & Exams (~1 week)
- [ ] `Quiz` and `QuizAttempt` models
- [ ] Question types: MCQ, true/false, short answer, descriptive
- [ ] Auto-grading for MCQ and true/false
- [ ] Teacher UI: create quizzes, view results, analytics
- [ ] Student UI: take timed quiz, view results
- [ ] Hooks for AI-generated quizzes (Phase 5.6)

#### 5d - Gradebook & Results (~3-4 days)
- [ ] `Grade` model with configurable grading scale per institution
- [ ] GPA/CGPA calculation engine
- [ ] Teacher UI: enter marks, view class performance
- [ ] Student UI: view grades, GPA, semester-wise results
- [ ] Admin UI: publish/unpublish results, generate transcripts

#### 5e - Fee Payment Integration (~3-4 days)
- [ ] `Fee` and `Payment` models
- [ ] Razorpay payment gateway integration (test mode)
- [ ] Student UI: view dues, make payment, download receipts
- [ ] Admin UI: define fee structures, payment status, fee reports

#### 5f - Notices & Announcements (~1-2 days)
- [ ] Extend notification system with announcement types (institution/department/class-wide)
- [ ] Rich text announcements with file attachments
- [ ] Announcement board UI per portal
- [ ] Hooks for AI notice parsing (Phase 5.6)

---

### Phase 5.5 - Communication System (~2 weeks)

#### 5.5a - Real-Time Chat (~1 week)

**Backend:**
- [ ] `ChatChannel` and `Message` models
- [ ] Auto-create channels when classes/subjects/departments are created
- [ ] Socket.IO chat rooms scoped by institution + channel
- [ ] Chat API: send message, edit, delete (soft), reply, mark read
- [ ] File/image sharing in chat (reuse file upload infra from Phase 5a)
- [ ] Unread count tracking per user per channel
- [ ] Message pagination (cursor-based, most recent first)
- [ ] DM creation: student-to-student, student-to-teacher (within same institution)
- [ ] Broadcast channels: institution-wide (admin-only send), teacher-to-class (teacher-only send)

**Frontend:**
- [ ] Chat sidebar component (channel list, unread badges, search)
- [ ] Chat view (message thread, reply, attachments, emoji)
- [ ] Integrated into Admin, Teacher, and Student layouts
- [ ] Real-time message delivery via existing Socket.IO infrastructure
- [ ] Notification toast for new DMs

#### 5.5b - Meeting Integration (~3-4 days)

**Backend:**
- [ ] `Meeting` model
- [ ] Google Meet API integration (create meeting, get join link)
  - OAuth2 service account or user-delegated auth
  - `POST /meetings` - create meeting for class/subject
  - `GET /meetings` - list scheduled/past meetings
- [ ] Zoom API integration as fallback (create meeting, get join link)
- [ ] Meeting scheduling (teacher schedules future meeting, students see it in calendar)
- [ ] Post-meeting: store recording URL if available

**Frontend:**
- [ ] Teacher: "Start Live Class" button on class view -> creates Google Meet, shares link
- [ ] Teacher: schedule future meetings with title, time, description
- [ ] Student: meeting list with join links, upcoming meeting reminders
- [ ] Calendar integration: meetings appear on academic calendar

#### 5.5c - WhatsApp Notifications (~2-3 days)

- [ ] WhatsApp Business API integration (via official API or provider like Twilio/Gupshup)
- [ ] Notification templates: assignment due, attendance alert, meeting reminder, fee due, grade published
- [ ] User preference: opt-in/opt-out WhatsApp notifications
- [ ] Phone number collection during invite acceptance
- [ ] Rate-limited sending (respect WhatsApp API quotas)

---

### Phase 5.6 - AI Integration (~4-5 weeks)

#### 5.6a - AI Infrastructure (~3-4 days)

- [ ] LLM API integration (Gemini API via `@google/generative-ai` SDK)
- [ ] Vector database setup for RAG:
  - Option A: MongoDB Atlas Vector Search (keeps everything in one DB)
  - Option B: Dedicated vector DB (Pinecone/Qdrant/ChromaDB)
- [ ] Embedding pipeline: process uploaded content -> chunk -> embed -> store
  - Text extraction from PDFs (pdf-parse)
  - Chunking strategy (512-token chunks with 64-token overlap)
  - Embedding model (Gemini text-embedding or OpenAI ada-002)
- [ ] AI rate limiting and cost tracking per institution
- [ ] `AIConversation` model for chat history persistence

#### 5.6b - RAG Course Assistant (~1 week)

- [ ] Automatic vectorization when lessons/course content is created/updated (hook from Phase 5a)
- [ ] Similarity search: student question -> find top-K relevant chunks -> feed to LLM
- [ ] Citation system: AI responses include source references (which lesson, which page)
- [ ] Conversation memory: multi-turn chat with context window management
- [ ] Scope enforcement: student can only query content from their enrolled courses
- [ ] Frontend: AI chat widget accessible from student portal
  - Chat interface with markdown rendering
  - Source citations as clickable links to lesson content
  - "Ask about this lesson" button on lesson pages

#### 5.6c - AI Document / Notice Parser (~3-4 days)

- [ ] `ParsedDocument` model
- [ ] PDF upload -> text extraction -> LLM structured parsing
- [ ] Supported document types:
  - Exam schedule -> Calendar events + Quiz due dates
  - Holiday list -> Calendar holidays
  - Fee circular -> Fee records with amounts and due dates
  - General notice -> Announcement with metadata
- [ ] Admin review UI: show extracted data, allow corrections before applying
- [ ] "Apply to system" action: create Calendar/Fee/Assignment records from parsed data
- [ ] Frontend: drag-and-drop document upload with extraction preview

#### 5.6d - AI Study Assistant (~4-5 days)

- [ ] Auto-generate quizzes from course content:
  - Teacher selects a lesson/module -> AI generates MCQ, true/false, short answer questions
  - Teacher reviews and edits before publishing
  - Questions saved as regular Quiz documents (reuses Phase 5c infrastructure)
- [ ] Auto-generate summaries:
  - Per-lesson summaries, per-module summaries
  - Student-facing "Key Points" section on lesson pages
- [ ] Flashcard generation:
  - AI extracts key terms and definitions from content
  - Simple flashcard UI with flip animation
  - Spaced repetition tracking (optional)

#### 5.6e - Agentic AI Assistant (~2-3 weeks)

> The core differentiator. An AI agent that can operate the entire LMS on behalf of the user.

**Infrastructure:**
- [ ] Function calling / tool-use framework:
  - Define LMS tools: `get_schedule`, `mark_attendance`, `create_assignment`, `check_room_availability`, `schedule_class`, `get_student_grades`, `get_attendance_report`, `create_announcement`, `get_fee_status`, etc.
  - Each tool maps to an existing service method with permission checks
  - Tool definitions include parameter schemas and descriptions
- [ ] Permission-aware tool execution:
  - Agent inherits the user's role and institutionId
  - Admin agent has access to admin tools
  - Teacher agent has access to teacher tools
  - Student agent has access to student tools (read-only for most)
- [ ] Safety guardrails:
  - Confirmation prompts for destructive/write actions ("I'll create a makeup class for CS-3A on Monday at 10am. Confirm?")
  - No test-taking on behalf of students (hard block)
  - Audit log of all agent-executed actions
  - Rate limiting on agent actions per user

**Capabilities by role:**

*Admin Agent:*
- [ ] "Schedule a makeup class for CS-3A next week" -> checks room/teacher availability, proposes slot, creates on confirmation
- [ ] "Show me which subjects are behind schedule" -> queries ScheduleAnalysis, returns formatted report
- [ ] "Create a fee circular for odd semester 2026" -> creates Fee records for all enrolled students
- [ ] "How many students have attendance below 75%?" -> queries attendance, returns list
- [ ] "Generate the exam schedule for final exams" -> AI creates exam timetable considering room capacity and no student conflicts

*Teacher Agent:*
- [ ] "What's my schedule tomorrow?" -> queries timetable
- [ ] "Mark today's DSA class as completed, we covered Binary Trees" -> logs progress
- [ ] "Create an assignment for my CS-3A class, due next Friday" -> creates Assignment
- [ ] "How is my syllabus progress compared to the calendar?" -> queries ScheduleAnalysis
- [ ] "Generate a quiz on Chapter 3" -> creates quiz from course content (5.6d)

*Student Agent:*
- [ ] "What classes do I have tomorrow?" -> queries enrolled timetable
- [ ] "What's my attendance in DSA?" -> queries attendance
- [ ] "When is the next assignment due?" -> queries assignments
- [ ] "Explain the concept of B+ Trees from my notes" -> RAG query (5.6b)
- [ ] "What are my current grades?" -> queries gradebook

**Frontend:**
- [ ] Persistent AI chat panel (slide-out from right side, available on every page)
- [ ] Natural language input with streaming LLM response
- [ ] Action cards for confirmable operations (with Confirm/Cancel buttons)
- [ ] Tool execution indicators ("Checking room availability...")
- [ ] Conversation history (persisted in AIConversation model)

#### 5.6f - Adaptive Scheduling & Analytics (~1-1.5 weeks)

**Adaptive Scheduling (enhances existing timetable solver):**
- [ ] `ScheduleAnalysis` model
- [ ] After each teaching session is logged (Progress model), analyze:
  - Current pace vs planned pace (sessions completed / total planned)
  - Days remaining in semester vs topics remaining
  - Historical velocity (topics per session average)
- [ ] Pace classification: `ahead`, `on-track`, `behind`, `critical`
- [ ] When generating next week's timetable:
  - Query all ScheduleAnalysis for the class
  - Subjects marked `behind` or `critical` get priority: solver receives higher weekly lecture targets
  - Subjects marked `ahead` can have lectures reduced
  - Feed adjusted targets to the OR-Tools solver as modified constraints
- [ ] Dashboard visualization: pace chart per subject over time (Recharts)

**Predictive At-Risk Student Alerts:**
- [ ] Multi-signal risk scoring:
  - Attendance percentage (below 75% = high weight)
  - Assignment submission rate (missing submissions = high weight)
  - Quiz scores trend (declining = medium weight)
  - Engagement metrics (login frequency, content views = low weight)
- [ ] Risk levels: `low`, `medium`, `high`, `critical`
- [ ] Auto-generated alerts:
  - Student notification: "Your attendance in DSA is at 68%. You need 4 more present days to reach 75%."
  - Teacher notification: "3 students in your CS-3A DSA class are at risk of attendance shortage."
  - Admin dashboard: at-risk student report per class/department
- [ ] Trend analysis: weekly risk score recalculation

**AI Exam Schedule Generation:**
- [ ] Input: list of subjects, available rooms with capacities, date range, rules (no student takes 2 exams same day, minimum gap between exams)
- [ ] Uses the existing OR-Tools solver with exam-specific constraints
- [ ] AI pre-processes constraints from natural language or parsed exam circular (5.6c)
- [ ] Output: exam timetable grid, exportable as PDF

**AI Auto-Grading for Subjective Answers:**
- [ ] For `short-answer` and `descriptive` quiz questions:
  - Compare student answer against model answer + course content (RAG-enhanced)
  - LLM evaluates: relevance, accuracy, completeness
  - Assigns marks with written reasoning
- [ ] Teacher review: AI grade shown as suggestion, teacher can accept/modify
- [ ] Rubric support: teacher defines grading criteria, AI follows them
- [ ] Batch grading: grade all submissions for a question at once

---

### Phase 6 - Production Readiness (~1 week)

> Always the last phase. Everything above must be feature-complete before this.

- [ ] Docker Compose: Frontend + Backend + Solver + MongoDB + Redis (for Socket.IO scaling) in one stack
- [ ] Environment configuration for production (secrets, CORS, rate limiting, LLM API keys)
- [ ] Comprehensive seed script: two institutions with full demo data
  - Galgotias-realistic: actual department names (CSE, ECE, ME, EE, CE, IT), programs (B.Tech, BCA, MCA), Indian student/teacher names
  - Sample timetables, attendance records, course content, assignments, grades
  - Pre-populated chat channels with demo messages
  - Sample AI conversations
- [ ] Basic CI: ESLint + build validation on push
- [ ] Load testing: 25K simulated users (k6 or Artillery)
  - Focus: attendance marking, timetable views, chat message sending, AI assistant queries
- [ ] Security audit: rate limiting, input sanitization, CORS lockdown, LLM prompt injection prevention
- [ ] Monitoring: health check endpoints, error logging, AI cost tracking dashboard
- [ ] Deploy to VPS with Docker Compose

---

## Revised Timeline

| Phase | Scope | Duration |
|---|---|---|
| Phase 0 | Security hotfix | Day 1 (2 hours) |
| Phase 1a | Teacher merge | 2-3 days |
| Phase 1b | Institution + tenant scoping | 5-7 days |
| Phase 1c | Invite onboarding | 3-4 days |
| Phase 2 | Enrollment model | 3-4 days |
| Phase 3 | Rewire existing features | 3-4 days |
| Phase 4 | Timetable improvements | 5-7 days |
| Phase 5a | Course content | 5-7 days |
| Phase 5b | Assignments | 5-7 days |
| Phase 5c | Quizzes | 5-7 days |
| Phase 5d | Gradebook | 3-4 days |
| Phase 5e | Fee payment | 3-4 days |
| Phase 5f | Notices | 1-2 days |
| Phase 5.5a | Real-time chat | 5-7 days |
| Phase 5.5b | Meeting integration | 3-4 days |
| Phase 5.5c | WhatsApp notifications | 2-3 days |
| Phase 5.6a | AI infrastructure | 3-4 days |
| Phase 5.6b | RAG course assistant | 5-7 days |
| Phase 5.6c | AI document parser | 3-4 days |
| Phase 5.6d | AI study assistant | 4-5 days |
| Phase 5.6e | Agentic AI assistant | 10-15 days |
| Phase 5.6f | Adaptive scheduling + analytics | 5-7 days |
| Phase 6 | Production readiness | 5-7 days |
| **Total** | | **~16-18 weeks** |

---

## Infrastructure Requirements

| Component | Dev (free) | Production |
|---|---|---|
| MongoDB | Local Docker or Atlas free tier | Atlas M10+ or self-hosted |
| Vector DB | ChromaDB local (in-process) | MongoDB Atlas Vector Search or Pinecone |
| LLM API | Gemini API (free tier: 15 RPM) | Gemini API (paid: $0.075/1M input tokens) |
| Email | Resend free (100/day) | Resend Pro or SendGrid |
| File Storage | Local filesystem | S3 / Cloudinary |
| WhatsApp | Sandbox/test mode | WhatsApp Business API (via Gupshup/Twilio) |
| Meeting API | Google Meet API (free with Workspace) | Same |
| Hosting | localhost | VPS 4-8 vCPU, 16GB RAM ($20-50/month) |

---

## Risks

| Risk | Mitigation |
|---|---|
| Scope is large (~16-18 weeks) | Strict phase sequencing. Each phase is independently testable and demo-able. |
| LLM API costs at 25K users | Rate limiting per user. Cache common queries. Use Gemini Flash for simple tasks, Pro for complex. Monitor costs per institution. |
| Prompt injection in agentic AI | Input sanitization. System prompts with strict role boundaries. Tool-level permission checks (not just prompt-level). |
| WhatsApp Business API approval | Start the Meta business verification process early (can take 2-4 weeks). Use sandbox mode during development. |
| Razorpay KYC for payments | Start account setup and KYC early. Use test mode during development. |
| AI auto-grading accuracy | Always present AI grades as suggestions, not finals. Teacher review required. Show confidence scores. |
| Chat scalability with Socket.IO at 25K users | Redis adapter for Socket.IO (horizontal scaling). Message pagination. Lazy-load old messages. |
| Google Meet API quotas | Monitor usage. Implement meeting scheduling to avoid burst creation. |
