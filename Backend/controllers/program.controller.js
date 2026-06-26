/**
 * Program controller — HTTP layer: reads the request, calls the service,
 * shapes the response. No business logic or DB access here.
 */
const asyncHandler = require('../utils/asyncHandler');
const programService = require('../services/program.service');

exports.list = asyncHandler(async (req, res) => {
  const programs = await programService.list({}, { page: req.query.page, limit: req.query.limit });
  res.json(programs);
});

exports.listByDepartment = asyncHandler(async (req, res) => {
  const programs = await programService.listByDepartment(req.params.departmentId);
  res.json(programs);
});

exports.getById = asyncHandler(async (req, res) => {
  const program = await programService.getById(req.params.id);
  res.json(program);
});

exports.create = asyncHandler(async (req, res) => {
  const program = await programService.create(req.body);
  res.status(201).json({ message: 'Program added successfully', program });
});

exports.update = asyncHandler(async (req, res) => {
  const program = await programService.update(req.params.id, req.body);
  res.json({ message: 'Program updated successfully', program });
});

exports.remove = asyncHandler(async (req, res) => {
  await programService.remove(req.params.id);
  res.json({ message: 'Program deleted successfully' });
});
