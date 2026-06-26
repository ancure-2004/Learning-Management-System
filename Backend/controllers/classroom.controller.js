/**
 * Classroom controller — HTTP layer: reads the request, calls the service,
 * shapes the response. No business logic or DB access here.
 */
const asyncHandler = require('../utils/asyncHandler');
const classroomService = require('../services/classroom.service');

exports.list = asyncHandler(async (req, res) => {
  const classrooms = await classroomService.list({}, { page: req.query.page, limit: req.query.limit });
  res.json(classrooms);
});

exports.create = asyncHandler(async (req, res) => {
  const classroom = await classroomService.create(req.body);
  res.status(201).json({ message: 'Classroom added successfully', classroom });
});

exports.update = asyncHandler(async (req, res) => {
  const classroom = await classroomService.update(req.params.id, req.body);
  res.json({ message: 'Classroom updated successfully', classroom });
});

exports.remove = asyncHandler(async (req, res) => {
  const classroom = await classroomService.remove(req.params.id);
  res.json({ message: 'Classroom deleted successfully', classroom });
});
