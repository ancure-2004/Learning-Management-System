/**
 * Teacher controller — HTTP layer: reads the request, calls the service,
 * shapes the response. No business logic or DB access here.
 */
const asyncHandler = require('../utils/asyncHandler');
const teacherService = require('../services/teacher.service');

exports.list = asyncHandler(async (req, res) => {
  const teachers = await teacherService.list({}, { page: req.query.page, limit: req.query.limit });
  res.json(teachers);
});

exports.create = asyncHandler(async (req, res) => {
  const teacher = await teacherService.create(req.body);
  res.status(201).json({ message: 'Teacher added successfully', teacher });
});

exports.update = asyncHandler(async (req, res) => {
  const teacher = await teacherService.update(req.params.id, req.body);
  res.json({ message: 'Teacher updated successfully', teacher });
});

exports.getByUser = asyncHandler(async (req, res) => {
  const teacher = await teacherService.getByUser(req.params.userId);
  res.json(teacher);
});

exports.getByName = asyncHandler(async (req, res) => {
  const teacher = await teacherService.getByName(req.params.name);
  res.json(teacher);
});

exports.remove = asyncHandler(async (req, res) => {
  const teacher = await teacherService.remove(req.params.id);
  res.json({ message: 'Teacher deleted successfully', teacher });
});
