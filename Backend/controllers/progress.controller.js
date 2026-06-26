/**
 * Progress controller — HTTP layer: reads the request, calls the service,
 * shapes the response. No business logic or DB access here.
 */
const asyncHandler = require('../utils/asyncHandler');
const progressService = require('../services/progress.service');

exports.logSession = asyncHandler(async (req, res) => {
  const sessionLog = await progressService.logSession(req.body);
  res.status(201).json({
    message: 'Session logged successfully',
    sessionLog
  });
});

exports.getSubjectProgress = asyncHandler(async (req, res) => {
  const { subjectId, classId } = req.params;
  const result = await progressService.getSubjectProgress(subjectId, classId);
  res.json(result);
});

exports.getClassProgress = asyncHandler(async (req, res) => {
  const result = await progressService.getClassProgress(req.params.classId);
  res.json(result);
});

exports.getCompliance = asyncHandler(async (req, res) => {
  const result = await progressService.getCompliance(req.params.classId);
  res.json(result);
});

exports.getTeacherSessions = asyncHandler(async (req, res) => {
  const { teacherId } = req.params;
  const { startDate, endDate } = req.query;
  const result = await progressService.getTeacherSessions(teacherId, startDate, endDate);
  res.json(result);
});

exports.initialize = asyncHandler(async (req, res) => {
  const result = await progressService.initialize(req.params.classId, req.body);
  res.json(result);
});
