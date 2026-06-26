/**
 * Demo / offline mock data — mirrors the backend seed (Backend/seed.js).
 * ─────────────────────────────────────────────────────────────────────────
 * When the backend is unreachable (secured facility with no MongoDB Atlas
 * access), the api client (api/client.js) falls back to this data so the whole
 * frontend stays explorable with rich, realistic, internally-consistent data.
 *
 * `getMock(method, url, config)` returns the response BODY for a known
 * endpoint, or `undefined` if there's no mock (caller then rejects normally).
 * ─────────────────────────────────────────────────────────────────────────
 */

const DEMO_USER_KEY = 'demo_user';

/* ── Departments ────────────────────────────────────────────────────────── */
const departments = [
  { _id: 'dept_CSE', name: 'Computer Science & Engineering', code: 'CSE', description: 'Department of Computer Science and Engineering' },
  { _id: 'dept_ECE', name: 'Electronics & Communication Engineering', code: 'ECE', description: 'Department of Electronics and Communication' },
  { _id: 'dept_ME', name: 'Mechanical Engineering', code: 'ME', description: 'Department of Mechanical Engineering' },
  { _id: 'dept_MATH', name: 'Mathematics', code: 'MATH', description: 'Department of Mathematics' },
];
const deptByCode = Object.fromEntries(departments.map(d => [d.code, d]));

/* ── Programs ───────────────────────────────────────────────────────────── */
const programs = [
  { _id: 'prog_BTECH-CS', name: 'Bachelor of Technology in Computer Science', code: 'BTECH-CS', department: deptByCode.CSE, duration: 4, totalSemesters: 8 },
  { _id: 'prog_BTECH-ECE', name: 'Bachelor of Technology in Electronics', code: 'BTECH-ECE', department: deptByCode.ECE, duration: 4, totalSemesters: 8 },
  { _id: 'prog_BTECH-ME', name: 'Bachelor of Technology in Mechanical', code: 'BTECH-ME', department: deptByCode.ME, duration: 4, totalSemesters: 8 },
  { _id: 'prog_BCA', name: 'Bachelor of Computer Applications', code: 'BCA', department: deptByCode.CSE, duration: 3, totalSemesters: 6 },
  { _id: 'prog_MTECH-CS', name: 'Master of Technology in Computer Science', code: 'MTECH-CS', department: deptByCode.CSE, duration: 2, totalSemesters: 4 },
  { _id: 'prog_MTECH-AI', name: 'Master of Technology in AI & ML', code: 'MTECH-AI', department: deptByCode.CSE, duration: 2, totalSemesters: 4 },
];
const progByCode = Object.fromEntries(programs.map(p => [p.code, p]));

/* ── Subjects ───────────────────────────────────────────────────────────── */
const subjectsData = [
  ['Data Structures and Algorithms', 'CS301', 4, 'theory', 4, 'CSE'],
  ['Database Management Systems', 'CS302', 4, 'theory', 4, 'CSE'],
  ['Operating Systems', 'CS303', 3, 'theory', 3, 'CSE'],
  ['Computer Networks', 'CS304', 3, 'theory', 3, 'CSE'],
  ['Software Engineering', 'CS305', 3, 'theory', 3, 'CSE'],
  ['Web Technologies', 'CS306', 4, 'theory', 4, 'CSE'],
  ['Artificial Intelligence', 'CS401', 3, 'theory', 3, 'CSE'],
  ['Machine Learning', 'CS402', 4, 'theory', 4, 'CSE'],
  ['Cloud Computing', 'CS403', 3, 'theory', 3, 'CSE'],
  ['Compiler Design', 'CS404', 3, 'theory', 3, 'CSE'],
  ['Data Structures Lab', 'CS301L', 2, 'lab', 1, 'CSE'],
  ['Database Lab', 'CS302L', 2, 'lab', 1, 'CSE'],
  ['Operating Systems Lab', 'CS303L', 2, 'lab', 1, 'CSE'],
  ['Networks Lab', 'CS304L', 2, 'lab', 1, 'CSE'],
  ['Web Technologies Lab', 'CS306L', 2, 'lab', 1, 'CSE'],
  ['Discrete Mathematics', 'MA301', 3, 'theory', 3, 'MATH'],
  ['Linear Algebra', 'MA302', 3, 'theory', 3, 'MATH'],
  ['Probability and Statistics', 'MA303', 3, 'theory', 3, 'MATH'],
  ['Digital Electronics', 'EC301', 3, 'theory', 3, 'ECE'],
  ['Applied Physics', 'PH301', 2, 'theory', 2, 'MATH'],
  ['Technical Communication', 'EN301', 2, 'theory', 2, 'MATH'],
  ['Engineering Economics', 'MG301', 2, 'theory', 2, 'MATH'],
];
const subjects = subjectsData.map(([name, code, lpw, type, credits, dept]) => ({
  _id: 'subj_' + code, name, code, lectures_per_week: lpw, subjectType: type, credits, department: deptByCode[dept],
}));
const subjByCode = Object.fromEntries(subjects.map(s => [s.code, s]));

