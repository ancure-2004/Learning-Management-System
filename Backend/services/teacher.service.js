/**
 * Teacher service — business logic + data access for teachers.
 * Throw ApiError for expected failures; the central error handler formats them.
 */
const mongoose = require('mongoose');
const Teacher = require('../models/teacher.model');
const ApiError = require('../utils/ApiError');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const teacherService = {
  async list(filter = {}, { page, limit } = {}) {
    const wantsPage = page !== undefined || limit !== undefined;
    let query = Teacher.find(filter).lean();

    if (!wantsPage) return query;

    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 20));
    const [data, total] = await Promise.all([
      query.skip((p - 1) * l).limit(l),
      Teacher.countDocuments(filter),
    ]);
    return { data, total, page: p, limit: l, totalPages: Math.ceil(total / l) };
  },

  async create(body) {
    const { name, email, department, maxHoursPerWeek, user } = body;

    if (!name) {
      throw ApiError.badRequest('Teacher name is required.');
    }

    const newTeacher = new Teacher({
      name,
      ...(email && { email }),
      ...(department && { department }),
      ...(maxHoursPerWeek !== undefined && { maxHoursPerWeek: Number(maxHoursPerWeek) }),
      ...(user && { user }),
    });

    try {
      await newTeacher.save();
    } catch (err) {
      if (err.code === 11000) {
        throw ApiError.badRequest('A teacher with this name already exists.');
      }
      throw ApiError.badRequest(err.message);
    }
    return newTeacher;
  },

  async update(id, body) {
    if (!isValidId(id)) {
      throw ApiError.badRequest('Invalid teacher ID.');
    }

    const updates = {};
    const { name, email, department, maxHoursPerWeek, user } = body;
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (department !== undefined) updates.department = department;
    if (maxHoursPerWeek !== undefined) updates.maxHoursPerWeek = Number(maxHoursPerWeek);
    if (user !== undefined) updates.user = user;

    let teacher;
    try {
      teacher = await Teacher.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      );
    } catch (err) {
      throw ApiError.badRequest(err.message);
    }

    if (!teacher) throw ApiError.notFound('Teacher not found.');
    return teacher;
  },

  async getByUser(userId) {
    if (!isValidId(userId)) {
      throw ApiError.badRequest('Invalid user ID.');
    }
    const teacher = await Teacher.findOne({ user: userId }).lean();
    if (!teacher) {
      throw ApiError.notFound('Teacher record not found for this user');
    }
    return teacher;
  },

  async getByName(name) {
    let teacher = await Teacher.findOne({ name }).lean();
    if (!teacher) {
      teacher = await Teacher.findOne({
        name: { $regex: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      }).lean();
    }
    if (!teacher) throw ApiError.notFound('Teacher not found');
    return teacher;
  },

  async remove(id) {
    if (!isValidId(id)) {
      throw ApiError.badRequest('Invalid teacher ID.');
    }
    const teacher = await Teacher.findByIdAndDelete(id);
    if (!teacher) throw ApiError.notFound('Teacher not found.');
    return teacher;
  },
};

module.exports = teacherService;
