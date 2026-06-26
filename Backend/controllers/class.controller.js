/**
 * Class controller — HTTP layer: reads the request, calls the service,
 * shapes the response. No business logic or DB access here.
 */
const asyncHandler = require('../utils/asyncHandler');
const classService = require('../services/class.service');

exports.list = asyncHandler(async (req, res) => {
  const classes = await classService.list({}, { page: req.query.page, limit: req.query.limit });
  res.json(classes);
});

exports.listByProgram = asyncHandler(async (req, res) => {
  const classes = await classService.listByProgram(req.params.programId);
  res.json(classes);
});

exports.getById = asyncHandler(async (req, res) => {
  const classData = await classService.getById(req.params.id);
  res.json(classData);
});

exports.create = asyncHandler(async (req, res) => {
  const created = await classService.create(req.body);
  res.status(201).json({ message: 'Class added successfully', class: created });
});

exports.update = asyncHandler(async (req, res) => {
  const updated = await classService.update(req.params.id, req.body);
  res.json({ message: 'Class updated successfully', class: updated });
});

exports.remove = asyncHandler(async (req, res) => {
  await classService.remove(req.params.id);
  res.json({ message: 'Class deleted successfully' });
});