/* ── Teachers (index order matches the seed) ────────────────────────────── */
const teacherInfo = [
  ['Rajesh', 'Kumar', 'Computer Science', 'Data Structures & Algorithms'],
  ['Priya', 'Sharma', 'Computer Science', 'Database Management'],
  ['Amit', 'Verma', 'Computer Science', 'Operating Systems'],
  ['Neha', 'Singh', 'Computer Science', 'Computer Networks'],
  ['Vikram', 'Patel', 'Computer Science', 'Software Engineering'],
  ['Anita', 'Reddy', 'Computer Science', 'Web Development'],
  ['Sanjay', 'Gupta', 'Computer Science', 'Artificial Intelligence'],
  ['Meena', 'Iyer', 'Computer Science', 'Machine Learning'],
  ['Rahul', 'Joshi', 'Mathematics', 'Discrete Mathematics'],
  ['Kavita', 'Nair', 'Mathematics', 'Linear Algebra'],
  ['Suresh', 'Rao', 'Electronics', 'Digital Electronics'],
  ['Pooja', 'Mehta', 'Physics', 'Applied Physics'],
  ['Deepak', 'Shah', 'English', 'Technical Communication'],
  ['Sunita', 'Desai', 'Management', 'Engineering Economics'],
  ['Arun', 'Pillai', 'Computer Science', 'Cloud Computing'],
];
// Teacher USER accounts
const teacherUsers = teacherInfo.map(([fn, ln, dept, spec], i) => ({
  _id: 'tuser_' + i, firstName: fn, lastName: ln, email: `${fn.toLowerCase()}.${ln.toLowerCase()}@college.edu`,
  role: 'teacher', isActive: true, department: dept, specialization: spec,
}));
// Teacher RECORDS (what /teachers returns; matched by name elsewhere)
const teachers = teacherInfo.map(([fn, ln, dept, spec], i) => ({
  _id: 'trec_' + i, name: `${fn} ${ln}`, user: 'tuser_' + i, department: dept, specialization: spec,
}));
const teacherByName = Object.fromEntries(teachers.map(t => [t.name, t]));

/* ── Students (40) ──────────────────────────────────────────────────────── */
const studentNames = [
  ['Aarav', 'Sharma'], ['Vivaan', 'Kumar'], ['Aditya', 'Singh'], ['Vihaan', 'Patel'], ['Arjun', 'Gupta'],
  ['Sai', 'Reddy'], ['Arnav', 'Verma'], ['Ayaan', 'Joshi'], ['Krishna', 'Nair'], ['Ishaan', 'Iyer'],
  ['Ananya', 'Desai'], ['Diya', 'Mehta'], ['Aadhya', 'Shah'], ['Saanvi', 'Pillai'], ['Kiara', 'Rao'],
  ['Navya', 'Kulkarni'], ['Isha', 'Agarwal'], ['Myra', 'Bhatt'], ['Anika', 'Jain'], ['Sara', 'Mishra'],
  ['Rohan', 'Pandey'], ['Kabir', 'Thakur'], ['Reyansh', 'Malhotra'], ['Shivansh', 'Kapoor'], ['Rudra', 'Chopra'],
  ['Dhruv', 'Saxena'], ['Advait', 'Bansal'], ['Pranav', 'Sinha'], ['Om', 'Trivedi'], ['Shaurya', 'Dwivedi'],
  ['Riya', 'Arora'], ['Prisha', 'Bose'], ['Avni', 'Das'], ['Pari', 'Ghosh'], ['Aarohi', 'Chatterjee'],
  ['Shanaya', 'Mukherjee'], ['Tanvi', 'Sengupta'], ['Anvi', 'Roy'], ['Zara', 'Dutta'], ['Nitya', 'Ganguly'],
];
const progList = ['BTECH-CS', 'BTECH-ECE', 'BCA'];
const sectionList = ['A', 'B'];
const students = studentNames.map(([fn, ln], i) => ({
  _id: 'suser_' + i, firstName: fn, lastName: ln,
  email: `${fn.toLowerCase()}.${ln.toLowerCase()}@student.college.edu`,
  role: 'student', isActive: true,
  enrollmentNumber: `EN${2024001 + i}`,
  program: progList[i % progList.length],
  semester: (Math.floor(i / 10) % 4) + 3,
  section: sectionList[i % sectionList.length],
}));

