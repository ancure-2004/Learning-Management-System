/**
 * Department service — business logic + data access for departments.
 * Throw ApiError for expected failures; the central error handler formats them.
 */
const mongoose = require('mongoose');
const Department = require('../models/department.model');
const ApiError = require('../utils/ApiError');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const departmentService = {
  async list(filter = {}, { page, limit } = {}) {
    const wantsPage = page !== undefined || limit !== undefined;
    let query = Department.find(filter).sort({ name: 1 }).lean();

    if (!wantsPage) return query;

    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 20));
    const [data, total] = await Promise.all([
      query.skip((p - 1) * l).limit(l),
      Department.countDocuments(filter),
    ]);
    return { data, total, page: p, limit: l, totalPages: Math.ceil(total / l) };
  },

  async getOne(id) {
    if (!isValidId(id)) {
      throw ApiError.badRequest('Invalid department ID');
    }
    const department = await Department.findById(id).lean();
    if (!department) throw ApiError.notFound('Department not found');
    return department;
  },

  async create(body) {
    const { name, code, description } = body;
    if (!name || !code) {
      throw ApiError.badRequest('Name and code are required');
    }
    const newDepartment = new Department({ name, code: code.toUpperCase(), description });
    try {
      await newDepartment.save();
    } catch (error) {
      if (error.code === 11000) {
        throw ApiError.badRequest('Department with this name or code already exists');
      }
      throw error;
    }
    return newDepartment;
  },

  async update(id, body) {
    if (!isValidId(id)) {
      throw ApiError.badRequest('Invalid department ID');
    }
    const { name, code, description } = body;
    let updatedDepartment;
    try {
      updatedDepartment = await Department.findByIdAndUpdate(
        id,
        { name, code: code?.toUpperCase(), description },
        { new: true, runValidators: true }
      );
    } catch (error) {
      if (error.code === 11000) {
        throw ApiError.badRequest('Department with this name or code already exists');
      }
      throw error;
    }
    if (!updatedDepartment) throw ApiError.notFound('Department not found');
    return updatedDepartment;
  },

  async remove(id) {
    if (!isValidId(id)) {
      throw ApiError.badRequest('Invalid department ID');
    }
    const department = await Department.findByIdAndDelete(id);
    if (!department) throw ApiError.notFound('Department not found');
    return department;
  },
};

module.exports = departmentService;
