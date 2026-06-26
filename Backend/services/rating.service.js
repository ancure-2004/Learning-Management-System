/**
 * Rating service — business logic + data access for teacher ratings.
 * Throw ApiError for expected failures; the central error handler formats them.
 */
const TeacherRating = require('../models/teacherRating.model');
const User = require('../models/user.model');
const Class = require('../models/class.model');
const ClassSubject = require('../models/classSubject.model');
const Program = require('../models/program.model');
const ApiError = require('../utils/ApiError');

// Helper: check if student can rate teacher
async function canStudentRateTeacher(studentId, teacherId, subjectId, classId) {
  try {
    const student = await User.findById(studentId).lean();
    if (!student || student.role !== 'student') {
      return { canRate: false, reason: 'Invalid student' };
    }
    const assignment = await ClassSubject.findOne({ class: classId, subject: subjectId, teacher: teacherId }).lean();
    if (!assignment) {
      return { canRate: false, reason: 'Teacher does not teach this subject to this class' };
    }
    return { canRate: true };
  } catch (error) {
    return { canRate: false, reason: 'Error validating' };
  }
}

const ratingService = {
  async submit(studentId, body) {
    const {
      teacherId,
      subjectId,
      classId,
      overallRating,
      categories = {},
      feedback = '',
      isAnonymous = true,
      academicYear,
      semester
    } = body;

    if (!teacherId || !subjectId || !classId || !overallRating || !academicYear || !semester) {
      throw ApiError.badRequest('Missing required fields');
    }
    if (overallRating < 1 || overallRating > 5) {
      throw ApiError.badRequest('Overall rating must be between 1 and 5');
    }
    if (studentId === teacherId) {
      throw ApiError.badRequest('You cannot rate yourself');
    }

    const validation = await canStudentRateTeacher(studentId, teacherId, subjectId, classId);
    if (!validation.canRate) {
      throw new ApiError(403, validation.reason);
    }

    const existingRating = await TeacherRating.findOne({
      student: studentId,
      teacher: teacherId,
      subject: subjectId,
      academicYear,
      semester
    });

    if (existingRating) {
      existingRating.overallRating = overallRating;
      existingRating.categories = categories;
      existingRating.feedback = feedback;
      existingRating.isAnonymous = isAnonymous;
      existingRating.class = classId;
      await existingRating.save();
      return { updated: true, rating: existingRating };
    }

    const newRating = new TeacherRating({
      student: studentId,
      teacher: teacherId,
      subject: subjectId,
      class: classId,
      overallRating,
      categories,
      feedback,
      isAnonymous,
      academicYear,
      semester
    });
    await newRating.save();
    return { updated: false, rating: newRating };
  },

  async getTeacherRatings(teacherId, query) {
    const { page = 1, limit = 10, subjectId, academicYear } = query;

    const find = { teacher: teacherId };
    if (subjectId) find.subject = subjectId;
    if (academicYear) find.academicYear = academicYear;

    const ratings = await TeacherRating.find(find)
      .populate('subject', 'name code')
      .populate('class', 'name code')
      .populate({ path: 'student', select: 'firstName lastName' })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const processedRatings = ratings.map(rating => {
      const r = { ...rating };
      if (r.isAnonymous) delete r.student;
      return r;
    });

    const total = await TeacherRating.countDocuments(find);
    return { ratings: processedRatings, totalPages: Math.ceil(total / limit), currentPage: page, total };
  },

  getAggregate(teacherId, query) {
    const { subjectId, academicYear } = query;
    return TeacherRating.calculateAggregateRating(teacherId, subjectId, academicYear);
  },

  async getTrends(teacherId, query) {
    const { limit = 6 } = query;
    const trendData = await TeacherRating.getTrendData(teacherId, parseInt(limit));
    return { trends: trendData };
  },

  async getMyTeachers(studentId, query) {
    const { academicYear, semester } = query;

    const student = await User.findById(studentId).lean();
    if (!student || student.role !== 'student') {
      throw ApiError.notFound('Student not found');
    }

    const program = await Program.findOne({
      $or: [{ code: student.program }, { name: student.program }]
    }).lean();
    if (!program) {
      throw ApiError.notFound(`Program '${student.program}' not found.`);
    }

    const studentClass = await Class.findOne({
      program: program._id,
      semester: student.semester,
      section: student.section
    }).lean();
    if (!studentClass) {
      throw ApiError.notFound('No class found for this student.');
    }

    const assignments = await ClassSubject.find({ class: studentClass._id })
      .populate('subject', 'name code')
      .populate('teacher', 'name')
      .lean();

    if (assignments.length === 0) {
      return {
        teachers: [],
        studentClass: { _id: studentClass._id, name: studentClass.name, code: studentClass.code },
        message: 'No subject assignments found for this class.'
      };
    }

    const teachersWithRatings = await Promise.all(
      assignments.map(async (assignment) => {
        const existingRating = await TeacherRating.findOne({
          student: studentId,
          teacher: assignment.teacher._id,
          subject: assignment.subject._id,
          academicYear: academicYear || new Date().getFullYear().toString(),
          semester: semester || student.semester
        }).lean();
        return {
          teacher: assignment.teacher,
          subject: assignment.subject,
          class: studentClass,
          hasRated: !!existingRating,
          ratingId: existingRating?._id,
          currentRating: existingRating?.overallRating
        };
      })
    );

    return {
      teachers: teachersWithRatings,
      studentClass: { _id: studentClass._id, name: studentClass.name, code: studentClass.code }
    };
  },

  async getDepartmentAverage(departmentId, query) {
    const { academicYear } = query;

    const teachers = await User.find({ role: 'teacher', department: departmentId }).lean();
    if (teachers.length === 0) return { averageRating: 0, totalRatings: 0 };

    const teacherIds = teachers.map(t => t._id);
    const find = { teacher: { $in: teacherIds } };
    if (academicYear) find.academicYear = academicYear;

    const ratings = await TeacherRating.find(find).lean();
    if (ratings.length === 0) return { averageRating: 0, totalRatings: 0 };

    const sum = ratings.reduce((acc, r) => acc + r.overallRating, 0);
    return {
      averageRating: parseFloat((sum / ratings.length).toFixed(2)),
      totalRatings: ratings.length,
      totalTeachers: teachers.length
    };
  },
};

module.exports = ratingService;