const admin = { _id: 'admin_1', firstName: 'John', lastName: 'Administrator', email: 'admin@college.edu', role: 'admin', isActive: true };
const users = [admin, ...teacherUsers, ...students];
const userByEmail = Object.fromEntries(users.map(u => [u.email.toLowerCase(), u]));

/* ── Classrooms ─────────────────────────────────────────────────────────── */
const classroomsData = [
  ['Room 101', 60], ['Room 102', 60], ['Room 103', 60], ['Room 104', 60], ['Room 201', 60],
  ['Room 202', 60], ['Room 203', 60], ['Room 204', 60], ['Room 301', 80], ['Room 302', 80],
  ['Computer Lab 1', 30], ['Computer Lab 2', 30], ['Computer Lab 3', 30], ['Network Lab', 25], ['Electronics Lab', 25],
];
const classrooms = classroomsData.map(([name, capacity], i) => ({ _id: 'room_' + i, name, capacity }));
const roomByName = Object.fromEntries(classrooms.map(r => [r.name, r]));

/* ── Classes ────────────────────────────────────────────────────────────── */
const classesData = [
  ['B.Tech CS - Sem 3 - Section A', 'BTECH-CS-3A', 'BTECH-CS', 3, 'A', 'Room 101', 60],
  ['B.Tech CS - Sem 3 - Section B', 'BTECH-CS-3B', 'BTECH-CS', 3, 'B', 'Room 102', 60],
  ['B.Tech CS - Sem 4 - Section A', 'BTECH-CS-4A', 'BTECH-CS', 4, 'A', 'Room 103', 58],
  ['B.Tech CS - Sem 4 - Section B', 'BTECH-CS-4B', 'BTECH-CS', 4, 'B', 'Room 104', 58],
  ['B.Tech CS - Sem 5 - Section A', 'BTECH-CS-5A', 'BTECH-CS', 5, 'A', 'Room 201', 55],
  ['B.Tech ECE - Sem 3 - Section A', 'BTECH-ECE-3A', 'BTECH-ECE', 3, 'A', 'Room 202', 50],
  ['BCA - Sem 3', 'BCA-3', 'BCA', 3, 'A', 'Room 203', 40],
  ['BCA - Sem 4', 'BCA-4', 'BCA', 4, 'A', 'Room 204', 40],
  ['M.Tech CS - Sem 1', 'MTECH-CS-1', 'MTECH-CS', 1, 'A', 'Room 301', 30],
  ['M.Tech AI - Sem 1', 'MTECH-AI-1', 'MTECH-AI', 1, 'A', 'Room 302', 25],
];
const classes = classesData.map(([name, code, prog, sem, sec, room, count]) => ({
  _id: 'class_' + code, name, code, program: progByCode[prog], semester: sem, section: sec,
  assignedRoom: roomByName[room], studentCount: count,
}));
const classByCode = Object.fromEntries(classes.map(c => [c.code, c]));

