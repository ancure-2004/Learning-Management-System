/**
 * Attendance controller — HTTP layer: reads the request, calls the service,
 * shapes the response. No business logic or DB access here.
 */
const asyncHandler = require('../utils/asyncHandler');
const attendanceService = require('../services/attendance.service');

exports.classStudents = asyncHandler(async (req, res) => {
  const result = await attendanceService.classStudents(req.params.classId);
  res.json(result);
});

exports.mark = asyncHandler(async (req, res) => {
  const result = await attendanceService.mark(req.body, req.user._id);
  res.status(201).json(result);
});

exports.sessions = asyncHandler(async (req, res) => {
  const result = await attendanceService.sessions(req.params.classId, req.query);
  res.json(result);
});

exports.summary = asyncHandler(async (req, res) => {
  const result = await attendanceService.summary(req.params.classId, req.query);
  res.json(result);
});

exports.my = asyncHandler(async (req, res) => {
  const result = await attendanceService.my(req.user._id);
  res.json(result);
});

exports.teacherRecent = asyncHandler(async (req, res) => {
  const result = await attendanceService.teacherRecent(req.params.teacherId);
  res.json(result);
});
