/**
 * Program service — business logic + data access for programs.
 * Throw ApiError for expected failures; the central error handler formats them.
 */
const mongoose = require('mongoose');
const Program = require('../models/program.model');
const ApiError = require('../utils/ApiError');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const programService = {
  async list(filter = {}, { page, limit } = {}) {
    const wantsPage = page !== undefined || limit !== undefined;
    let query = Program.find(filter).populate('department', 'name code').sort({ name: 1 }).lean();

    if (!wantsPage) return query;

    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 20));
    const [data, total] = await Promise.all([
      query.skip((p - 1) * l).limit(l),
      Program.countDocuments(filter),
    ]);
    return { data, total, page: p, limit: l, totalPages: Math.ceil(total / l) };
  },

  listByDepartment(departmentId) {
    if (!isValidId(departmentId)) {
      throw ApiError.badRequest('Invalid department ID');
    }
    return Program.find({ department: departmentId })
      .populate('department', 'name code')
      .sort({ name: 1 })
      .lean();
  },

  async getById(id) {
    if (!isValidId(id)) {
      throw ApiError.badRequest('Invalid program ID');
    }
    const program = await Program.findById(id).populate('department', 'name code').lean();
    if (!program) throw ApiError.notFound('Program not found');
    return program;
  },

  async create(body) {
    const { name, code, department, duration, totalSemesters } = body;
    if (!name || !code || !department || !duration || !totalSemesters) {
      throw ApiError.badRequest('All fields are required');
    }
    try {
      const newProgram = new Program({ name, code: code.toUpperCase(), department, duration, totalSemesters });
      await newProgram.save();
      return Program.findById(newProgram._id).populate('department', 'name code');
    } catch (error) {
      if (error.code === 11000) {
        throw ApiError.badRequest('Program with this code already exists');
      }
      throw error;
    }
  },

  async update(id, body) {
    if (!isValidId(id)) {
      throw ApiError.badRequest('Invalid program ID');
    }
    const { name, code, department, duration, totalSemesters } = body;
    try {
      const updatedProgram = await Program.findByIdAndUpdate(
        id,
        { name, code: code?.toUpperCase(), department, duration, totalSemesters },
        { new: true, runValidators: true }
      ).populate('department', 'name code');
      if (!updatedProgram) throw ApiError.notFound('Program not found');
      return updatedProgram;
    } catch (error) {
      if (error.code === 11000) {
        throw ApiError.badRequest('Program with this code already exists');
      }
      throw error;
    }
  },

  async remove(id) {
    if (!isValidId(id)) {
      throw ApiError.badRequest('Invalid program ID');
    }
    const program = await Program.findByIdAndDelete(id);
    if (!program) throw ApiError.notFound('Program not found');
    return program;
  },
};

module.exports = programService;
