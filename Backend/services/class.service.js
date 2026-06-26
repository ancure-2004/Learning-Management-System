/**
 * Class service — business logic + data access for classes.
 * Throw ApiError for expected failures; the central error handler formats them.
 */
const mongoose = require('mongoose');
const Class = require('../models/class.model');
const ApiError = require('../utils/ApiError');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const classService = {
  async list(filter = {}, { page, limit } = {}) {
    const wantsPage = page !== undefined || limit !== undefined;
    let query = Class.find(filter)
      .populate('program', 'name code')
      .populate('assignedRoom', 'name capacity')
      .sort({ semester: 1, section: 1 })
      .lean();

    if (!wantsPage) return query;

    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 20));
    const [data, total] = await Promise.all([
      query.skip((p - 1) * l).limit(l),
      Class.countDocuments(filter),
    ]);
    return { data, total, page: p, limit: l, totalPages: Math.ceil(total / l) };
  },

  listByProgram(programId) {
    if (!isValidId(programId)) {
      throw ApiError.badRequest('Invalid program ID');
    }
    return Class.find({ program: programId })
      .populate('program', 'name code')
      .populate('assignedRoom', 'name capacity')
      .sort({ semester: 1, section: 1 })
      .lean();
  },

  async getById(id) {
    if (!isValidId(id)) {
      throw ApiError.badRequest('Invalid class ID');
    }
    const classData = await Class.findById(id)
      .populate('program', 'name code')
      .populate('assignedRoom', 'name capacity')
      .lean();
    if (!classData) throw ApiError.notFound('Class not found');
    return classData;
  },

  async create(body) {
    const { name, code, program, semester, section, assignedRoom, studentCount } = body;
    if (!name || !code || !program || !semester) {
      throw ApiError.badRequest('Name, code, program, and semester are required');
    }
    try {
      const newClass = new Class({
        name,
        code: code.toUpperCase(),
        program,
        semester,
        section: section?.toUpperCase() || 'A',
        assignedRoom: assignedRoom || null,
        studentCount: studentCount || 0,
      });
      await newClass.save();
      return Class.findById(newClass._id)
        .populate('program', 'name code')
        .populate('assignedRoom', 'name capacity');
    } catch (error) {
      if (error.code === 11000) {
        throw ApiError.badRequest('Class with this code already exists');
      }
      throw error;
    }
  },

  async update(id, body) {
    if (!isValidId(id)) {
      throw ApiError.badRequest('Invalid class ID');
    }
    const { name, code, program, semester, section, assignedRoom, studentCount } = body;
    try {
      const updatedClass = await Class.findByIdAndUpdate(
        id,
        { name, code: code?.toUpperCase(), program, semester, section: section?.toUpperCase(), assignedRoom, studentCount },
        { new: true, runValidators: true }
      ).populate('program', 'name code').populate('assignedRoom', 'name capacity');
      if (!updatedClass) throw ApiError.notFound('Class not found');
      return updatedClass;
    } catch (error) {
      if (error.code === 11000) {
        throw ApiError.badRequest('Class with this code already exists');
      }
      throw error;
    }
  },

  async remove(id) {
    if (!isValidId(id)) {
      throw ApiError.badRequest('Invalid class ID');
    }
    const classData = await Class.findByIdAndDelete(id);
    if (!classData) throw ApiError.notFound('Class not found');
    return classData;
  },
};

module.exports = classService;
