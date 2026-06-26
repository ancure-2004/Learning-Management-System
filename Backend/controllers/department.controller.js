/**
 * Department controller — HTTP layer: reads the request, calls the service,
 * shapes the response. No business logic or DB access here.
 */
const asyncHandler = require('../utils/asyncHandler');
const departmentService = require('../services/department.service');

exports.list = asyncHandler(async (req, res) => {
  const departments = await departmentService.list({}, { page: req.query.page, limit: req.query.limit });
  res.json(departments);
});

exports.getOne = asyncHandler(async (req, res) => {
  const department = await departmentService.getOne(req.params.id);
  res.json(department);
});

exports.create = asyncHandler(async (req, res) => {
  const department = await departmentService.create(req.body);
  res.status(201).json({ message: 'Department added successfully', department });
});

exports.update = asyncHandler(async (req, res) => {
  const department = await departmentService.update(req.params.id, req.body);
  res.json({ message: 'Department updated successfully', department });
});

exports.remove = asyncHandler(async (req, res) => {
  await departmentService.remove(req.params.id);
  res.json({ message: 'Department deleted successfully' });
});
