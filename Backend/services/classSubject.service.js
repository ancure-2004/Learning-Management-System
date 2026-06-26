/**
 * ClassSubject service — business logic + data access for class-subject assignments.
 * Throw ApiError for expected failures; the central error handler formats them.
 */
const ClassSubject = require('../models/classSubject.model');
const Teacher = require('../models/teacher.model');
const ApiError = require('../utils/ApiError');

const classSubjectService = {
  async list(filter = {}, { page, limit } = {}) {
    const wantsPage = page !== undefined || limit !== undefined;
    let query = ClassSubject.find(filter)
      .populate('class', 'name code semester section')
      .populate('subject', 'name code lectures_per_week')
      .populate('teacher', 'name')
      .populate('preferredRoom', 'name capacity')
      .lean();

    if (!wantsPage) return query;

    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 20));
    const [data, total] = await Promise.all([
      query.skip((p - 1) * l).limit(l),
      ClassSubject.countDocuments(filter),
    ]);
    return { data, total, page: p, limit: l, totalPages: Math.ceil(total / l) };
  },

  listByClass(classId) {
    return ClassSubject.find({ class: classId })
      .populate('subject', 'name code lectures_per_week subjectType credits')
      .populate('teacher', 'name')
      .populate('preferredRoom', 'name capacity')
      .lean();
  },

  listByTeacher(teacherId) {
    return ClassSubject.find({ teacher: teacherId })
      .populate('class', 'name code semester section')
      .populate('subject', 'name code lectures_per_week')
      .populate('preferredRoom', 'name capacity')
      .lean();
  },

  async listByTeacherName(firstName, lastName) {
    const teacherName = `${firstName} ${lastName}`;

    // First, find the Teacher document that matches this name
    const teacher = await Teacher.findOne({ name: teacherName }).lean();

    if (!teacher) {
      return []; // Return empty array if teacher not found
    }

    // Then, find all class-subject assignments for this teacher
    return ClassSubject.find({ teacher: teacher._id })
      .populate('class', 'name code semester section')
      .populate('subject', 'name code lectures_per_week')
      .populate('teacher', 'name')
      .populate('preferredRoom', 'name capacity')
      .lean();
  },

  async create(body) {
    const { classId, subjectId, teacherId, preferredRoom } = body;

    if (!classId || !subjectId || !teacherId) {
      throw ApiError.badRequest('Class, subject, and teacher are required');
    }

    // Check if assignment already exists
    const existing = await ClassSubject.findOne({
      class: classId,
      subject: subjectId,
    });

    if (existing) {
      throw ApiError.badRequest('This subject is already assigned to this class');
    }

    try {
      const newAssignment = new ClassSubject({
        class: classId,
        subject: subjectId,
        teacher: teacherId,
        preferredRoom: preferredRoom || null,
      });

      await newAssignment.save();
      return ClassSubject.findById(newAssignment._id)
        .populate('class', 'name code')
        .populate('subject', 'name code lectures_per_week')
        .populate('teacher', 'name')
        .populate('preferredRoom', 'name capacity');
    } catch (error) {
      if (error.code === 11000) {
        throw ApiError.badRequest('This subject is already assigned to this class');
      }
      throw error;
    }
  },

  async update(id, body) {
    const { teacherId, preferredRoom } = body;

    const updatedAssignment = await ClassSubject.findByIdAndUpdate(
      id,
      { teacher: teacherId, preferredRoom },
      { new: true, runValidators: true }
    ).populate('class', 'name code')
      .populate('subject', 'name code lectures_per_week')
      .populate('teacher', 'name')
      .populate('preferredRoom', 'name capacity');

    if (!updatedAssignment) {
      throw ApiError.notFound('Assignment not found');
    }

    return updatedAssignment;
  },

  async remove(id) {
    const assignment = await ClassSubject.findByIdAndDelete(id);

    if (!assignment) {
      throw ApiError.notFound('Assignment not found');
    }

    return assignment;
  },
};

module.exports = classSubjectService;
