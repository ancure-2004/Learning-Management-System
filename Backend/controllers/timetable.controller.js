/**
 * Timetable controller — HTTP layer: reads the request, calls the service,
 * shapes the response. No business logic or DB access here.
 */
const asyncHandler = require('../utils/asyncHandler');
const timetableService = require('../services/timetable.service');
const notificationService = require('../services/notificationService');

// Generate a timetable for ONE class — conflict-free against all other classes.
exports.generate = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const { academicYear, adaptiveMode = false } = req.body;

  const { timetable, solverData, classData } = await timetableService.generateForClass(classId, {
    academicYear,
    adaptiveMode,
    userId: req.user._id, // identity from the verified token, never the body
  });

  try {
    await notificationService.notifyTimetableChange({
      timetableId: timetable._id,
      className: classData.name,
      action: 'generated',
    });
  } catch (e) {
    console.warn('Timetable notification failed:', e.message);
  }

  res.json({
    status: 'success',
    message: `Timetable generated successfully!${adaptiveMode ? ' (Adaptive Mode)' : ''}`,
    timetable: solverData.timetable,
    timetableId: timetable._id,
    adaptiveMode,
    allocationSummary: solverData.allocation_summary || null,
    statistics: solverData.statistics || null,
    classInfo: { name: classData.name, code: classData.code, semester: classData.semester },
  });
});

// Generate timetables for ALL (or selected) classes sequentially, keeping the
// whole institution conflict-free.
exports.generateAll = asyncHandler(async (req, res) => {
  const { classIds, academicYear, adaptiveMode = false } = req.body;
  const summary = await timetableService.generateAll({
    classIds,
    academicYear,
    adaptiveMode,
    userId: req.user._id,
  });
  res.json({ status: 'success', ...summary });
});

exports.list = asyncHandler(async (req, res) => {
  const timetables = await timetableService.list({ page: req.query.page, limit: req.query.limit });
  res.json(timetables);
});

exports.getById = asyncHandler(async (req, res) => {
  const timetable = await timetableService.getById(req.params.id);
  res.json(timetable);
});

exports.getByClass = asyncHandler(async (req, res) => {
  const timetables = await timetableService.getByClass(req.params.classId);
  res.json(timetables);
});

exports.getForTeacher = asyncHandler(async (req, res) => {
  const schedule = await timetableService.getForTeacher(req.params.teacherId);
  res.json(schedule);
});

exports.getForStudent = asyncHandler(async (req, res) => {
  const schedule = await timetableService.getForStudent(req.params.studentId);
  res.json(schedule);
});

exports.publish = asyncHandler(async (req, res) => {
  const timetable = await timetableService.publish(req.params.id);
  res.json({ message: 'Timetable published successfully', timetable });
});

exports.remove = asyncHandler(async (req, res) => {
  await timetableService.remove(req.params.id);
  res.json({ message: 'Timetable deleted successfully' });
});

exports.validateSlot = asyncHandler(async (req, res) => {
  const result = await timetableService.validateSlot(req.params.id, req.body);
  res.json(result);
});

exports.saveEdit = asyncHandler(async (req, res) => {
  const timetable = await timetableService.saveEdit(req.params.id, req.body, req.user._id);
  res.json({ message: 'Timetable updated successfully', timetable });
});

exports.getHistory = asyncHandler(async (req, res) => {
  const result = await timetableService.getHistory(req.params.id);
  res.json(result);
});

exports.revert = asyncHandler(async (req, res) => {
  const { id, versionNumber } = req.params;
  const timetable = await timetableService.revert(id, versionNumber, req.user._id);
  res.json({ message: `Reverted to version ${versionNumber}`, timetable });
});
