const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/user.model');
const Subject = require('./models/subject.model');
const Teacher = require('./models/teacher.model');
const Classroom = require('./models/classroom.model');
const Department = require('./models/department.model');
const Program = require('./models/program.model');
const Class = require('./models/class.model');
const ClassSubject = require('./models/classSubject.model');
const CalendarEvent = require('./models/calendar.model');
const SubjectSyllabus = require('./models/subjectSyllabus.model');
const TeachingProgress = require('./models/teachingProgress.model');
const SessionLog = require('./models/sessionLog.model');
const TeacherRating = require('./models/teacherRating.model');
const Report = require('./models/report.model');

// Connect to MongoDB
const uri = process.env.ATLAS_URI;
mongoose.connect(uri);

const connection = mongoose.connection;
connection.once('open', async () => {
  console.log("MongoDB database connection established successfully!");

  try {
    // Clear existing data
    console.log('\n🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Subject.deleteMany({});
    await Teacher.deleteMany({});
    await Classroom.deleteMany({});
    await Department.deleteMany({});
    await Program.deleteMany({});
    await Class.deleteMany({});
    await ClassSubject.deleteMany({});
    await CalendarEvent.deleteMany({});
    await SubjectSyllabus.deleteMany({});
    await TeachingProgress.deleteMany({});
    await SessionLog.deleteMany({});
    await TeacherRating.deleteMany({});
    await Report.deleteMany({});
    console.log('✅ Existing data cleared');

    // ============================================
    // 1. CREATE USERS
    // ============================================
    console.log('\n👥 Creating users...');

    // Admin user
    const admin = await User.create({
      email: 'admin@college.edu',
      password: 'admin123',
      role: 'admin',
      firstName: 'John',
      lastName: 'Administrator',
      phone: '+91-9876543210'
    });
    console.log('✅ Admin created');

    // Teachers (15 teachers)
    const teachersData = [
      { email: 'rajesh.kumar@college.edu', firstName: 'Rajesh', lastName: 'Kumar', department: 'Computer Science', specialization: 'Data Structures & Algorithms' },
      { email: 'priya.sharma@college.edu', firstName: 'Priya', lastName: 'Sharma', department: 'Computer Science', specialization: 'Database Management' },
      { email: 'amit.verma@college.edu', firstName: 'Amit', lastName: 'Verma', department: 'Computer Science', specialization: 'Operating Systems' },
      { email: 'neha.singh@college.edu', firstName: 'Neha', lastName: 'Singh', department: 'Computer Science', specialization: 'Computer Networks' },
      { email: 'vikram.patel@college.edu', firstName: 'Vikram', lastName: 'Patel', department: 'Computer Science', specialization: 'Software Engineering' },
      { email: 'anita.reddy@college.edu', firstName: 'Anita', lastName: 'Reddy', department: 'Computer Science', specialization: 'Web Development' },
      { email: 'sanjay.gupta@college.edu', firstName: 'Sanjay', lastName: 'Gupta', department: 'Computer Science', specialization: 'Artificial Intelligence' },
      { email: 'meena.iyer@college.edu', firstName: 'Meena', lastName: 'Iyer', department: 'Computer Science', specialization: 'Machine Learning' },
      { email: 'rahul.joshi@college.edu', firstName: 'Rahul', lastName: 'Joshi', department: 'Mathematics', specialization: 'Discrete Mathematics' },
      { email: 'kavita.nair@college.edu', firstName: 'Kavita', lastName: 'Nair', department: 'Mathematics', specialization: 'Linear Algebra' },
      { email: 'suresh.rao@college.edu', firstName: 'Suresh', lastName: 'Rao', department: 'Electronics', specialization: 'Digital Electronics' },
      { email: 'pooja.mehta@college.edu', firstName: 'Pooja', lastName: 'Mehta', department: 'Physics', specialization: 'Applied Physics' },
      { email: 'deepak.shah@college.edu', firstName: 'Deepak', lastName: 'Shah', department: 'English', specialization: 'Technical Communication' },
      { email: 'sunita.desai@college.edu', firstName: 'Sunita', lastName: 'Desai', department: 'Management', specialization: 'Engineering Economics' },
      { email: 'arun.pillai@college.edu', firstName: 'Arun', lastName: 'Pillai', department: 'Computer Science', specialization: 'Cloud Computing' }
    ];

    const teachers = [];
    for (const teacherData of teachersData) {
      const teacher = await User.create({
        ...teacherData,
        password: 'teacher123',
        role: 'teacher',
        phone: `+91-98765${Math.floor(10000 + Math.random() * 90000)}`
      });
      teachers.push(teacher);
    }
    console.log(`✅ ${teachers.length} teachers created`);

    // Students (40 students)
    const studentNames = [
      { firstName: 'Aarav', lastName: 'Sharma' },
      { firstName: 'Vivaan', lastName: 'Kumar' },
      { firstName: 'Aditya', lastName: 'Singh' },
      { firstName: 'Vihaan', lastName: 'Patel' },
      { firstName: 'Arjun', lastName: 'Gupta' },
      { firstName: 'Sai', lastName: 'Reddy' },
      { firstName: 'Arnav', lastName: 'Verma' },
      { firstName: 'Ayaan', lastName: 'Joshi' },
      { firstName: 'Krishna', lastName: 'Nair' },
      { firstName: 'Ishaan', lastName: 'Iyer' },
      { firstName: 'Ananya', lastName: 'Desai' },
      { firstName: 'Diya', lastName: 'Mehta' },
      { firstName: 'Aadhya', lastName: 'Shah' },
      { firstName: 'Saanvi', lastName: 'Pillai' },
      { firstName: 'Kiara', lastName: 'Rao' },
      { firstName: 'Navya', lastName: 'Kulkarni' },
      { firstName: 'Isha', lastName: 'Agarwal' },
      { firstName: 'Myra', lastName: 'Bhatt' },
      { firstName: 'Anika', lastName: 'Jain' },
      { firstName: 'Sara', lastName: 'Mishra' },
      { firstName: 'Rohan', lastName: 'Pandey' },
      { firstName: 'Kabir', lastName: 'Thakur' },
      { firstName: 'Reyansh', lastName: 'Malhotra' },
      { firstName: 'Shivansh', lastName: 'Kapoor' },
      { firstName: 'Rudra', lastName: 'Chopra' },
      { firstName: 'Dhruv', lastName: 'Saxena' },
      { firstName: 'Advait', lastName: 'Bansal' },
      { firstName: 'Pranav', lastName: 'Sinha' },
      { firstName: 'Om', lastName: 'Trivedi' },
      { firstName: 'Shaurya', lastName: 'Dwivedi' },
      { firstName: 'Riya', lastName: 'Arora' },
      { firstName: 'Prisha', lastName: 'Bose' },
      { firstName: 'Avni', lastName: 'Das' },
      { firstName: 'Pari', lastName: 'Ghosh' },
      { firstName: 'Aarohi', lastName: 'Chatterjee' },
      { firstName: 'Shanaya', lastName: 'Mukherjee' },
      { firstName: 'Tanvi', lastName: 'Sengupta' },
      { firstName: 'Anvi', lastName: 'Roy' },
      { firstName: 'Zara', lastName: 'Dutta' },
      { firstName: 'Nitya', lastName: 'Ganguly' }
    ];

    const students = [];
    let enrollmentCounter = 2024001;
    const programsList = ['BTECH-CS', 'BTECH-ECE', 'BCA'];
    const sections = ['A', 'B'];

    for (let i = 0; i < studentNames.length; i++) {
      const program = programsList[i % programsList.length];
      const semester = Math.floor(i / 10) % 4 + 3;
      const section = sections[i % sections.length];

      const student = await User.create({
        email: `${studentNames[i].firstName.toLowerCase()}.${studentNames[i].lastName.toLowerCase()}@student.college.edu`,
        password: 'student123',
        role: 'student',
        firstName: studentNames[i].firstName,
        lastName: studentNames[i].lastName,
        enrollmentNumber: `EN${enrollmentCounter++}`,
        program: program,
        semester: semester,
        section: section,
        phone: `+91-98765${Math.floor(10000 + Math.random() * 90000)}`
      });
      students.push(student);
    }
    console.log(`✅ ${students.length} students created`);

    // ============================================
    // 2. CREATE DEPARTMENTS
    // ============================================
    console.log('\n🏢 Creating departments...');

    const departmentsData = [
      { name: 'Computer Science & Engineering', code: 'CSE', description: 'Department of Computer Science and Engineering' },
      { name: 'Electronics & Communication Engineering', code: 'ECE', description: 'Department of Electronics and Communication' },
      { name: 'Mechanical Engineering', code: 'ME', description: 'Department of Mechanical Engineering' },
      { name: 'Mathematics', code: 'MATH', description: 'Department of Mathematics' }
    ];

    const departments = {};
    for (const deptData of departmentsData) {
      const dept = await Department.create(deptData);
      departments[deptData.code] = dept;
      console.log(`  ✓ ${deptData.name}`);
    }
    console.log(`✅ ${Object.keys(departments).length} departments created`);

    // ============================================
    // 3. CREATE PROGRAMS
    // ============================================
    console.log('\n📋 Creating programs...');

    const programsData = [
      { name: 'Bachelor of Technology in Computer Science', code: 'BTECH-CS', department: departments.CSE._id, duration: 4, totalSemesters: 8 },
      { name: 'Bachelor of Technology in Electronics', code: 'BTECH-ECE', department: departments.ECE._id, duration: 4, totalSemesters: 8 },
      { name: 'Bachelor of Technology in Mechanical', code: 'BTECH-ME', department: departments.ME._id, duration: 4, totalSemesters: 8 },
      { name: 'Bachelor of Computer Applications', code: 'BCA', department: departments.CSE._id, duration: 3, totalSemesters: 6 },
      { name: 'Master of Technology in Computer Science', code: 'MTECH-CS', department: departments.CSE._id, duration: 2, totalSemesters: 4 },
      { name: 'Master of Technology in AI & ML', code: 'MTECH-AI', department: departments.CSE._id, duration: 2, totalSemesters: 4 }
    ];

    const programs = {};
    for (const progData of programsData) {
      const prog = await Program.create(progData);
      programs[progData.code] = prog;
      console.log(`  ✓ ${progData.name}`);
    }
    console.log(`✅ ${Object.keys(programs).length} programs created`);

    // ============================================
    // 4. CREATE SUBJECTS
    // ============================================
    console.log('\n📚 Creating subjects...');

    const subjectsData = [
      { name: 'Data Structures and Algorithms', code: 'CS301', lectures_per_week: 4, subjectType: 'theory', credits: 4, department: departments.CSE._id },
      { name: 'Database Management Systems', code: 'CS302', lectures_per_week: 4, subjectType: 'theory', credits: 4, department: departments.CSE._id },
      { name: 'Operating Systems', code: 'CS303', lectures_per_week: 3, subjectType: 'theory', credits: 3, department: departments.CSE._id },
      { name: 'Computer Networks', code: 'CS304', lectures_per_week: 3, subjectType: 'theory', credits: 3, department: departments.CSE._id },
      { name: 'Software Engineering', code: 'CS305', lectures_per_week: 3, subjectType: 'theory', credits: 3, department: departments.CSE._id },
      { name: 'Web Technologies', code: 'CS306', lectures_per_week: 4, subjectType: 'theory', credits: 4, department: departments.CSE._id },
      { name: 'Artificial Intelligence', code: 'CS401', lectures_per_week: 3, subjectType: 'theory', credits: 3, department: departments.CSE._id },
      { name: 'Machine Learning', code: 'CS402', lectures_per_week: 4, subjectType: 'theory', credits: 4, department: departments.CSE._id },
      { name: 'Cloud Computing', code: 'CS403', lectures_per_week: 3, subjectType: 'theory', credits: 3, department: departments.CSE._id },
      { name: 'Compiler Design', code: 'CS404', lectures_per_week: 3, subjectType: 'theory', credits: 3, department: departments.CSE._id },
      { name: 'Data Structures Lab', code: 'CS301L', lectures_per_week: 2, subjectType: 'lab', credits: 1, department: departments.CSE._id },
      { name: 'Database Lab', code: 'CS302L', lectures_per_week: 2, subjectType: 'lab', credits: 1, department: departments.CSE._id },
      { name: 'Operating Systems Lab', code: 'CS303L', lectures_per_week: 2, subjectType: 'lab', credits: 1, department: departments.CSE._id },
      { name: 'Networks Lab', code: 'CS304L', lectures_per_week: 2, subjectType: 'lab', credits: 1, department: departments.CSE._id },
      { name: 'Web Technologies Lab', code: 'CS306L', lectures_per_week: 2, subjectType: 'lab', credits: 1, department: departments.CSE._id },
      { name: 'Discrete Mathematics', code: 'MA301', lectures_per_week: 3, subjectType: 'theory', credits: 3, department: departments.MATH._id },
      { name: 'Linear Algebra', code: 'MA302', lectures_per_week: 3, subjectType: 'theory', credits: 3, department: departments.MATH._id },
      { name: 'Probability and Statistics', code: 'MA303', lectures_per_week: 3, subjectType: 'theory', credits: 3, department: departments.MATH._id },
      { name: 'Digital Electronics', code: 'EC301', lectures_per_week: 3, subjectType: 'theory', credits: 3, department: departments.ECE._id },
      { name: 'Applied Physics', code: 'PH301', lectures_per_week: 2, subjectType: 'theory', credits: 2, department: departments.MATH._id },
      { name: 'Technical Communication', code: 'EN301', lectures_per_week: 2, subjectType: 'theory', credits: 2, department: departments.MATH._id },
      { name: 'Engineering Economics', code: 'MG301', lectures_per_week: 2, subjectType: 'theory', credits: 2, department: departments.MATH._id }
    ];

    const subjects = {};
    for (const subjectData of subjectsData) {
      const subject = await Subject.create(subjectData);
      subjects[subjectData.code] = subject;
    }
    console.log(`✅ ${Object.keys(subjects).length} subjects created`);

    // ============================================
    // 5. CREATE TEACHER RECORDS
    // ============================================
    console.log('\n👨‍🏫 Creating teacher records...');

    const teacherRecords = {};
    for (const teacher of teachers) {
      const teacherRecord = await Teacher.create({
        name: `${teacher.firstName} ${teacher.lastName}`,
        user: teacher._id  // Explicitly link the Teacher record to the User account
      });
      teacherRecords[`${teacher.firstName} ${teacher.lastName}`] = teacherRecord;
    }
    console.log(`✅ ${Object.keys(teacherRecords).length} teacher records created`);

    // ============================================
    // 6. CREATE CLASSROOMS
    // ============================================
    console.log('\n🏫 Creating classrooms...');

    const classroomsData = [
      { name: 'Room 101', capacity: 60 },
      { name: 'Room 102', capacity: 60 },
      { name: 'Room 103', capacity: 60 },
      { name: 'Room 104', capacity: 60 },
      { name: 'Room 201', capacity: 60 },
      { name: 'Room 202', capacity: 60 },
      { name: 'Room 203', capacity: 60 },
      { name: 'Room 204', capacity: 60 },
      { name: 'Room 301', capacity: 80 },
      { name: 'Room 302', capacity: 80 },
      { name: 'Computer Lab 1', capacity: 30 },
      { name: 'Computer Lab 2', capacity: 30 },
      { name: 'Computer Lab 3', capacity: 30 },
      { name: 'Network Lab', capacity: 25 },
      { name: 'Electronics Lab', capacity: 25 }
    ];

    const classrooms = {};
    for (const classroomData of classroomsData) {
      const classroom = await Classroom.create(classroomData);
      classrooms[classroomData.name] = classroom;
    }
    console.log(`✅ ${Object.keys(classrooms).length} classrooms created`);

    // ============================================
    // 7. CREATE CLASSES
    // ============================================
    console.log('\n🎓 Creating classes...');

    const classesData = [
      { name: 'B.Tech CS - Sem 3 - Section A', code: 'BTECH-CS-3A', program: programs['BTECH-CS']._id, semester: 3, section: 'A', assignedRoom: classrooms['Room 101']._id, studentCount: 60 },
      { name: 'B.Tech CS - Sem 3 - Section B', code: 'BTECH-CS-3B', program: programs['BTECH-CS']._id, semester: 3, section: 'B', assignedRoom: classrooms['Room 102']._id, studentCount: 60 },
      { name: 'B.Tech CS - Sem 4 - Section A', code: 'BTECH-CS-4A', program: programs['BTECH-CS']._id, semester: 4, section: 'A', assignedRoom: classrooms['Room 103']._id, studentCount: 58 },
      { name: 'B.Tech CS - Sem 4 - Section B', code: 'BTECH-CS-4B', program: programs['BTECH-CS']._id, semester: 4, section: 'B', assignedRoom: classrooms['Room 104']._id, studentCount: 58 },
      { name: 'B.Tech CS - Sem 5 - Section A', code: 'BTECH-CS-5A', program: programs['BTECH-CS']._id, semester: 5, section: 'A', assignedRoom: classrooms['Room 201']._id, studentCount: 55 },
      { name: 'B.Tech ECE - Sem 3 - Section A', code: 'BTECH-ECE-3A', program: programs['BTECH-ECE']._id, semester: 3, section: 'A', assignedRoom: classrooms['Room 202']._id, studentCount: 50 },
      { name: 'BCA - Sem 3', code: 'BCA-3', program: programs['BCA']._id, semester: 3, section: 'A', assignedRoom: classrooms['Room 203']._id, studentCount: 40 },
      { name: 'BCA - Sem 4', code: 'BCA-4', program: programs['BCA']._id, semester: 4, section: 'A', assignedRoom: classrooms['Room 204']._id, studentCount: 40 },
      { name: 'M.Tech CS - Sem 1', code: 'MTECH-CS-1', program: programs['MTECH-CS']._id, semester: 1, section: 'A', assignedRoom: classrooms['Room 301']._id, studentCount: 30 },
      { name: 'M.Tech AI - Sem 1', code: 'MTECH-AI-1', program: programs['MTECH-AI']._id, semester: 1, section: 'A', assignedRoom: classrooms['Room 302']._id, studentCount: 25 }
    ];

    const classes = {};
    for (const classData of classesData) {
      const cls = await Class.create(classData);
      classes[classData.code] = cls;
      console.log(`  ✓ ${classData.name}`);
    }
    console.log(`✅ ${Object.keys(classes).length} classes created`);

    // ============================================
    // 8. CREATE CLASS-SUBJECT ASSIGNMENTS
    // ============================================
    console.log('\n📌 Creating class-subject assignments...');

    const assignments = [
      // B.Tech CS - Sem 3 - Section A (6 subjects)
      { class: classes['BTECH-CS-3A']._id, subject: subjects['CS301']._id, teacher: teacherRecords['Rajesh Kumar']._id },
      { class: classes['BTECH-CS-3A']._id, subject: subjects['CS301L']._id, teacher: teacherRecords['Rajesh Kumar']._id, preferredRoom: classrooms['Computer Lab 1']._id },
      { class: classes['BTECH-CS-3A']._id, subject: subjects['CS302']._id, teacher: teacherRecords['Priya Sharma']._id },
      { class: classes['BTECH-CS-3A']._id, subject: subjects['CS302L']._id, teacher: teacherRecords['Priya Sharma']._id, preferredRoom: classrooms['Computer Lab 1']._id },
      { class: classes['BTECH-CS-3A']._id, subject: subjects['MA301']._id, teacher: teacherRecords['Rahul Joshi']._id },
      { class: classes['BTECH-CS-3A']._id, subject: subjects['EN301']._id, teacher: teacherRecords['Deepak Shah']._id },

      // B.Tech CS - Sem 3 - Section B (6 subjects)
      { class: classes['BTECH-CS-3B']._id, subject: subjects['CS301']._id, teacher: teacherRecords['Rajesh Kumar']._id },
      { class: classes['BTECH-CS-3B']._id, subject: subjects['CS301L']._id, teacher: teacherRecords['Anita Reddy']._id, preferredRoom: classrooms['Computer Lab 2']._id },
      { class: classes['BTECH-CS-3B']._id, subject: subjects['CS302']._id, teacher: teacherRecords['Priya Sharma']._id },
      { class: classes['BTECH-CS-3B']._id, subject: subjects['CS302L']._id, teacher: teacherRecords['Vikram Patel']._id, preferredRoom: classrooms['Computer Lab 2']._id },
      { class: classes['BTECH-CS-3B']._id, subject: subjects['MA301']._id, teacher: teacherRecords['Kavita Nair']._id },
      { class: classes['BTECH-CS-3B']._id, subject: subjects['EN301']._id, teacher: teacherRecords['Deepak Shah']._id },

      // B.Tech CS - Sem 4 - Section A (6 subjects)
      { class: classes['BTECH-CS-4A']._id, subject: subjects['CS303']._id, teacher: teacherRecords['Amit Verma']._id },
      { class: classes['BTECH-CS-4A']._id, subject: subjects['CS303L']._id, teacher: teacherRecords['Amit Verma']._id, preferredRoom: classrooms['Computer Lab 1']._id },
      { class: classes['BTECH-CS-4A']._id, subject: subjects['CS304']._id, teacher: teacherRecords['Neha Singh']._id },
      { class: classes['BTECH-CS-4A']._id, subject: subjects['CS304L']._id, teacher: teacherRecords['Neha Singh']._id, preferredRoom: classrooms['Network Lab']._id },
      { class: classes['BTECH-CS-4A']._id, subject: subjects['MA302']._id, teacher: teacherRecords['Kavita Nair']._id },
      { class: classes['BTECH-CS-4A']._id, subject: subjects['MG301']._id, teacher: teacherRecords['Sunita Desai']._id },

      // B.Tech CS - Sem 4 - Section B (6 subjects)
      { class: classes['BTECH-CS-4B']._id, subject: subjects['CS303']._id, teacher: teacherRecords['Amit Verma']._id },
      { class: classes['BTECH-CS-4B']._id, subject: subjects['CS303L']._id, teacher: teacherRecords['Vikram Patel']._id, preferredRoom: classrooms['Computer Lab 2']._id },
      { class: classes['BTECH-CS-4B']._id, subject: subjects['CS304']._id, teacher: teacherRecords['Neha Singh']._id },
      { class: classes['BTECH-CS-4B']._id, subject: subjects['CS304L']._id, teacher: teacherRecords['Arun Pillai']._id, preferredRoom: classrooms['Network Lab']._id },
      { class: classes['BTECH-CS-4B']._id, subject: subjects['MA302']._id, teacher: teacherRecords['Rahul Joshi']._id },
      { class: classes['BTECH-CS-4B']._id, subject: subjects['MG301']._id, teacher: teacherRecords['Sunita Desai']._id },

      // B.Tech CS - Sem 5 - Section A (5 subjects)
      { class: classes['BTECH-CS-5A']._id, subject: subjects['CS305']._id, teacher: teacherRecords['Vikram Patel']._id },
      { class: classes['BTECH-CS-5A']._id, subject: subjects['CS306']._id, teacher: teacherRecords['Anita Reddy']._id },
      { class: classes['BTECH-CS-5A']._id, subject: subjects['CS306L']._id, teacher: teacherRecords['Anita Reddy']._id, preferredRoom: classrooms['Computer Lab 3']._id },
      { class: classes['BTECH-CS-5A']._id, subject: subjects['CS401']._id, teacher: teacherRecords['Sanjay Gupta']._id },
      { class: classes['BTECH-CS-5A']._id, subject: subjects['MA303']._id, teacher: teacherRecords['Kavita Nair']._id },

      // B.Tech ECE - Sem 3 - Section A (5 subjects)
      { class: classes['BTECH-ECE-3A']._id, subject: subjects['EC301']._id, teacher: teacherRecords['Suresh Rao']._id },
      { class: classes['BTECH-ECE-3A']._id, subject: subjects['MA301']._id, teacher: teacherRecords['Rahul Joshi']._id },
      { class: classes['BTECH-ECE-3A']._id, subject: subjects['PH301']._id, teacher: teacherRecords['Pooja Mehta']._id },
      { class: classes['BTECH-ECE-3A']._id, subject: subjects['EN301']._id, teacher: teacherRecords['Deepak Shah']._id },
      { class: classes['BTECH-ECE-3A']._id, subject: subjects['CS302']._id, teacher: teacherRecords['Priya Sharma']._id },

      // BCA - Sem 3 (5 subjects)
      { class: classes['BCA-3']._id, subject: subjects['CS301']._id, teacher: teacherRecords['Rajesh Kumar']._id },
      { class: classes['BCA-3']._id, subject: subjects['CS301L']._id, teacher: teacherRecords['Anita Reddy']._id, preferredRoom: classrooms['Computer Lab 3']._id },
      { class: classes['BCA-3']._id, subject: subjects['CS302']._id, teacher: teacherRecords['Priya Sharma']._id },
      { class: classes['BCA-3']._id, subject: subjects['CS302L']._id, teacher: teacherRecords['Priya Sharma']._id, preferredRoom: classrooms['Computer Lab 3']._id },
      { class: classes['BCA-3']._id, subject: subjects['MA301']._id, teacher: teacherRecords['Rahul Joshi']._id },

      // BCA - Sem 4 (5 subjects)
      { class: classes['BCA-4']._id, subject: subjects['CS303']._id, teacher: teacherRecords['Amit Verma']._id },
      { class: classes['BCA-4']._id, subject: subjects['CS306']._id, teacher: teacherRecords['Anita Reddy']._id },
      { class: classes['BCA-4']._id, subject: subjects['CS306L']._id, teacher: teacherRecords['Anita Reddy']._id, preferredRoom: classrooms['Computer Lab 3']._id },
      { class: classes['BCA-4']._id, subject: subjects['MA302']._id, teacher: teacherRecords['Kavita Nair']._id },
      { class: classes['BCA-4']._id, subject: subjects['EN301']._id, teacher: teacherRecords['Deepak Shah']._id },

      // M.Tech CS - Sem 1 (5 subjects)
      { class: classes['MTECH-CS-1']._id, subject: subjects['CS401']._id, teacher: teacherRecords['Sanjay Gupta']._id },
      { class: classes['MTECH-CS-1']._id, subject: subjects['CS402']._id, teacher: teacherRecords['Meena Iyer']._id },
      { class: classes['MTECH-CS-1']._id, subject: subjects['CS403']._id, teacher: teacherRecords['Arun Pillai']._id },
      { class: classes['MTECH-CS-1']._id, subject: subjects['CS404']._id, teacher: teacherRecords['Vikram Patel']._id },
      { class: classes['MTECH-CS-1']._id, subject: subjects['MA303']._id, teacher: teacherRecords['Kavita Nair']._id },

      // M.Tech AI - Sem 1 (5 subjects)
      { class: classes['MTECH-AI-1']._id, subject: subjects['CS401']._id, teacher: teacherRecords['Sanjay Gupta']._id },
      { class: classes['MTECH-AI-1']._id, subject: subjects['CS402']._id, teacher: teacherRecords['Meena Iyer']._id },
      { class: classes['MTECH-AI-1']._id, subject: subjects['CS403']._id, teacher: teacherRecords['Arun Pillai']._id },
      { class: classes['MTECH-AI-1']._id, subject: subjects['MA303']._id, teacher: teacherRecords['Kavita Nair']._id },
      { class: classes['MTECH-AI-1']._id, subject: subjects['CS404']._id, teacher: teacherRecords['Vikram Patel']._id }
    ];

    let assignmentCount = 0;
    for (const assignment of assignments) {
      await ClassSubject.create(assignment);
      assignmentCount++;
    }
    console.log(`✅ ${assignmentCount} class-subject assignments created`);

    // ============================================
    // 9. CREATE CALENDAR EVENTS (HOLIDAYS)
    // ============================================
    console.log('\n📅 Creating calendar events...');

    const calendarEventsData = [
      { title: 'Republic Day', description: 'National holiday - Republic Day of India', startDate: new Date('2026-01-26'), endDate: new Date('2026-01-26'), eventType: 'holiday', academicYear: '2025-2026', createdBy: admin._id },
      { title: 'Maha Shivaratri', description: 'Festival holiday', startDate: new Date('2026-02-15'), endDate: new Date('2026-02-15'), eventType: 'holiday', academicYear: '2025-2026', createdBy: admin._id },
      { title: 'Holi', description: 'Festival of Colors', startDate: new Date('2026-03-03'), endDate: new Date('2026-03-04'), eventType: 'holiday', academicYear: '2025-2026', createdBy: admin._id },
      { title: 'Good Friday', description: 'Religious holiday', startDate: new Date('2026-04-03'), endDate: new Date('2026-04-03'), eventType: 'holiday', academicYear: '2025-2026', createdBy: admin._id },
      { title: 'Eid ul-Fitr', description: 'Festival holiday', startDate: new Date('2026-03-21'), endDate: new Date('2026-03-21'), eventType: 'holiday', academicYear: '2025-2026', createdBy: admin._id },
      { title: 'Independence Day', description: 'National holiday - Independence Day of India', startDate: new Date('2025-08-15'), endDate: new Date('2025-08-15'), eventType: 'holiday', academicYear: '2025-2026', createdBy: admin._id },
      { title: 'Gandhi Jayanti', description: 'National holiday - Mahatma Gandhi birthday', startDate: new Date('2025-10-02'), endDate: new Date('2025-10-02'), eventType: 'holiday', academicYear: '2025-2026', createdBy: admin._id },
      { title: 'Dussehra', description: 'Festival holiday', startDate: new Date('2025-10-22'), endDate: new Date('2025-10-22'), eventType: 'holiday', academicYear: '2025-2026', createdBy: admin._id },
      { title: 'Diwali Break', description: 'Festival of Lights - extended break', startDate: new Date('2025-11-10'), endDate: new Date('2025-11-14'), eventType: 'holiday', academicYear: '2025-2026', createdBy: admin._id },
      { title: 'Christmas', description: 'Christmas Day', startDate: new Date('2025-12-25'), endDate: new Date('2025-12-25'), eventType: 'holiday', academicYear: '2025-2026', createdBy: admin._id },
      { title: 'Winter Break', description: 'End of year winter vacation', startDate: new Date('2025-12-26'), endDate: new Date('2026-01-02'), eventType: 'vacation', academicYear: '2025-2026', createdBy: admin._id },
      { title: 'Summer Vacation', description: 'Summer break between semesters', startDate: new Date('2026-05-15'), endDate: new Date('2026-07-15'), eventType: 'vacation', academicYear: '2025-2026', createdBy: admin._id },
      { title: 'Orientation Day', description: 'New student orientation program', startDate: new Date('2025-08-01'), endDate: new Date('2025-08-01'), eventType: 'event', academicYear: '2025-2026', createdBy: admin._id },
      { title: 'Mid-Semester Exams', description: 'Mid-semester examination week', startDate: new Date('2026-03-09'), endDate: new Date('2026-03-14'), eventType: 'exam', academicYear: '2025-2026', createdBy: admin._id },
      { title: 'End-Semester Exams', description: 'Final examination period', startDate: new Date('2026-04-27'), endDate: new Date('2026-05-10'), eventType: 'exam', academicYear: '2025-2026', createdBy: admin._id },
      { title: 'Annual Tech Fest', description: 'College annual technical festival', startDate: new Date('2026-02-20'), endDate: new Date('2026-02-22'), eventType: 'event', academicYear: '2025-2026', createdBy: admin._id },
      { title: 'Sports Day', description: 'Annual inter-department sports competition', startDate: new Date('2026-01-15'), endDate: new Date('2026-01-16'), eventType: 'event', academicYear: '2025-2026', createdBy: admin._id },
      { title: 'Convocation Ceremony', description: 'Annual graduation ceremony', startDate: new Date('2026-05-12'), endDate: new Date('2026-05-12'), eventType: 'event', academicYear: '2025-2026', createdBy: admin._id },
    ];

    let calendarCount = 0;
    for (const eventData of calendarEventsData) {
      await CalendarEvent.create(eventData);
      calendarCount++;
    }
    console.log(`✅ ${calendarCount} calendar events created`);

    // ============================================
    // 10. CREATE SUBJECT SYLLABI
    // ============================================
    console.log('\n📖 Creating subject syllabi...');

    const syllabiData = [
      {
        subject: subjects['CS301']._id, academicYear: '2025-2026', semester: 3, totalRequiredHours: 60, theoryHours: 50, labHours: 10, createdBy: admin._id,
        units: [
          {
            unitNumber: 1, unitName: 'Introduction to Data Structures', topics: [
              { topicName: 'Arrays and Strings', plannedHours: 3, difficulty: 2 },
              { topicName: 'Linked Lists', plannedHours: 4, difficulty: 3 },
              { topicName: 'Stacks and Queues', plannedHours: 3, difficulty: 2 },
            ]
          },
          {
            unitNumber: 2, unitName: 'Trees', topics: [
              { topicName: 'Binary Trees', plannedHours: 4, difficulty: 3 },
              { topicName: 'BST Operations', plannedHours: 3, difficulty: 3 },
              { topicName: 'AVL Trees', plannedHours: 4, difficulty: 4 },
              { topicName: 'B-Trees', plannedHours: 3, difficulty: 4 },
            ]
          },
          {
            unitNumber: 3, unitName: 'Graphs', topics: [
              { topicName: 'Graph Representations', plannedHours: 2, difficulty: 3 },
              { topicName: 'BFS and DFS', plannedHours: 4, difficulty: 3 },
              { topicName: 'Shortest Path Algorithms', plannedHours: 5, difficulty: 4 },
            ]
          },
          {
            unitNumber: 4, unitName: 'Sorting and Searching', topics: [
              { topicName: 'Comparison Based Sorting', plannedHours: 4, difficulty: 3 },
              { topicName: 'Non-Comparison Sorting', plannedHours: 3, difficulty: 3 },
              { topicName: 'Hashing', plannedHours: 4, difficulty: 3 },
            ]
          },
          {
            unitNumber: 5, unitName: 'Advanced Topics', topics: [
              { topicName: 'Dynamic Programming', plannedHours: 5, difficulty: 5 },
              { topicName: 'Greedy Algorithms', plannedHours: 4, difficulty: 4 },
              { topicName: 'Backtracking', plannedHours: 3, difficulty: 4 },
            ]
          },
        ]
      },
      {
        subject: subjects['CS302']._id, academicYear: '2025-2026', semester: 3, totalRequiredHours: 60, theoryHours: 48, labHours: 12, createdBy: admin._id,
        units: [
          {
            unitNumber: 1, unitName: 'Introduction to DBMS', topics: [
              { topicName: 'Database Concepts', plannedHours: 3, difficulty: 1 },
              { topicName: 'ER Model', plannedHours: 4, difficulty: 2 },
              { topicName: 'Relational Model', plannedHours: 4, difficulty: 2 },
            ]
          },
          {
            unitNumber: 2, unitName: 'SQL', topics: [
              { topicName: 'DDL and DML', plannedHours: 4, difficulty: 2 },
              { topicName: 'Joins and Subqueries', plannedHours: 5, difficulty: 3 },
              { topicName: 'Views and Indexes', plannedHours: 3, difficulty: 3 },
            ]
          },
          {
            unitNumber: 3, unitName: 'Normalization', topics: [
              { topicName: 'Functional Dependencies', plannedHours: 4, difficulty: 4 },
              { topicName: 'Normal Forms (1NF-BCNF)', plannedHours: 5, difficulty: 4 },
            ]
          },
          {
            unitNumber: 4, unitName: 'Transaction Management', topics: [
              { topicName: 'ACID Properties', plannedHours: 3, difficulty: 3 },
              { topicName: 'Concurrency Control', plannedHours: 5, difficulty: 4 },
              { topicName: 'Recovery', plannedHours: 3, difficulty: 3 },
            ]
          },
        ]
      },
      {
        subject: subjects['CS303']._id, academicYear: '2025-2026', semester: 4, totalRequiredHours: 45, theoryHours: 38, labHours: 7, createdBy: admin._id,
        units: [
          {
            unitNumber: 1, unitName: 'OS Fundamentals', topics: [
              { topicName: 'OS Structure and Services', plannedHours: 3, difficulty: 2 },
              { topicName: 'Process Management', plannedHours: 4, difficulty: 3 },
            ]
          },
          {
            unitNumber: 2, unitName: 'CPU Scheduling', topics: [
              { topicName: 'Scheduling Algorithms', plannedHours: 5, difficulty: 3 },
              { topicName: 'Deadlocks', plannedHours: 4, difficulty: 4 },
            ]
          },
          {
            unitNumber: 3, unitName: 'Memory Management', topics: [
              { topicName: 'Paging and Segmentation', plannedHours: 5, difficulty: 4 },
              { topicName: 'Virtual Memory', plannedHours: 4, difficulty: 4 },
            ]
          },
          {
            unitNumber: 4, unitName: 'File Systems', topics: [
              { topicName: 'File Organization', plannedHours: 3, difficulty: 2 },
              { topicName: 'Disk Scheduling', plannedHours: 3, difficulty: 3 },
            ]
          },
        ]
      },
      {
        subject: subjects['CS401']._id, academicYear: '2025-2026', semester: 5, totalRequiredHours: 45, theoryHours: 40, labHours: 5, createdBy: admin._id,
        units: [
          {
            unitNumber: 1, unitName: 'AI Foundations', topics: [
              { topicName: 'Introduction to AI', plannedHours: 2, difficulty: 1 },
              { topicName: 'Intelligent Agents', plannedHours: 3, difficulty: 2 },
            ]
          },
          {
            unitNumber: 2, unitName: 'Search', topics: [
              { topicName: 'Uninformed Search', plannedHours: 4, difficulty: 3 },
              { topicName: 'Informed Search (A*)', plannedHours: 4, difficulty: 4 },
            ]
          },
          {
            unitNumber: 3, unitName: 'Knowledge Representation', topics: [
              { topicName: 'Propositional Logic', plannedHours: 4, difficulty: 3 },
              { topicName: 'First-Order Logic', plannedHours: 5, difficulty: 4 },
            ]
          },
          {
            unitNumber: 4, unitName: 'Machine Learning Basics', topics: [
              { topicName: 'Supervised Learning', plannedHours: 4, difficulty: 3 },
              { topicName: 'Neural Networks Intro', plannedHours: 5, difficulty: 4 },
            ]
          },
        ]
      },
    ];

    let syllabiCount = 0;
    for (const syllabusData of syllabiData) {
      await SubjectSyllabus.create(syllabusData);
      syllabiCount++;
    }
    console.log(`✅ ${syllabiCount} subject syllabi created`);

    // ============================================
    // 11. CREATE TEACHING PROGRESS (ALL CLASSES)
    // ============================================
    console.log('\n📈 Creating teaching progress records for ALL classes...');

    // Define progress data for every class → every subject mapping
    // classCode → [ { subjectCode, teacherName, status, completion%, conducted, scheduled, attendance, urgency, topics } ]
    const progressMap = {
      'BTECH-CS-3A': [
        {
          sub: 'CS301', tIdx: 0, comp: 70, cond: 42, sched: 48, att: 88, status: 'on_track', urg: 3, topics: [
            { unitNumber: 1, topicName: 'Arrays and Strings', status: 'completed', hoursSpent: 3, studentMasteryRate: 85 },
            { unitNumber: 1, topicName: 'Linked Lists', status: 'completed', hoursSpent: 4, studentMasteryRate: 78 },
            { unitNumber: 2, topicName: 'Binary Trees', status: 'completed', hoursSpent: 4, studentMasteryRate: 75 },
            { unitNumber: 2, topicName: 'AVL Trees', status: 'in_progress', hoursSpent: 2, studentMasteryRate: 60 },
            { unitNumber: 3, topicName: 'Graph Representations', status: 'not_started', hoursSpent: 0 },
          ]
        },
        { sub: 'CS301L', tIdx: 0, comp: 65, cond: 13, sched: 20, att: 90, status: 'on_track', urg: 2 },
        {
          sub: 'CS302', tIdx: 1, comp: 63, cond: 38, sched: 48, att: 79, status: 'at_risk', urg: 5, topics: [
            { unitNumber: 1, topicName: 'Database Concepts', status: 'completed', hoursSpent: 3, studentMasteryRate: 90 },
            { unitNumber: 1, topicName: 'ER Model', status: 'completed', hoursSpent: 4, studentMasteryRate: 80 },
            { unitNumber: 2, topicName: 'DDL and DML', status: 'completed', hoursSpent: 4, studentMasteryRate: 85 },
            { unitNumber: 2, topicName: 'Joins and Subqueries', status: 'in_progress', hoursSpent: 3, studentMasteryRate: 65 },
          ]
        },
        { sub: 'CS302L', tIdx: 1, comp: 55, cond: 11, sched: 20, att: 85, status: 'at_risk', urg: 4 },
        { sub: 'MA301', tIdx: 8, comp: 75, cond: 34, sched: 36, att: 92, status: 'on_track', urg: 2 },
        { sub: 'EN301', tIdx: 12, comp: 80, cond: 16, sched: 24, att: 94, status: 'ahead', urg: 1 },
      ],
      'BTECH-CS-3B': [
        { sub: 'CS301', tIdx: 0, comp: 68, cond: 41, sched: 48, att: 85, status: 'on_track', urg: 3 },
        { sub: 'CS301L', tIdx: 5, comp: 60, cond: 12, sched: 20, att: 88, status: 'on_track', urg: 3 },
        { sub: 'CS302', tIdx: 1, comp: 58, cond: 35, sched: 48, att: 77, status: 'at_risk', urg: 5 },
        { sub: 'CS302L', tIdx: 4, comp: 50, cond: 10, sched: 20, att: 82, status: 'behind', urg: 6 },
        { sub: 'MA301', tIdx: 9, comp: 72, cond: 32, sched: 36, att: 90, status: 'on_track', urg: 2 },
        { sub: 'EN301', tIdx: 12, comp: 85, cond: 17, sched: 24, att: 95, status: 'ahead', urg: 1 },
      ],
      'BTECH-CS-4A': [
        {
          sub: 'CS303', tIdx: 2, comp: 78, cond: 35, sched: 36, att: 97, status: 'ahead', urg: 1, topics: [
            { unitNumber: 1, topicName: 'OS Structure and Services', status: 'completed', hoursSpent: 3, studentMasteryRate: 88 },
            { unitNumber: 1, topicName: 'Process Management', status: 'completed', hoursSpent: 4, studentMasteryRate: 82 },
            { unitNumber: 2, topicName: 'Scheduling Algorithms', status: 'completed', hoursSpent: 5, studentMasteryRate: 80 },
            { unitNumber: 2, topicName: 'Deadlocks', status: 'completed', hoursSpent: 4, studentMasteryRate: 75 },
            { unitNumber: 3, topicName: 'Paging and Segmentation', status: 'in_progress', hoursSpent: 3, studentMasteryRate: 68 },
          ]
        },
        { sub: 'CS303L', tIdx: 2, comp: 70, cond: 14, sched: 20, att: 95, status: 'on_track', urg: 2 },
        {
          sub: 'CS304', tIdx: 3, comp: 56, cond: 25, sched: 36, att: 69, status: 'behind', urg: 7, topics: [
            { unitNumber: 1, topicName: 'OSI Model', status: 'completed', hoursSpent: 3, studentMasteryRate: 78 },
            { unitNumber: 1, topicName: 'TCP/IP', status: 'completed', hoursSpent: 4, studentMasteryRate: 72 },
            { unitNumber: 2, topicName: 'Data Link Layer', status: 'in_progress', hoursSpent: 2, studentMasteryRate: 55 },
          ], cancelled: [
            { date: new Date('2026-01-20'), reason: 'Faculty on leave', rescheduled: false },
            { date: new Date('2026-02-03'), reason: 'College event', rescheduled: true },
          ]
        },
        { sub: 'CS304L', tIdx: 3, comp: 45, cond: 9, sched: 20, att: 72, status: 'behind', urg: 6 },
        { sub: 'MA302', tIdx: 9, comp: 82, cond: 37, sched: 36, att: 93, status: 'ahead', urg: 1 },
        { sub: 'MG301', tIdx: 13, comp: 90, cond: 18, sched: 24, att: 96, status: 'ahead', urg: 1 },
      ],
      'BTECH-CS-4B': [
        { sub: 'CS303', tIdx: 2, comp: 72, cond: 32, sched: 36, att: 91, status: 'on_track', urg: 2 },
        { sub: 'CS303L', tIdx: 4, comp: 65, cond: 13, sched: 20, att: 89, status: 'on_track', urg: 3 },
        { sub: 'CS304', tIdx: 3, comp: 60, cond: 27, sched: 36, att: 75, status: 'at_risk', urg: 5 },
        { sub: 'CS304L', tIdx: 14, comp: 55, cond: 11, sched: 20, att: 80, status: 'at_risk', urg: 4 },
        { sub: 'MA302', tIdx: 8, comp: 77, cond: 35, sched: 36, att: 92, status: 'on_track', urg: 2 },
        { sub: 'MG301', tIdx: 13, comp: 88, cond: 17, sched: 24, att: 95, status: 'ahead', urg: 1 },
      ],
      'BTECH-CS-5A': [
        { sub: 'CS305', tIdx: 4, comp: 84, cond: 38, sched: 40, att: 95, status: 'ahead', urg: 1 },
        { sub: 'CS306', tIdx: 5, comp: 72, cond: 35, sched: 48, att: 88, status: 'on_track', urg: 2 },
        { sub: 'CS306L', tIdx: 5, comp: 70, cond: 14, sched: 20, att: 90, status: 'on_track', urg: 2 },
        { sub: 'CS401', tIdx: 6, comp: 67, cond: 30, sched: 36, att: 83, status: 'on_track', urg: 3 },
        { sub: 'MA303', tIdx: 9, comp: 80, cond: 36, sched: 36, att: 94, status: 'ahead', urg: 1 },
      ],
      'BTECH-ECE-3A': [
        { sub: 'EC301', tIdx: 10, comp: 75, cond: 34, sched: 36, att: 91, status: 'on_track', urg: 2 },
        { sub: 'MA301', tIdx: 8, comp: 70, cond: 32, sched: 36, att: 87, status: 'on_track', urg: 3 },
        { sub: 'PH301', tIdx: 11, comp: 88, cond: 18, sched: 24, att: 96, status: 'ahead', urg: 1 },
        { sub: 'EN301', tIdx: 12, comp: 82, cond: 16, sched: 24, att: 93, status: 'ahead', urg: 1 },
        { sub: 'CS302', tIdx: 1, comp: 55, cond: 33, sched: 48, att: 75, status: 'behind', urg: 6 },
      ],
      'BCA-3': [
        { sub: 'CS301', tIdx: 0, comp: 67, cond: 40, sched: 44, att: 91, status: 'on_track', urg: 3 },
        { sub: 'CS301L', tIdx: 5, comp: 60, cond: 12, sched: 20, att: 86, status: 'on_track', urg: 3 },
        { sub: 'CS302', tIdx: 1, comp: 62, cond: 37, sched: 48, att: 83, status: 'at_risk', urg: 4 },
        { sub: 'CS302L', tIdx: 1, comp: 58, cond: 12, sched: 20, att: 84, status: 'at_risk', urg: 4 },
        { sub: 'MA301', tIdx: 8, comp: 78, cond: 35, sched: 36, att: 93, status: 'on_track', urg: 2 },
      ],
      'BCA-4': [
        { sub: 'CS303', tIdx: 2, comp: 73, cond: 33, sched: 36, att: 89, status: 'on_track', urg: 2 },
        { sub: 'CS306', tIdx: 5, comp: 68, cond: 33, sched: 48, att: 85, status: 'on_track', urg: 3 },
        { sub: 'CS306L', tIdx: 5, comp: 65, cond: 13, sched: 20, att: 87, status: 'on_track', urg: 3 },
        { sub: 'MA302', tIdx: 9, comp: 85, cond: 38, sched: 36, att: 96, status: 'ahead', urg: 1 },
        { sub: 'EN301', tIdx: 12, comp: 45, cond: 11, sched: 24, att: 70, status: 'behind', urg: 7 },
      ],
      'MTECH-CS-1': [
        { sub: 'CS401', tIdx: 6, comp: 80, cond: 36, sched: 36, att: 95, status: 'ahead', urg: 1 },
        { sub: 'CS402', tIdx: 7, comp: 77, cond: 46, sched: 50, att: 92, status: 'on_track', urg: 2 },
        { sub: 'CS403', tIdx: 14, comp: 71, cond: 32, sched: 36, att: 89, status: 'on_track', urg: 3 },
        { sub: 'CS404', tIdx: 4, comp: 60, cond: 27, sched: 36, att: 80, status: 'at_risk', urg: 5 },
        { sub: 'MA303', tIdx: 9, comp: 85, cond: 38, sched: 36, att: 97, status: 'ahead', urg: 1 },
      ],
      'MTECH-AI-1': [
        { sub: 'CS401', tIdx: 6, comp: 82, cond: 37, sched: 36, att: 96, status: 'ahead', urg: 1 },
        { sub: 'CS402', tIdx: 7, comp: 74, cond: 44, sched: 50, att: 88, status: 'on_track', urg: 2 },
        { sub: 'CS403', tIdx: 14, comp: 65, cond: 29, sched: 36, att: 83, status: 'at_risk', urg: 4 },
        { sub: 'MA303', tIdx: 9, comp: 90, cond: 40, sched: 36, att: 98, status: 'ahead', urg: 1 },
        { sub: 'CS404', tIdx: 4, comp: 52, cond: 23, sched: 36, att: 74, status: 'behind', urg: 6 },
      ],
    };

    let progressCount = 0;
    for (const [classCode, subjectsArr] of Object.entries(progressMap)) {
      const cls = classes[classCode];
      const sem = classesData.find(c => c.code === classCode)?.semester || 3;
      for (const s of subjectsArr) {
        const totalReq = s.sub.endsWith('L') ? 20 : (subjects[s.sub]?.lectures_per_week >= 4 ? 60 : 45);
        const remaining = totalReq - s.cond;
        const progRecord = {
          class: cls._id,
          subject: subjects[s.sub]._id,
          teacher: teachers[s.tIdx]._id,
          academicYear: '2025-2026',
          semester: sem,
          totalRequiredHours: totalReq,
          scheduledHours: s.sched,
          conductedHours: s.cond,
          remainingHours: Math.max(0, remaining),
          completionPercentage: s.comp,
          classesScheduled: s.sched,
          classesConducted: s.cond,
          attendanceRate: s.att,
          complianceStatus: s.status,
          urgencyScore: s.urg,
        };
        if (s.topics) progRecord.topicProgress = s.topics;
        if (s.cancelled) progRecord.classesCancelled = s.cancelled;
        await TeachingProgress.create(progRecord);
        progressCount++;
      }
    }
    console.log(`✅ ${progressCount} teaching progress records created`);

    // ============================================
    // 12. CREATE SESSION LOGS (ALL CLASSES)
    // ============================================
    console.log('\n📝 Creating session logs for all classes...');

    // Generate weekday dates from Jan 5 to Feb 17 2026
    const sessionDates = [];
    for (let d = 0; d <= 45; d++) {
      const date = new Date('2026-01-05');
      date.setDate(date.getDate() + d);
      if (date.getDay() !== 0 && date.getDay() !== 6) sessionDates.push(new Date(date));
    }

    const timeSlots = ['9:00-10:00', '10:00-11:00', '11:15-12:15', '12:15-1:15', '2:00-3:00', '3:00-4:00'];
    const sessionLogsData = [];

    // Generate sessions for every class → subject pair
    const sessionConfig = [
      // classCode, subjectCode, teacherIdx, studentCount, sessionsCount
      ['BTECH-CS-3A', 'CS301', 0, 60, 10], ['BTECH-CS-3A', 'CS302', 1, 60, 8],
      ['BTECH-CS-3A', 'CS301L', 0, 60, 4], ['BTECH-CS-3A', 'MA301', 8, 60, 7],
      ['BTECH-CS-3A', 'EN301', 12, 60, 5],
      ['BTECH-CS-3B', 'CS301', 0, 60, 9], ['BTECH-CS-3B', 'CS302', 1, 60, 7],
      ['BTECH-CS-3B', 'MA301', 9, 60, 6], ['BTECH-CS-3B', 'EN301', 12, 60, 5],
      ['BTECH-CS-4A', 'CS303', 2, 58, 9], ['BTECH-CS-4A', 'CS304', 3, 58, 6],
      ['BTECH-CS-4A', 'CS303L', 2, 58, 4], ['BTECH-CS-4A', 'MA302', 9, 58, 7],
      ['BTECH-CS-4A', 'MG301', 13, 58, 5],
      ['BTECH-CS-4B', 'CS303', 2, 58, 8], ['BTECH-CS-4B', 'CS304', 3, 58, 6],
      ['BTECH-CS-4B', 'MA302', 8, 58, 7], ['BTECH-CS-4B', 'MG301', 13, 58, 5],
      ['BTECH-CS-5A', 'CS305', 4, 55, 9], ['BTECH-CS-5A', 'CS306', 5, 55, 8],
      ['BTECH-CS-5A', 'CS401', 6, 55, 7], ['BTECH-CS-5A', 'MA303', 9, 55, 7],
      ['BTECH-ECE-3A', 'EC301', 10, 50, 7], ['BTECH-ECE-3A', 'MA301', 8, 50, 6],
      ['BTECH-ECE-3A', 'PH301', 11, 50, 5], ['BTECH-ECE-3A', 'EN301', 12, 50, 4],
      ['BTECH-ECE-3A', 'CS302', 1, 50, 6],
      ['BCA-3', 'CS301', 0, 40, 8], ['BCA-3', 'CS302', 1, 40, 7],
      ['BCA-3', 'MA301', 8, 40, 6], ['BCA-3', 'CS301L', 5, 40, 4],
      ['BCA-4', 'CS303', 2, 40, 7], ['BCA-4', 'CS306', 5, 40, 7],
      ['BCA-4', 'MA302', 9, 40, 6], ['BCA-4', 'EN301', 12, 40, 4],
      ['MTECH-CS-1', 'CS401', 6, 30, 8], ['MTECH-CS-1', 'CS402', 7, 30, 9],
      ['MTECH-CS-1', 'CS403', 14, 30, 7], ['MTECH-CS-1', 'CS404', 4, 30, 6],
      ['MTECH-CS-1', 'MA303', 9, 30, 7],
      ['MTECH-AI-1', 'CS401', 6, 25, 8], ['MTECH-AI-1', 'CS402', 7, 25, 8],
      ['MTECH-AI-1', 'CS403', 14, 25, 6], ['MTECH-AI-1', 'MA303', 9, 25, 7],
      ['MTECH-AI-1', 'CS404', 4, 25, 5],
    ];

    let dateOffset = 0;
    for (const [classCode, subCode, tIdx, totalSt, count] of sessionConfig) {
      for (let i = 0; i < Math.min(count, sessionDates.length); i++) {
        const dateIdx = (dateOffset + i * 2) % sessionDates.length;
        const isLab = subCode.endsWith('L');
        sessionLogsData.push({
          class: classes[classCode]._id,
          subject: subjects[subCode]._id,
          teacher: teachers[tIdx]._id,
          date: sessionDates[dateIdx],
          timeSlot: timeSlots[(dateOffset + i) % timeSlots.length],
          hoursSpent: isLab ? 2 : 1,
          sessionType: isLab ? 'lab' : (i === count - 1 ? 'revision' : 'theory'),
          topicsCovered: [{ unitNumber: Math.floor(i / 3) + 1, topicName: `${subCode} Topic ${i + 1}`, isCompleted: i < count - 2 }],
          totalStudents: totalSt,
          presentStudents: Math.max(Math.floor(totalSt * 0.7), totalSt - Math.floor(Math.random() * Math.floor(totalSt * 0.25))),
          difficulty: Math.min(5, Math.floor(i / 2) + 2),
          studentEngagement: Math.max(2, 5 - Math.floor(Math.random() * 3)),
          teacherNotes: i === 0 ? `First session for ${subCode}` : '',
          loggedBy: teachers[tIdx]._id,
        });
      }
      dateOffset += 3;
    }

    let sessionCount = 0;
    for (const sessionData of sessionLogsData) {
      await SessionLog.create(sessionData);
      sessionCount++;
    }
    console.log(`✅ ${sessionCount} session logs created`);

    // ============================================
    // 13. CREATE TEACHER RATINGS (ALL CLASSES)
    // ============================================
    console.log('\n⭐ Creating teacher ratings for all classes...');

    const feedbackTexts = [
      'Excellent teaching methodology!', 'Very clear explanations.', 'Could improve pace.',
      'Great at making complex topics simple.', 'Needs more practical examples.',
      'Very approachable and helpful.', 'Good but needs better organization.',
      'Outstanding teacher!', 'Average performance.', 'Highly recommended!',
      'Explains well but too fast.', 'Best teacher in the department.',
      'Really enjoyed the classes.', 'Content is well-structured.',
      'More interactive sessions would help.', 'Brilliant subject knowledge.',
      'Sometimes hard to follow.', 'Very patient with doubts.', '',
    ];

    // Generate ratings: 3 students per teacher-subject-class combo
    // Each class has defined student index ranges
    const classStudentRange = {
      'BTECH-CS-3A': [0, 1, 2, 3, 4],
      'BTECH-CS-3B': [5, 6, 7, 8, 9],
      'BTECH-CS-4A': [10, 11, 12, 13, 14],
      'BTECH-CS-4B': [15, 16, 17, 18, 19],
      'BTECH-CS-5A': [20, 21, 22, 23, 24],
      'BTECH-ECE-3A': [25, 26, 27, 28, 29],
      'BCA-3': [30, 31, 32, 33, 34],
      'BCA-4': [35, 36, 37, 38, 39],
      'MTECH-CS-1': [0, 1, 2, 3, 4],
      'MTECH-AI-1': [5, 6, 7, 8, 9],
    };

    // Teacher-subject pairs per class (from assignments, excluding labs for ratings)
    const ratingConfig = {
      'BTECH-CS-3A': [['CS301', 0], ['CS302', 1], ['MA301', 8], ['EN301', 12]],
      'BTECH-CS-3B': [['CS301', 0], ['CS302', 1], ['MA301', 9], ['EN301', 12]],
      'BTECH-CS-4A': [['CS303', 2], ['CS304', 3], ['MA302', 9], ['MG301', 13]],
      'BTECH-CS-4B': [['CS303', 2], ['CS304', 3], ['MA302', 8], ['MG301', 13]],
      'BTECH-CS-5A': [['CS305', 4], ['CS306', 5], ['CS401', 6], ['MA303', 9]],
      'BTECH-ECE-3A': [['EC301', 10], ['MA301', 8], ['PH301', 11], ['EN301', 12], ['CS302', 1]],
      'BCA-3': [['CS301', 0], ['CS302', 1], ['MA301', 8]],
      'BCA-4': [['CS303', 2], ['CS306', 5], ['MA302', 9], ['EN301', 12]],
      'MTECH-CS-1': [['CS401', 6], ['CS402', 7], ['CS403', 14], ['CS404', 4], ['MA303', 9]],
      'MTECH-AI-1': [['CS401', 6], ['CS402', 7], ['CS403', 14], ['MA303', 9], ['CS404', 4]],
    };

    // Pre-built rating distributions for variety
    const ratingPresets = [
      { o: 5, cl: 5, pu: 5, en: 5, kn: 5, ac: 5 },
      { o: 5, cl: 5, pu: 4, en: 5, kn: 5, ac: 4 },
      { o: 4, cl: 4, pu: 5, en: 4, kn: 5, ac: 4 },
      { o: 4, cl: 4, pu: 4, en: 4, kn: 4, ac: 4 },
      { o: 4, cl: 3, pu: 4, en: 4, kn: 5, ac: 3 },
      { o: 3, cl: 3, pu: 4, en: 3, kn: 4, ac: 3 },
      { o: 3, cl: 3, pu: 3, en: 3, kn: 3, ac: 3 },
      { o: 3, cl: 2, pu: 3, en: 3, kn: 4, ac: 2 },
      { o: 2, cl: 2, pu: 3, en: 2, kn: 3, ac: 2 },
      { o: 5, cl: 5, pu: 5, en: 4, kn: 5, ac: 5 },
      { o: 4, cl: 4, pu: 3, en: 4, kn: 4, ac: 4 },
      { o: 4, cl: 5, pu: 4, en: 3, kn: 5, ac: 4 },
    ];

    let ratingCount = 0;
    let presetIdx = 0;
    for (const [classCode, pairs] of Object.entries(ratingConfig)) {
      const sem = classesData.find(c => c.code === classCode)?.semester || 3;
      const studentIndices = classStudentRange[classCode];
      for (const [subCode, tIdx] of pairs) {
        // 3 students rate each teacher-subject
        for (let s = 0; s < Math.min(3, studentIndices.length); s++) {
          const preset = ratingPresets[presetIdx % ratingPresets.length];
          await TeacherRating.create({
            student: students[studentIndices[s]]._id,
            teacher: teachers[tIdx]._id,
            subject: subjects[subCode]._id,
            class: classes[classCode]._id,
            overallRating: preset.o,
            categories: { clarity: preset.cl, punctuality: preset.pu, engagement: preset.en, knowledge: preset.kn, accessibility: preset.ac },
            feedback: feedbackTexts[ratingCount % feedbackTexts.length],
            isAnonymous: ratingCount % 3 !== 0,
            academicYear: '2025-2026',
            semester: sem,
          });
          ratingCount++;
          presetIdx++;
        }
      }
    }
    console.log(`✅ ${ratingCount} teacher ratings created`);

    // ============================================
    // 14. CREATE REPORTS
    // ============================================
    console.log('\n📊 Creating reports...');

    const reportsData = [
      {
        reportType: 'timetable_utilization', title: 'Timetable Utilization Report - Jan 2026',
        generatedBy: admin._id,
        dateRange: { start: new Date('2026-01-01'), end: new Date('2026-01-31') },
        filters: { academicYear: '2025-2026', semester: 3 },
        data: {
          totalSlots: 450, usedSlots: 385, utilizationRate: 85.6,
          peakHours: ['10:00-11:00', '11:15-12:15'],
          leastUsedRooms: ['Room 301', 'Room 302'],
          departmentWise: { CSE: 88, ECE: 78, MATH: 72 }
        },
        summary: { totalRecords: 450, keyMetrics: { utilizationRate: 85.6, peakUsage: '10:00-11:00' } },
        format: 'json'
      },
      {
        reportType: 'teacher_workload', title: 'Teacher Workload Analysis - Semester 3',
        generatedBy: admin._id,
        dateRange: { start: new Date('2025-08-01'), end: new Date('2026-01-31') },
        filters: { academicYear: '2025-2026', department: departments.CSE._id },
        data: {
          averageHoursPerWeek: 18,
          maxWorkload: { teacher: 'Rajesh Kumar', hours: 22 },
          minWorkload: { teacher: 'Arun Pillai', hours: 12 },
          distribution: { '10-15hrs': 3, '15-20hrs': 8, '20-25hrs': 4 }
        },
        summary: { totalRecords: 15, keyMetrics: { avgWorkload: 18, maxWorkload: 22 } },
        format: 'json'
      },
      {
        reportType: 'room_usage', title: 'Room Usage Report - Feb 2026',
        generatedBy: admin._id,
        dateRange: { start: new Date('2026-02-01'), end: new Date('2026-02-28') },
        filters: { academicYear: '2025-2026' },
        data: {
          totalRooms: 15, activeRooms: 13,
          highUsage: ['Room 101', 'Room 102', 'Computer Lab 1'],
          lowUsage: ['Room 301', 'Electronics Lab'],
          averageOccupancy: 72.3
        },
        summary: { totalRecords: 15, keyMetrics: { activeRooms: 13, avgOccupancy: 72.3 } },
        format: 'json'
      },
      {
        reportType: 'progress_tracking', title: 'Teaching Progress Summary - Mid Semester',
        generatedBy: admin._id,
        dateRange: { start: new Date('2025-08-01'), end: new Date('2026-02-15') },
        filters: { academicYear: '2025-2026' },
        data: {
          totalSubjects: 22, onTrack: 12, ahead: 4, atRisk: 4, behind: 2,
          averageCompletion: 68.5,
          criticalSubjects: ['CS304 - Computer Networks', 'CS302 - DBMS']
        },
        summary: { totalRecords: 22, keyMetrics: { avgCompletion: 68.5, atRiskCount: 6 } },
        format: 'json'
      },
      {
        reportType: 'performance_overview', title: 'Overall Performance Report - AY 2025-2026',
        generatedBy: admin._id,
        dateRange: { start: new Date('2025-08-01'), end: new Date('2026-02-15') },
        filters: { academicYear: '2025-2026' },
        data: {
          avgTeacherRating: 4.1, totalRatings: 25,
          avgAttendance: 85.3, avgSyllabusCompletion: 68.5,
          topPerformers: ['Rajesh Kumar', 'Amit Verma', 'Vikram Patel'],
          improvementNeeded: ['Neha Singh']
        },
        summary: { totalRecords: 15, keyMetrics: { avgRating: 4.1, avgAttendance: 85.3 } },
        format: 'json'
      }
    ];

    let reportCount = 0;
    for (const reportData of reportsData) {
      await Report.create(reportData);
      reportCount++;
    }
    console.log(`✅ ${reportCount} reports created`);

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n' + '='.repeat(60));
    console.log('🎉 DATABASE SEEDED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log(`   • Departments: ${Object.keys(departments).length}`);
    console.log(`   • Programs: ${Object.keys(programs).length}`);
    console.log(`   • Classes: ${Object.keys(classes).length}`);
    console.log(`   • Subjects: ${Object.keys(subjects).length}`);
    console.log(`   • Classrooms: ${Object.keys(classrooms).length}`);
    console.log(`   • Admin: 1`);
    console.log(`   • Teachers (Users): ${teachers.length}`);
    console.log(`   • Teachers (Records): ${Object.keys(teacherRecords).length}`);
    console.log(`   • Students: ${students.length}`);
    console.log(`   • Class-Subject Assignments: ${assignmentCount}`);
    console.log(`   • Calendar Events: ${calendarCount}`);
    console.log(`   • Subject Syllabi: ${syllabiCount}`);
    console.log(`   • Teaching Progress: ${progressCount}`);
    console.log(`   • Session Logs: ${sessionCount}`);
    console.log(`   • Teacher Ratings: ${ratingCount}`);
    console.log(`   • Reports: ${reportCount}`);

    console.log('\n🔑 Login Credentials:');
    console.log('   Admin:');
    console.log('   • Email: admin@college.edu');
    console.log('   • Password: admin123');
    console.log('\n   Teacher (example):');
    console.log('   • Email: rajesh.kumar@college.edu');
    console.log('   • Password: teacher123');
    console.log('\n   Student (example):');
    console.log('   • Email: aarav.sharma@student.college.edu');
    console.log('   • Password: student123');
    console.log('\n' + '='.repeat(60));
    console.log('\n✨ Next Steps:');
    console.log('   1. Login as admin@college.edu');
    console.log('   2. Go to "Generate Timetable" section');
    console.log('   3. Select a class from the list');
    console.log('   4. Click "Generate Timetable"');
    console.log('   5. View and publish timetables');
    console.log('   6. Check Reports & Analytics dashboard');
    console.log('   7. View Teacher Progress & Ratings');
    console.log('   8. Check Academic Calendar for holidays');
    console.log('\n' + '='.repeat(60));

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
});