/* ── Class-subject assignments ──────────────────────────────────────────── */
const assignmentsData = [
  ['BTECH-CS-3A', 'CS301', 'Rajesh Kumar'], ['BTECH-CS-3A', 'CS301L', 'Rajesh Kumar', 'Computer Lab 1'],
  ['BTECH-CS-3A', 'CS302', 'Priya Sharma'], ['BTECH-CS-3A', 'CS302L', 'Priya Sharma', 'Computer Lab 1'],
  ['BTECH-CS-3A', 'MA301', 'Rahul Joshi'], ['BTECH-CS-3A', 'EN301', 'Deepak Shah'],
  ['BTECH-CS-3B', 'CS301', 'Rajesh Kumar'], ['BTECH-CS-3B', 'CS301L', 'Anita Reddy', 'Computer Lab 2'],
  ['BTECH-CS-3B', 'CS302', 'Priya Sharma'], ['BTECH-CS-3B', 'CS302L', 'Vikram Patel', 'Computer Lab 2'],
  ['BTECH-CS-3B', 'MA301', 'Kavita Nair'], ['BTECH-CS-3B', 'EN301', 'Deepak Shah'],
  ['BTECH-CS-4A', 'CS303', 'Amit Verma'], ['BTECH-CS-4A', 'CS303L', 'Amit Verma', 'Computer Lab 1'],
  ['BTECH-CS-4A', 'CS304', 'Neha Singh'], ['BTECH-CS-4A', 'CS304L', 'Neha Singh', 'Network Lab'],
  ['BTECH-CS-4A', 'MA302', 'Kavita Nair'], ['BTECH-CS-4A', 'MG301', 'Sunita Desai'],
  ['BTECH-CS-4B', 'CS303', 'Amit Verma'], ['BTECH-CS-4B', 'CS303L', 'Vikram Patel', 'Computer Lab 2'],
  ['BTECH-CS-4B', 'CS304', 'Neha Singh'], ['BTECH-CS-4B', 'CS304L', 'Arun Pillai', 'Network Lab'],
  ['BTECH-CS-4B', 'MA302', 'Rahul Joshi'], ['BTECH-CS-4B', 'MG301', 'Sunita Desai'],
  ['BTECH-CS-5A', 'CS305', 'Vikram Patel'], ['BTECH-CS-5A', 'CS306', 'Anita Reddy'],
  ['BTECH-CS-5A', 'CS306L', 'Anita Reddy', 'Computer Lab 3'], ['BTECH-CS-5A', 'CS401', 'Sanjay Gupta'],
  ['BTECH-CS-5A', 'MA303', 'Kavita Nair'],
  ['BTECH-ECE-3A', 'EC301', 'Suresh Rao'], ['BTECH-ECE-3A', 'MA301', 'Rahul Joshi'],
  ['BTECH-ECE-3A', 'PH301', 'Pooja Mehta'], ['BTECH-ECE-3A', 'EN301', 'Deepak Shah'],
  ['BTECH-ECE-3A', 'CS302', 'Priya Sharma'],
  ['BCA-3', 'CS301', 'Rajesh Kumar'], ['BCA-3', 'CS301L', 'Anita Reddy', 'Computer Lab 3'],
  ['BCA-3', 'CS302', 'Priya Sharma'], ['BCA-3', 'CS302L', 'Priya Sharma', 'Computer Lab 3'],
  ['BCA-3', 'MA301', 'Rahul Joshi'],
  ['BCA-4', 'CS303', 'Amit Verma'], ['BCA-4', 'CS306', 'Anita Reddy'],
  ['BCA-4', 'CS306L', 'Anita Reddy', 'Computer Lab 3'], ['BCA-4', 'MA302', 'Kavita Nair'], ['BCA-4', 'EN301', 'Deepak Shah'],
  ['MTECH-CS-1', 'CS401', 'Sanjay Gupta'], ['MTECH-CS-1', 'CS402', 'Meena Iyer'],
  ['MTECH-CS-1', 'CS403', 'Arun Pillai'], ['MTECH-CS-1', 'CS404', 'Vikram Patel'], ['MTECH-CS-1', 'MA303', 'Kavita Nair'],
  ['MTECH-AI-1', 'CS401', 'Sanjay Gupta'], ['MTECH-AI-1', 'CS402', 'Meena Iyer'],
  ['MTECH-AI-1', 'CS403', 'Arun Pillai'], ['MTECH-AI-1', 'MA303', 'Kavita Nair'], ['MTECH-AI-1', 'CS404', 'Vikram Patel'],
];
const classSubjects = assignmentsData.map(([cc, sc, tn, room], i) => ({
  _id: 'cs_' + i, class: classByCode[cc], subject: subjByCode[sc], teacher: teacherByName[tn],
  lectures_per_week: subjByCode[sc].lectures_per_week, preferredRoom: room ? roomByName[room] : null,
}));

/* ── Synthesize a timetable per class (so teacher/student views are coherent) */
function buildSchedule(csForClass, roomName) {
  const days = [];
  const fillSlots = [0, 1, 2, 5, 6]; // 5 lectures/day; slot 4 = lunch, 3 & 7 free
  let ptr = 0;
  for (let d = 0; d < 5; d++) {
    const day = [];
    for (let sl = 0; sl < 8; sl++) {
      if (sl === 4) { day.push([{ event: 'Lunch Break' }]); continue; }
      if (fillSlots.includes(sl) && csForClass.length) {
        const cs = csForClass[ptr % csForClass.length]; ptr++;
        day.push([{ subject: cs.subject.name, teacher: cs.teacher.name, classroom: (cs.preferredRoom?.name) || roomName }]);
      } else {
        day.push([]);
      }
    }
    days.push(day);
  }
  return days;
}
const timetables = classes.map((c) => {
  const csForClass = classSubjects.filter(cs => cs.class._id === c._id);
  return {
    _id: 'tt_' + c.code, class: c, academicYear: '2025-2026', semester: c.semester,
    schedule: buildSchedule(csForClass, c.assignedRoom?.name || 'Room 101'),
    status: 'published', currentVersion: 1, isEdited: false,
    createdAt: '2026-01-10T08:00:00.000Z', editHistory: [],
    metadata: { statistics: { utilization_rate: 78 } },
  };
});
const ttByClassId = Object.fromEntries(timetables.map(t => [t.class._id, t]));

