/**
 * Leave controller — HTTP layer: reads the request, calls the service,
 * shapes the response. No business logic or DB access here.
 *
 * Socket.IO/notification side-effects live in the service, which delegates to
 * notificationService (it owns the io instance internally).
 */
const asyncHandler = require('../utils/asyncHandler');
const leaveService = require('../services/leave.service');

exports.create = asyncHandler(async (req, res) => {
  const leave = await leaveService.create(req.body, req.user._id);
  res.status(201).json({ message: 'Leave application submitted successfully', leave });
});

exports.my = asyncHandler(async (req, res) => {
  const result = await leaveService.my(req.user._id);
  res.json(result);
});

exports.pending = asyncHandler(async (req, res) => {
  const result = await leaveService.pending();
  res.json(result);
});

exports.overrides = asyncHandler(async (req, res) => {
  const result = await leaveService.overrides(req.query);
  res.json(result);
});

exports.list = asyncHandler(async (req, res) => {
  const result = await leaveService.list(req.query);
  res.json(result);
});

exports.getById = asyncHandler(async (req, res) => {
  const leave = await leaveService.getById(req.params.id);
  res.json(leave);
});

exports.approve = asyncHandler(async (req, res) => {
  const result = await leaveService.approve(req.params.id, req.body, req.user._id);
  res.json(result);
});

exports.reject = asyncHandler(async (req, res) => {
  const result = await leaveService.reject(req.params.id, req.body, req.user._id);
  res.json(result);
});

exports.remove = asyncHandler(async (req, res) => {
  const result = await leaveService.remove(req.params.id, req.user._id);
  res.json(result);
});
