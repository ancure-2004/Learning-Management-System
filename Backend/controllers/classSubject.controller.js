/**
 * ClassSubject controller — HTTP layer: reads the request, calls the service,
 * shapes the response. No business logic or DB access here.
 */
const asyncHandler = require('../utils/asyncHandler');
const classSubjectService = require('../services/classSubject.service');

exports.list = asyncHandler(async (req, res) => {
  const assignments = await classSubjectService.list({}, { page: req.query.page, limit: req.query.limit });
  res.json(assignments);
});

exports.listByClass = asyncHandler(async (req, res) => {
  const assignments = await classSubjectService.listByClass(req.params.classId);
  res.json(assignments);
});

exports.listByTeacher = asyncHandler(async (req, res) => {
  const assignments = await classSubjectService.listByTeacher(req.params.teacherId);
  res.json(assignments);
});

exports.listByTeacherName = asyncHandler(async (req, res) => {
  const assignments = await classSubjectService.listByTeacherName(
    req.params.firstName,
    req.params.lastName
  );
  res.json(assignments);
});

exports.create = asyncHandler(async (req, res) => {
  const assignment = await classSubjectService.create(req.body);
  res.status(201).json({
    message: 'Subject assigned to class successfully',
    assignment,
  });
});

exports.update = asyncHandler(async (req, res) => {
  const assignment = await classSubjectService.update(req.params.id, req.body);
  res.json({ message: 'Assignment updated successfully', assignment });
});

exports.remove = asyncHandler(async (req, res) => {
  await classSubjectService.remove(req.params.id);
  res.json({ message: 'Assignment deleted successfully' });
});