/* ── Calendar events (from seed) ────────────────────────────────────────── */
const calendarEvents = [
  ['Republic Day', 'holiday', '2026-01-26', '2026-01-26'],
  ['Maha Shivaratri', 'holiday', '2026-02-15', '2026-02-15'],
  ['Holi', 'holiday', '2026-03-03', '2026-03-04'],
  ['Good Friday', 'holiday', '2026-04-03', '2026-04-03'],
  ['Eid ul-Fitr', 'holiday', '2026-03-21', '2026-03-21'],
  ['Diwali Break', 'holiday', '2025-11-10', '2025-11-14'],
  ['Winter Break', 'vacation', '2025-12-26', '2026-01-02'],
  ['Summer Vacation', 'vacation', '2026-05-15', '2026-07-15'],
  ['Mid-Semester Exams', 'exam', '2026-03-09', '2026-03-14'],
  ['End-Semester Exams', 'exam', '2026-04-27', '2026-05-10'],
  ['Annual Tech Fest', 'event', '2026-02-20', '2026-02-22'],
  ['Sports Day', 'event', '2026-01-15', '2026-01-16'],
  ['Convocation Ceremony', 'event', '2026-05-12', '2026-05-12'],
].map(([title, eventType, startDate, endDate], i) => ({
  _id: 'ev_' + i, title, eventType, startDate, endDate, academicYear: '2025-2026',
  description: `${title} (${eventType})`,
}));

/* ── Teaching progress per class (compact, from seed) ───────────────────── */
const progressMap = {
  'BTECH-CS-3A': [['CS301', 0, 70, 42, 88, 'on_track', 3], ['CS302', 1, 63, 38, 79, 'at_risk', 5], ['MA301', 8, 75, 34, 92, 'on_track', 2], ['EN301', 12, 80, 16, 94, 'ahead', 1]],
  'BTECH-CS-3B': [['CS301', 0, 68, 41, 85, 'on_track', 3], ['CS302', 1, 58, 35, 77, 'at_risk', 5], ['MA301', 9, 72, 32, 90, 'on_track', 2], ['EN301', 12, 85, 17, 95, 'ahead', 1]],
  'BTECH-CS-4A': [['CS303', 2, 78, 35, 97, 'ahead', 1], ['CS304', 3, 56, 25, 69, 'behind', 7], ['MA302', 9, 82, 37, 93, 'ahead', 1], ['MG301', 13, 90, 18, 96, 'ahead', 1]],
  'BTECH-CS-4B': [['CS303', 2, 72, 32, 91, 'on_track', 2], ['CS304', 3, 60, 27, 75, 'at_risk', 5], ['MA302', 8, 77, 35, 92, 'on_track', 2], ['MG301', 13, 88, 17, 95, 'ahead', 1]],
  'BTECH-CS-5A': [['CS305', 4, 84, 38, 95, 'ahead', 1], ['CS306', 5, 72, 35, 88, 'on_track', 2], ['CS401', 6, 67, 30, 83, 'on_track', 3], ['MA303', 9, 80, 36, 94, 'ahead', 1]],
  'BTECH-ECE-3A': [['EC301', 10, 75, 34, 91, 'on_track', 2], ['MA301', 8, 70, 32, 87, 'on_track', 3], ['PH301', 11, 88, 18, 96, 'ahead', 1], ['CS302', 1, 55, 33, 75, 'behind', 6]],
  'BCA-3': [['CS301', 0, 67, 40, 91, 'on_track', 3], ['CS302', 1, 62, 37, 83, 'at_risk', 4], ['MA301', 8, 78, 35, 93, 'on_track', 2]],
  'BCA-4': [['CS303', 2, 73, 33, 89, 'on_track', 2], ['CS306', 5, 68, 33, 85, 'on_track', 3], ['MA302', 9, 85, 38, 96, 'ahead', 1], ['EN301', 12, 45, 11, 70, 'behind', 7]],
  'MTECH-CS-1': [['CS401', 6, 80, 36, 95, 'ahead', 1], ['CS402', 7, 77, 46, 92, 'on_track', 2], ['CS403', 14, 71, 32, 89, 'on_track', 3], ['CS404', 4, 60, 27, 80, 'at_risk', 5], ['MA303', 9, 85, 38, 97, 'ahead', 1]],
  'MTECH-AI-1': [['CS401', 6, 82, 37, 96, 'ahead', 1], ['CS402', 7, 74, 44, 88, 'on_track', 2], ['CS403', 14, 65, 29, 83, 'at_risk', 4], ['MA303', 9, 90, 40, 98, 'ahead', 1], ['CS404', 4, 52, 23, 74, 'behind', 6]],
};
// Matches the backend /progress/class/:id shape: { classInfo, statistics, subjects[] }.
function progressForClass(classId) {
  const cls = classes.find(c => c._id === classId);
  const code = cls?.code;
  const rows = progressMap[code] || [];
  const subjectsArr = rows.map(([sc, tIdx, comp, cond, att, status, urg], i) => {
    const total = sc.endsWith('L') ? 20 : (subjByCode[sc].lectures_per_week >= 4 ? 60 : 45);
    return {
      id: `pg_${code}_${i}`,
      subjectId: subjByCode[sc]._id,
      subjectName: subjByCode[sc].name,
      subjectCode: sc,
      teacherName: teachers[tIdx].name,
      completionPercentage: comp,
      conductedHours: cond,
      totalRequiredHours: total,
      remainingHours: Math.max(0, total - cond),
      complianceStatus: status,
      urgencyScore: urg,
      attendanceRate: att,
    };
  });
  const statusCount = subjectsArr.reduce((acc, s) => {
    acc[s.complianceStatus] = (acc[s.complianceStatus] || 0) + 1;
    return acc;
  }, { ahead: 0, on_track: 0, at_risk: 0, behind: 0 });
  const avgCompletion = subjectsArr.length
    ? Math.round(subjectsArr.reduce((a, s) => a + s.completionPercentage, 0) / subjectsArr.length)
    : 0;
  return {
    classInfo: cls
      ? { name: cls.name, code: cls.code, program: cls.program?.name, department: cls.program?.department?.name, semester: cls.semester, section: cls.section }
      : {},
    statistics: { totalSubjects: subjectsArr.length, averageCompletion: avgCompletion, statusCount },
    subjects: subjectsArr,
  };
}

