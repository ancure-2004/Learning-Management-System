/**
 * Subject controller — HTTP layer: reads the request, calls the service,
 * shapes the response. No business logic or DB access here.
 * (Reference implementation for the route → controller → service pattern.)
 */
const asyncHandler = require('../utils/asyncHandler');
const subjectService = require('../services/subject.service');

exports.list = asyncHandler(async (req, res) => {
  const subjects = await subjectService.list({}, { page: req.query.page, limit: req.query.limit });
  res.json(subjects);
});

exports.create = asyncHandler(async (req, res) => {
  const subject = await subjectService.create(req.body);
  res.status(201).json({ message: 'Subject added successfully', subject });
});

exports.update = asyncHandler(async (req, res) => {
  const subject = await subjectService.update(req.params.id, req.body);
  res.json({ message: 'Subject updated successfully', subject });
});

exports.remove = asyncHandler(async (req, res) => {
  const subject = await subjectService.remove(req.params.id);
  res.json({ message: 'Subject deleted successfully', subject });
});
