/**
 * Classroom service — business logic + data access for classrooms.
 * Throw ApiError for expected failures; the central error handler formats them.
 */
const mongoose = require('mongoose');
const Classroom = require('../models/classroom.model');
const ApiError = require('../utils/ApiError');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const classroomService = {
  async list(filter = {}, { page, limit } = {}) {
    const wantsPage = page !== undefined || limit !== undefined;
    let query = Classroom.find(filter).lean();

    if (!wantsPage) return query;

    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 20));
    const [data, total] = await Promise.all([
      query.skip((p - 1) * l).limit(l),
      Classroom.countDocuments(filter),
    ]);
    return { data, total, page: p, limit: l, totalPages: Math.ceil(total / l) };
  },

  async create(body) {
    const { name, capacity, type } = body;

    if (!name) throw ApiError.badRequest('Classroom name is required.');
    if (capacity === undefined || capacity === null || capacity === '') {
      throw ApiError.badRequest('Classroom capacity is required.');
    }
    const cap = Number(capacity);
    if (isNaN(cap) || cap <= 0) {
      throw ApiError.badRequest('Capacity must be a positive number.');
    }

    const newClassroom = new Classroom({
      name,
      capacity: cap,
      ...(type && { type }),
    });

    try {
      await newClassroom.save();
    } catch (err) {
      if (err.code === 11000) {
        throw ApiError.badRequest('A classroom with this name already exists.');
      }
      throw ApiError.badRequest(err.message);
    }
    return newClassroom;
  },

  async update(id, body) {
    if (!isValidId(id)) {
      throw ApiError.badRequest('Invalid classroom ID.');
    }

    const { name, capacity, type } = body;

    if (capacity !== undefined) {
      const cap = Number(capacity);
      if (isNaN(cap) || cap <= 0) {
        throw ApiError.badRequest('Capacity must be a positive number.');
      }
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (capacity !== undefined) updates.capacity = Number(capacity);
    if (type !== undefined) updates.type = type;

    let classroom;
    try {
      classroom = await Classroom.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      );
    } catch (err) {
      throw ApiError.badRequest(err.message);
    }

    if (!classroom) throw ApiError.notFound('Classroom not found.');
    return classroom;
  },

  async remove(id) {
    if (!isValidId(id)) {
      throw ApiError.badRequest('Invalid classroom ID.');
    }
    const classroom = await Classroom.findByIdAndDelete(id);
    if (!classroom) throw ApiError.notFound('Classroom not found.');
    return classroom;
  },
};

module.exports = classroomService;