/* ── Ratings ────────────────────────────────────────────────────────────── */
const ratingsAggregate = {
  averageRating: 4.1, totalRatings: 25,
  categories: { clarity: 4.0, punctuality: 4.3, engagement: 3.9, knowledge: 4.5, accessibility: 3.8 },
};
const ratingsTrends = { trends: [
  { period: 'Sep', average: 3.8 }, { period: 'Oct', average: 4.0 },
  { period: 'Nov', average: 4.1 }, { period: 'Dec', average: 4.2 }, { period: 'Jan', average: 4.3 },
] };
const ratingsList = { ratings: [
  { _id: 'rt1', overallRating: 5, feedback: 'Excellent teaching methodology!', isAnonymous: true, createdAt: new Date().toISOString() },
  { _id: 'rt2', overallRating: 4, feedback: 'Very clear explanations.', isAnonymous: true, createdAt: new Date().toISOString() },
  { _id: 'rt3', overallRating: 4, feedback: 'Very approachable and helpful.', isAnonymous: false, createdAt: new Date().toISOString() },
] };

/* ── Reports (from seed) ────────────────────────────────────────────────── */
const reports = [
  { _id: 'rep1', reportType: 'timetable_utilization', title: 'Timetable Utilization Report - Jan 2026', createdAt: '2026-01-31T10:00:00Z', summary: { totalRecords: 450, keyMetrics: { utilizationRate: 85.6 } } },
  { _id: 'rep2', reportType: 'teacher_workload', title: 'Teacher Workload Analysis - Semester 3', createdAt: '2026-01-31T10:00:00Z', summary: { totalRecords: 15, keyMetrics: { avgWorkload: 18 } } },
  { _id: 'rep3', reportType: 'room_usage', title: 'Room Usage Report - Feb 2026', createdAt: '2026-02-28T10:00:00Z', summary: { totalRecords: 15, keyMetrics: { avgOccupancy: 72.3 } } },
  { _id: 'rep4', reportType: 'progress_tracking', title: 'Teaching Progress Summary - Mid Semester', createdAt: '2026-02-15T10:00:00Z', summary: { totalRecords: 22, keyMetrics: { avgCompletion: 68.5 } } },
  { _id: 'rep5', reportType: 'performance_overview', title: 'Overall Performance Report - AY 2025-2026', createdAt: '2026-02-15T10:00:00Z', summary: { totalRecords: 15, keyMetrics: { avgRating: 4.1 } } },
];

