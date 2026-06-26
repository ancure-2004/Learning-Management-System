/**
 * Subject service — business logic + data access for subjects.
 * Throw ApiError for expected failures; the central error handler formats them.
 * (Reference implementation for the route → controller → service pattern.)
 */
const Subject = require('../models/subject.model');
const ApiError = require('../utils/ApiError');

const subjectService = {
  async list(filter = {}, { page, limit } = {}) {
    const wantsPage = page !== undefined || limit !== undefined;
    let query = Subject.find(filter).populate('department').lean();

    if (!wantsPage) return query;

    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 20));
    const [data, total] = await Promise.all([
      query.skip((p - 1) * l).limit(l),
      Subject.countDocuments(filter),
    ]);
    return { data, total, page: p, limit: l, totalPages: Math.ceil(total / l) };
  },

  async create(body) {
    const { name, code, lectures_per_week, subjectType, credits, department } = body;
    if (!name || !code || !lectures_per_week) {
      throw ApiError.badRequest('Please provide name, code, and lectures_per_week.');
    }
    const subject = new Subject({
      name,
      code,
      lectures_per_week: Number(lectures_per_week),
      ...(subjectType && { subjectType }),
      ...(credits !== undefined && { credits: Number(credits) }),
      ...(department && { department }),
    });
    await subject.save();
    return Subject.findById(subject._id).populate('department');
  },

  async update(id, body) {
    const allowed = ['name', 'code', 'lectures_per_week', 'subjectType', 'credits', 'department'];
    const updates = {};
    for (const key of allowed) {
      if (body[key] !== undefined) {
        updates[key] = (key === 'lectures_per_week' || key === 'credits') ? Number(body[key]) : body[key];
      }
    }
    const subject = await Subject.findByIdAndUpdate(
      id, { $set: updates }, { new: true, runValidators: true }
    ).populate('department');
    if (!subject) throw ApiError.notFound('Subject not found.');
    return subject;
  },

  async remove(id) {
    const subject = await Subject.findByIdAndDelete(id);
    if (!subject) throw ApiError.notFound('Subject not found.');
    return subject;
  },
};

module.exports = subjectService;
