/**
 * Attendance service — business logic + data access for attendance.
 * Throw ApiError for expected failures; the central error handler formats them.
 */
const mongoose = require('mongoose');
const Attendance = require('../models/attendance.model');
const User       = require('../models/user.model');
const Class      = require('../models/class.model');
const Subject    = require('../models/subject.model');
const ApiError   = require('../utils/ApiError');

const isId = (id) => mongoose.Types.ObjectId.isValid(id);

const attendanceService = {
  /* GET /attendance/class/:classId/students */
  async classStudents(classId) {
    if (!isId(classId)) throw ApiError.badRequest('Invalid class ID');

    const cls = await Class.findById(classId).populate('program', 'code name').lean();
    if (!cls) throw ApiError.notFound('Class not found');

    const students = await User.find({
      role:     'student',
      program:  cls.program.code,
      semester: cls.semester,
      section:  cls.section,
      isActive: true,
    }).select('firstName lastName email enrollmentNumber').sort({ firstName: 1 }).lean();

    return {
      class: {
        _id:      cls._id,
        name:     cls.name,
        code:     cls.code,
        semester: cls.semester,
        section:  cls.section,
        program:  cls.program.name,
      },
      totalStudents: students.length,
      students,
    };
  },

  /* POST /attendance/mark */
  async mark(body, markedBy) {
    const { classId, subjectId, teacherId, date, timeSlot, students } = body;

    if (!classId || !subjectId || !teacherId || !date || !timeSlot || !Array.isArray(students))
      throw ApiError.badRequest('classId, subjectId, teacherId, date, timeSlot, students[] required');

    if (students.length === 0)
      throw ApiError.badRequest('students array is empty');

    const sessionDate = new Date(date);

    const ops = students.map(({ studentId, status }) => ({
      updateOne: {
        filter: {
          student:  studentId,
          class:    classId,
          subject:  subjectId,
          date:     sessionDate,
          timeSlot,
        },
        update: {
          $set: {
            student:  studentId,
            class:    classId,
            subject:  subjectId,
            teacher:  teacherId,
            date:     sessionDate,
            timeSlot,
            status:   status || 'absent',
            markedBy,
          },
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(ops);

    const presentCount = students.filter(s => s.status === 'present').length;
    const absentCount  = students.length - presentCount;

    return {
      message:  'Attendance marked successfully',
      total:    students.length,
      present:  presentCount,
      absent:   absentCount,
      date:     sessionDate,
      timeSlot,
    };
  },

  /* GET /attendance/sessions/:classId */
  async sessions(classId, query) {
    if (!isId(classId)) throw ApiError.badRequest('Invalid class ID');

    const match = { class: new mongoose.Types.ObjectId(classId) };
    if (query.subjectId && isId(query.subjectId))
      match.subject = new mongoose.Types.ObjectId(query.subjectId);

    const sessions = await Attendance.aggregate([
      { $match: match },
      {
        $group: {
          _id:      { date: '$date', timeSlot: '$timeSlot', subject: '$subject' },
          present:  { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absent:   { $sum: { $cond: [{ $eq: ['$status', 'absent'] },  1, 0] } },
          total:    { $sum: 1 },
          markedBy: { $first: '$markedBy' },
        },
      },
      { $sort: { '_id.date': -1 } },
      { $limit: parseInt(query.limit) || 20 },
    ]);

    const subjectIds = [...new Set(sessions.map(s => s._id.subject?.toString()).filter(Boolean))];
    const subjects   = await Subject.find({ _id: { $in: subjectIds } }).select('name code').lean();
    const subjMap    = Object.fromEntries(subjects.map(s => [s._id.toString(), s]));

    const result = sessions.map(s => ({
      date:        s._id.date,
      timeSlot:    s._id.timeSlot,
      subject:     s._id.subject ? subjMap[s._id.subject.toString()] : null,
      present:     s.present,
      absent:      s.absent,
      total:       s.total,
      attendancePct: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0,
    }));

    return { sessions: result, total: result.length };
  },

  /* GET /attendance/summary/:classId */
  async summary(classId, query) {
    if (!isId(classId)) throw ApiError.badRequest('Invalid class ID');

    const match = { class: new mongoose.Types.ObjectId(classId) };
    if (query.subjectId && isId(query.subjectId))
      match.subject = new mongoose.Types.ObjectId(query.subjectId);

    const stats = await Attendance.aggregate([
      { $match: match },
      {
        $group: {
          _id:     '$student',
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          total:   { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const studentIds = stats.map(s => s._id);
    const students   = await User.find({ _id: { $in: studentIds } })
      .select('firstName lastName enrollmentNumber').lean();
    const studentMap = Object.fromEntries(students.map(s => [s._id.toString(), s]));

    const summary = stats.map(s => {
      const stu    = studentMap[s._id.toString()];
      const pct    = s.total > 0 ? Math.round((s.present / s.total) * 100) : 0;
      return {
        studentId:        s._id,
        name:             stu ? `${stu.firstName} ${stu.lastName}` : 'Unknown',
        enrollmentNumber: stu?.enrollmentNumber || '—',
        present:          s.present,
        absent:           s.total - s.present,
        total:            s.total,
        percentage:       pct,
        status:           pct >= 75 ? 'good' : pct >= 60 ? 'low' : 'critical',
      };
    });

    return { classId, summary, totalStudents: summary.length };
  },

  /* GET /attendance/my */
  async my(studentId) {
    const stats = await Attendance.aggregate([
      { $match: { student: studentId } },
      {
        $group: {
          _id:     '$subject',
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          total:   { $sum: 1 },
        },
      },
    ]);

    const subjectIds = stats.map(s => s._id);
    const subjects   = await Subject.find({ _id: { $in: subjectIds } }).select('name code').lean();
    const subjMap    = Object.fromEntries(subjects.map(s => [s._id.toString(), s]));

    const result = stats.map(s => ({
      subject:    subjMap[s._id.toString()],
      present:    s.present,
      absent:     s.total - s.present,
      total:      s.total,
      percentage: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0,
    }));

    const overall = result.length
      ? Math.round(result.reduce((a, s) => a + s.percentage, 0) / result.length)
      : 0;

    return { overall, bySubject: result };
  },

  /* GET /attendance/teacher/:teacherId/recent */
  async teacherRecent(teacherId) {
    if (!isId(teacherId)) throw ApiError.badRequest('Invalid teacher ID');

    const sessions = await Attendance.aggregate([
      { $match: { teacher: new mongoose.Types.ObjectId(teacherId) } },
      {
        $group: {
          _id: { date: '$date', timeSlot: '$timeSlot', class: '$class', subject: '$subject' },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          total:   { $sum: 1 },
        },
      },
      { $sort: { '_id.date': -1 } },
      { $limit: 10 },
    ]);

    const classIds   = [...new Set(sessions.map(s => s._id.class?.toString()))];
    const subjectIds = [...new Set(sessions.map(s => s._id.subject?.toString()))];
    const [classes, subjects] = await Promise.all([
      Class.find({ _id: { $in: classIds } }).select('name code').lean(),
      Subject.find({ _id: { $in: subjectIds } }).select('name code').lean(),
    ]);
    const classMap = Object.fromEntries(classes.map(c => [c._id.toString(), c]));
    const subjMap  = Object.fromEntries(subjects.map(s => [s._id.toString(), s]));

    const result = sessions.map(s => ({
      date:        s._id.date,
      timeSlot:    s._id.timeSlot,
      class:       classMap[s._id.class?.toString()],
      subject:     subjMap[s._id.subject?.toString()],
      present:     s.present,
      total:       s.total,
      attendancePct: s.total ? Math.round((s.present / s.total) * 100) : 0,
    }));

    return { recent: result };
  },
};

module.exports = attendanceService;