/* ── Leave + notifications ──────────────────────────────────────────────── */
const leaves = [
  { _id: 'lv1', teacher: teacherUsers[3], leaveType: 'sick', status: 'pending', startDate: '2026-02-10', endDate: '2026-02-11', reason: 'Fever and rest advised', createdAt: new Date().toISOString(), isUrgent: false },
  { _id: 'lv2', teacher: teacherUsers[1], leaveType: 'casual', status: 'pending', startDate: '2026-02-14', endDate: '2026-02-14', reason: 'Personal work', createdAt: new Date().toISOString(), isUrgent: true },
  { _id: 'lv3', teacher: teacherUsers[0], leaveType: 'conference', status: 'approved', startDate: '2026-01-20', endDate: '2026-01-22', reason: 'Research conference', createdAt: new Date().toISOString(), isUrgent: false },
];
const notifications = [
  { _id: 'n1', title: 'Timetable published', message: 'The B.Tech CS Sem-3 Section A timetable has been published.', type: 'success', isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { _id: 'n2', title: 'Holiday added', message: 'Republic Day (Jan 26) has been marked as a holiday.', type: 'info', isRead: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { _id: 'n3', title: 'Leave request', message: 'Neha Singh submitted a sick-leave request.', type: 'warning', isRead: false, createdAt: new Date(Date.now() - 10800000).toISOString() },
  { _id: 'n4', title: 'Leave approved', message: 'Your conference leave was approved.', type: 'success', isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
];

/* ── Auth helpers ───────────────────────────────────────────────────────── */
function roleFromEmail(email = '') {
  if (/teacher|prof|faculty/i.test(email)) return 'teacher';
  if (/student|stud/i.test(email)) return 'student';
  return 'admin';
}
function fullDemoUser(email) {
  const seeded = userByEmail[(email || '').toLowerCase()];
  if (seeded) return { ...seeded };
  const role = roleFromEmail(email);
  if (role === 'teacher') return { ...teacherUsers[0], email: email || teacherUsers[0].email };
  if (role === 'student') return { ...students[0], email: email || students[0].email };
  return { ...admin, email: email || admin.email };
}
function storedDemoUser() {
  try { return JSON.parse(localStorage.getItem(DEMO_USER_KEY) || 'null'); } catch { return null; }
}

const lastSeg = (path) => path.split('?')[0].split('/').filter(Boolean).pop();

/* ── Route table: [method, pathRegex, responder(path, config)] ──────────── */
const routes = [
  // Auth
  ['post', /^\/auth\/login$/, (_p, config) => {
    let email = '';
    try { email = JSON.parse(config?.data || '{}').email || ''; } catch { /* ignore */ }
    const user = fullDemoUser(email);
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user));
    return { token: 'demo-token-' + user.role, user };
  }],
  ['post', /^\/auth\/register$/, (_p, config) => {
    let body = {};
    try { body = JSON.parse(config?.data || '{}'); } catch { /* ignore */ }
    const user = { ...fullDemoUser(body.email), ...body, _id: 'demo-' + (body.role || 'student') };
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user));
    return { token: 'demo-token-' + user.role, user };
  }],
  ['get', /^\/auth\/me$/, () => ({ user: storedDemoUser() || admin })],
  ['get', /^\/auth\/users$/, () => ({ users })],

  // Reference data
  ['get', /^\/subjects\/?$/, () => subjects],
  ['get', /^\/teachers\/by-name\//, (p) => teacherByName[decodeURIComponent(lastSeg(p))] || teachers[0]],
  ['get', /^\/teachers\/user\//, (p) => teachers.find(t => t.user === lastSeg(p)) || teachers[0]],
  ['get', /^\/teachers\/?$/, () => teachers],
  ['get', /^\/classrooms\/?$/, () => classrooms],
  ['get', /^\/departments\/?$/, () => departments],
  ['get', /^\/programs\/?$/, () => programs],
  ['get', /^\/classes\/?$/, () => classes],
  ['get', /^\/class-subjects\/teacher-by-name\//, (p) => {
    // /class-subjects/teacher-by-name/:first/:last
    const parts = p.split('/').filter(Boolean);
    const name = decodeURIComponent(parts[parts.length - 2] + ' ' + parts[parts.length - 1]);
    return classSubjects.filter(cs => cs.teacher?.name === name);
  }],
  ['get', /^\/class-subjects\/teacher\//, (p) => classSubjects.filter(cs => cs.teacher?._id === lastSeg(p))],
  ['get', /^\/class-subjects\/class\//, (p) => classSubjects.filter(cs => cs.class?._id === lastSeg(p))],
  ['get', /^\/class-subjects\/?$/, () => classSubjects],

  // Timetables
  ['get', /^\/timetables\/student\//, () => ({ studentId: 'demo-student', class: classByCode['BTECH-CS-3A'], timetable: ttByClassId['class_BTECH-CS-3A'] })],
  ['get', /^\/timetables\/teacher\//, () => ({
    teacherId: 'demo-teacher',
    classes: classSubjects.map(cs => ({ class: cs.class, subject: cs.subject })),
    timetables,
  })],
  ['get', /^\/timetables\/class\//, (p) => timetables.filter(t => t.class._id === lastSeg(p))],
  ['get', /^\/timetables\/[^/]+\/history$/, () => ({ currentVersion: 1, history: [] })],
  ['get', /^\/timetables\/[^/]+$/, (p) => timetables.find(t => t._id === lastSeg(p)) || timetables[0]],
  ['get', /^\/timetables\/?$/, () => timetables],
  ['post', /^\/timetables\/generate-all$/, () => ({
    status: 'success', total: classes.length, succeeded: classes.length, failed: 0,
    results: classes.map(c => ({ classId: c._id, className: c.name, status: 'success', timetableId: 'tt_' + c.code })),
  })],
  ['post', /^\/timetables\/generate\//, (p) => {
    const tt = ttByClassId[`class_${classes.find(c => c._id === p.split('/').filter(Boolean)[2])?.code}`] || timetables[0];
    return { status: 'success', message: 'Timetable generated (demo)', timetable: tt.schedule, timetableId: tt._id, statistics: { utilization_rate: 78, total_lectures_allocated: 25, available_slots: 35 } };
  }],

  // Calendar / notifications
  ['get', /^\/calendar\/?$/, (p) => {
    const type = (p.split('eventType=')[1] || '').split('&')[0];
    return type ? calendarEvents.filter(e => e.eventType === decodeURIComponent(type)) : calendarEvents;
  }],
  ['get', /^\/notifications\/unread-count$/, () => ({ unreadCount: notifications.filter(n => !n.isRead).length })],
  ['get', /^\/notifications\/?/, () => ({ notifications })],

  // Progress / syllabus
  ['get', /^\/progress\/class\//, (p) => progressForClass(lastSeg(p))],
  ['get', /^\/syllabus\/year\//, () => []],

  // Ratings
  ['get', /^\/ratings\/aggregate\//, () => ratingsAggregate],
  ['get', /^\/ratings\/trends\//, () => ratingsTrends],
  ['get', /^\/ratings\/teacher\//, () => ratingsList],
  ['get', /^\/ratings\/my-teachers\//, () => ({
    teachers: classSubjects.slice(0, 6).map(cs => ({ teacher: cs.teacher, subject: cs.subject, class: cs.class, hasRated: false })),
  })],

  // Reports
  ['get', /^\/reports\/compliance-trend$/, () => ([
    { label: 'Wk 1', value: 58 }, { label: 'Wk 2', value: 61 }, { label: 'Wk 3', value: 64 },
    { label: 'Wk 4', value: 63 }, { label: 'Wk 5', value: 68 }, { label: 'Wk 6', value: 71 },
    { label: 'Wk 7', value: 74 }, { label: 'Wk 8', value: 77 },
  ])],
  ['get', /^\/reports\/list/, () => ({ reports })],
  ['get', /^\/reports\/[^/]+$/, (p) => ({ success: true, report: { _id: lastSeg(p), reportType: 'timetable_utilization', data: {}, summary: {} } })],

  // Attendance
  ['get', /^\/attendance\/class\/[^/]+\/students$/, () => ({ class: classes[0], students: students.slice(0, 10) })],
  ['get', /^\/attendance\/class\//, () => ({ students: students.slice(0, 10), records: [] })],
  ['get', /^\/attendance\/sessions/, () => ({ sessions: [] })],

  // Leave
  ['get', /^\/leave\/pending$/, () => ({ count: leaves.filter(l => l.status === 'pending').length, leaves: leaves.filter(l => l.status === 'pending') })],
  ['get', /^\/leave\/my$/, () => ({ leaves: leaves.slice(0, 2) })],
  ['get', /^\/leave\b/, (p) => {
    const status = (p.split('status=')[1] || '').split('&')[0];
    return { leaves: status ? leaves.filter(l => l.status === decodeURIComponent(status)) : leaves };
  }],
];

/**
 * Return a mock response body for (method, url), or undefined if unmocked.
 * Mutations with no explicit route get a generic demo-success so the UI
 * doesn't error (changes simply don't persist offline).
 */
export function getMock(method, url, config) {
  if (!url) return undefined;
  const m = (method || 'get').toLowerCase();
  const path = url.split('?')[0];
  const full = url; // keep query for responders that read it

  for (const [rm, re, fn] of routes) {
    if (rm === m && re.test(path)) return fn(full, config);
  }

  if (m === 'post' || m === 'put' || m === 'delete' || m === 'patch') {
    return { success: true, message: 'Demo mode — change not persisted (backend offline).' };
  }
  return undefined;
}

export default getMock;
